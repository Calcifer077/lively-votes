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
