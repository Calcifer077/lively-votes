import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, sql, count } from "drizzle-orm";

import { UsersTable, VoteTable, PollTable, OptionTable } from "../db/schema.js";
import catchAsync from "../utils/catchAsync.js";

const db = drizzle(process.env.DATABASE_URL);

/**
 * Get user data
 * Needs user to be authenticated
 * Gets user ID from res.user
 * returns user data along with number of polls created and participated in
 * format of result:
 * {
 *   status: "success",
 *   data: {
 *     user: {
 *       id: UsersTable.id,
 *       name: UsersTable.name,
 *       email: UsersTable.email
 *     },
 *     pollsCreated: number,
 *     pollsParticipated: number
 *   }
 * }
 */

// Version - 1
/*
export const getUserData = catchAsync(async function (req, res, next) {
  // The user is authenticated, we can get his data from res.user
  const userId = res.user.id;

  const dataToReturn = {};

  // User data from database
  const [userFromDatabase] = await db
    .select({
      id: UsersTable.id,
      name: UsersTable.name,
      email: UsersTable.email,
    })
    .from(UsersTable)
    .where(eq(UsersTable.id, userId));

  dataToReturn.user = userFromDatabase;

  // Get number of polls created by the user
  const [pollsCreated] = await db
    .select({ count: count() })
    .from(PollTable)
    .where(eq(PollTable.user_id, userId));

  dataToReturn.pollsCreated = pollsCreated.count;

  // Get number of polls participated by the user
  const [pollsParticipated] = await db
    .select({ count: count() })
    .from(VoteTable)
    .where(eq(VoteTable.user_id, userId));

  dataToReturn.pollsParticipated = pollsParticipated.count;

  res.status(200).json({
    status: "success",
    data: { data: dataToReturn },
  });
});
*/

// Version - 2, using joins and groupBy
export const getUserData = catchAsync(async function (req, res, next) {
  // The user is authenticated, we can get his data from res.user
  const userId = res.user.id;

  const [dataToReturn] = await db
    .select({
      user: {
        id: UsersTable.id,
        name: UsersTable.name,
        email: UsersTable.email,
      },
      pollsCreated: sql`count(distinct ${PollTable.id})`.mapWith(Number),
      pollsParticipated: sql`count(distinct ${VoteTable.id})`.mapWith(Number),
    })
    .from(UsersTable)
    .where(eq(UsersTable.id, userId))
    .leftJoin(PollTable, eq(UsersTable.id, PollTable.user_id))
    .leftJoin(VoteTable, eq(UsersTable.id, VoteTable.user_id))
    .groupBy(UsersTable.id);

  res.status(200).json({
    status: "success",
    data: { data: dataToReturn },
  });
});

/**
 * Get polls user have voted in
 * Needs user to be authenticated
 * Gets user ID from res.user
 * returns list of polls user have voted in
 * format of result:
 * {
 *   status: "success",
 *   data: [
 *    {
 *      pollId: PollTable.id
 *      question: PollTable.question
 *      options:
 *        [
 *          {
 *            id: OptionTable.id,
 *            text: OptionTable.text
 *          }
 *        ]
 *    }
 * ]
 */
export const getPollsUserHaveVotedIn = catchAsync(
  async function (req, res, next) {
    // The user is authenticated, we can get his data from res.user
    const userId = res.user.id;

    const dataToReturn = [];

    // Get polls user have voted in
    // Using orderBy to ensure consistent order
    const pollsUserVotedIn = await db
      .select({ pollId: VoteTable.poll_id })
      .from(VoteTable)
      .where(eq(VoteTable.user_id, userId))
      .orderBy(VoteTable.poll_id);

    for (const poll of pollsUserVotedIn) {
      // Get poll details
      const [pollDetails] = await db
        .select({ pollId: PollTable.id, question: PollTable.question })
        .from(PollTable)
        .where(eq(PollTable.id, poll.pollId));

      // Get options for this poll
      // Using order by to ensure options are in consistent order
      const optionsForThisPoll = await db
        .select({ id: OptionTable.id, text: OptionTable.text })
        .from(OptionTable)
        .where(eq(OptionTable.poll_id, pollDetails.pollId))
        .orderBy(OptionTable.id);

      // Combine poll details and options
      dataToReturn.push({
        ...pollDetails,
        options: optionsForThisPoll,
      });
    }

    res.status(200).json({
      status: "success",
      data: { data: dataToReturn },
    });
  },
);

// This is the updated version of above function with pagination
export const getPollsUserHaveVotedInWithPagination = catchAsync(
  async function (req, res, next) {
    const userId = res.user.id;

    const page = req.params.page;
    const numberOfRowsPerRes = Number(process.env.NUMBER_OF_ROWS_PER_RES);

    const [totalRowsInResult] = await db
      .select({ count: count() })
      .from(VoteTable)
      .where(eq(VoteTable.user_id, userId));

    // This is a subquery, you don't await a subquery, it will be run when you await the main query
    // This query is responsible for getting all the polls user have voted in.
    // We have only selected pollId, because it is the only thing needed by the main query
    const sq = db
      .select({ pollId: VoteTable.poll_id })
      .from(VoteTable)
      .where(eq(VoteTable.user_id, userId))
      .limit(numberOfRowsPerRes)
      .offset((page - 1) * numberOfRowsPerRes)
      .as("sq");

    // Get all the required data.
    const results = await db
      .select({
        pollId: PollTable.id,
        question: PollTable.question,
        optionId: OptionTable.id,
        optionText: OptionTable.text,
      })
      .from(sq)
      .innerJoin(PollTable, eq(sq.pollId, PollTable.id))
      .innerJoin(OptionTable, eq(PollTable.id, OptionTable.poll_id))
      .orderBy(PollTable.id, OptionTable.id);

    // Format data for frontend, using reduce
    // How this works?
    // It will go through the above result, and form a nested array of polls, with options
    // 'acc' is the accumulator, which is the array that is returned by previous callback, 'row' is the current row
    // last [] is the initial value
    const dataToReturn = results.reduce((acc, row) => {
      let poll = acc.find((p) => p.pollId === row.pollId);

      // If it isn't found, meaning that this is the first time we are encountering this poll, so add a new poll else just update the already existing poll.
      if (!poll) {
        poll = {
          pollId: row.pollId,
          question: row.question,
          options: [],
        };

        acc.push(poll);
      }

      poll.options.push({
        id: row.optionId,
        text: row.optionText,
      });

      return acc;
    }, []);

    res.status(200).json({
      status: "success",
      data: dataToReturn,
      page: Number(page),
      rowsPerPage: numberOfRowsPerRes,
      totalRows: totalRowsInResult.count,
      totalPages: Math.ceil(totalRowsInResult.count / numberOfRowsPerRes),
    });
  },
);
