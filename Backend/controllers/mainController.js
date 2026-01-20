import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, count, sql } from "drizzle-orm";

import { OptionTable, PollTable, UsersTable, VoteTable } from "../db/schema.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const db = drizzle(process.env.DATABASE_URL);

/**
 * what it returns
 * data: [
 *  {
 *    id: id from polls table,
 *    question: question from polls table,
 *    user_id: user who created this poll,
 *    user: [
 *      id: user id same as above,
 *      email: email of user,
 *    ],
 *    options: [
 *      {
 *        id: id from options table,
 *        text: text of the option,
 *        poll_id: poll_id to which this option is connected
 *      }
 *    ]
 *  }
 * ]
 */

// Version - 1
export const getAllPolls = catchAsync(async function (req, res, next) {
  let data = [];

  // 1. Get polls.
  const polls = await db
    .select({
      id: PollTable.id,
      question: PollTable.question,
      user_id: PollTable.user_id,
    })
    .from(PollTable);

  // No polls were found
  if (!polls) {
    return res.status(200).json({
      status: "success",
      data: [],
    });
  }

  data = [...polls];

  // 2. Get the user that created that poll.
  for (const el of data) {
    const user = await db
      .select({
        id: UsersTable.id,
        email: UsersTable.email,
      })
      .from(UsersTable)
      .where(eq(UsersTable.id, el.user_id));

    el.user = user;
    el.options = [];
  }

  // 3. Get options for all the polls.
  const options = await db
    .select({
      id: OptionTable.id,
      text: OptionTable.text,
      poll_id: OptionTable.poll_id,
    })
    .from(OptionTable);

  for (const el of options) {
    for (const polls of data) {
      if (polls.id === el.poll_id) {
        polls.options = [...polls.options, el];
        break;
      }
    }
  }

  // console.log(data);

  res.status(200).json({
    status: "success",
    data: data,
  });
});

export const createPoll = catchAsync(async function (req, res, next) {
  // 1. Get data from req.body
  // What we need, question, userid, options (will be a array)
  const question = req.body.question;
  const options = req.body.options;

  // The user is authenticated
  const userId = res.user.id;

  // Give a error if there is no question
  if (!question) {
    return next(new AppError("Please enter a valid question", 400));
  }

  // Give a error if the number of options is less than 2.
  if (options.length < 2) {
    return next(new AppError("Please give more than one option", 400));
  }

  // Check if the user exists?
  const [userFromDatabase] = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.id, userId));

  // Give a error if the user doesn't exist.
  if (!userFromDatabase) {
    return next(new AppError("No User found with this ID", 401));
  }

  // 2. Feed data into database.
  const dataToReturn = await db.transaction(async (tx) => {
    const poll = {
      question: question,
      user_id: userId,
    };

    const [pollThatWasCreated] = await tx
      .insert(PollTable)
      .values(poll)
      .returning();

    const pollId = pollThatWasCreated.id;

    const optionsToInsert = options.map((el) => ({
      text: el.text,
      poll_id: pollId,
    }));

    const createdOptions = await tx
      .insert(OptionTable)
      .values(optionsToInsert)
      .returning();

    return {
      ...pollThatWasCreated,
      options: createdOptions,
    };
  });

  res.status(201).json({
    status: "success",
    data: {
      dataToReturn,
    },
  });
});

// A error handling function
async function createVote(vote) {
  try {
    const [voteThatWasCreated] = await db
      .insert(VoteTable)
      .values(vote)
      .returning();

    return voteThatWasCreated;
  } catch (err) {
    if (err.cause.code === "23505") {
      throw new AppError("You can't vote to the same poll twice.", 409);
    }

    throw err;
  }
}

export const castVote = catchAsync(async function (req, res, next) {
  // 1. Get data from req body
  // what we need, userId, pollId, optionId

  const pollId = req.body.pollId;
  const optionId = req.body.optionId;

  // The user is authenticated
  const userId = res.user.id;

  const [userFromDatabase] = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.id, userId));

  // Give error if the user doesn't exist.
  if (!userFromDatabase) {
    return next(new AppError("No User found with this ID", 401));
  }

  const [pollFromDatabase] = await db
    .select()
    .from(PollTable)
    .where(eq(PollTable.id, pollId));

  // Give error if the poll doesn't exist
  if (!pollFromDatabase) {
    return next(new AppError("No poll found with this ID", 401));
  }

  // Give error if the user tries to poll on its own poll.
  if (pollFromDatabase.user_id === userId) {
    return next(new AppError(`You can't vote on your own poll`, 401));
  }

  const [optionFromDatabase] = await db
    .select()
    .from(OptionTable)
    .where(and(eq(OptionTable.id, optionId), eq(OptionTable.poll_id, pollId)));

  // Give error if the option doesn't exist
  if (!optionFromDatabase) {
    return next(
      new AppError("This option does not belong to the specified Poll", 400),
    );
  }

  const [voteFromDatabase] = await db
    .select()
    .from(VoteTable)
    .where(and(eq(VoteTable.poll_id, pollId), eq(VoteTable.user_id, userId)));

  if (voteFromDatabase) {
    // update
    const dataToReturn = await db
      .update(VoteTable)
      .set({ option_id: optionId })
      .where(and(eq(VoteTable.poll_id, pollId), eq(VoteTable.user_id, userId)))
      .returning();

    return res.status(201).json({
      status: "success",
      data: {
        dataToReturn,
      },
    });
  }

  const vote = {
    user_id: userId,
    poll_id: pollId,
    option_id: optionId,
  };

  // 2. Feed data to the database
  // we are delegating work to another function for error handling.
  // We have added constraint to the schema but the error shown to the user will be too technical, so the below function will throw a well formatted error.
  const dataToReturn = await createVote(vote);

  res.status(201).json({
    status: "success",
    data: {
      dataToReturn,
    },
  });
});

/**
 * What it needs -> parameters from req.params (pollId)
 * What it returns -> dataToReturn
 * dataToReturn : {
 *  pollId: id from poll table (pollId) from above step
 *  options: [
 *    {
 *      optionId: id from options table,
 *      optionText: text of option from options table,
 *      voteCount: occurance of this option in votes table
 *    }
 *  ]
 * }
 */

// version - 1
/*
  export const countVotes = catchAsync(async function (req, res, next) {
    // 1. go to poll table, will count votes for each option.
    // need poll id

    const pollId = req.params.pollId;

    const [pollFromDatabase] = await db
      .select()
      .from(PollTable)
      .where(eq(PollTable.id, pollId));

    if (!pollFromDatabase) {
      return next(new AppError("No poll was found of this ID", 401));
    }

    const dataToReturn = {
      pollId: pollFromDatabase.id,
      options: [],
    };

    // 2. go to option table for the options that we got in the above step.

    const optionFromDatabase = await db
      .select()
      .from(OptionTable)
      .where(eq(OptionTable.poll_id, pollFromDatabase.id));

    dataToReturn.options = optionFromDatabase.map((el) => {
      return { optionId: el.id, optionText: el.text, voteCount: 0 };
    });

    // 3. count number of occurances of option id in votes table
    for (const el of dataToReturn.options) {
      const [countVotes] = await db
        .select({ count: count() })
        .from(VoteTable)
        .where(eq(VoteTable.option_id, el.optionId));

      el.voteCount = countVotes.count;
    }

    res.status(200).json({
      status: "success",
      data: dataToReturn,
    });
  });
*/

// version - 2
export const countVotes = catchAsync(async function (req, res, next) {
  const { pollId } = req.params;

  // 1. Join OptionTable with VoteTable and count occurrences in one go
  const results = await db
    .select({
      optionId: OptionTable.id,
      optionText: OptionTable.text,
      voteCount: sql`count(${VoteTable.id})`.mapWith(Number),
    })
    .from(OptionTable)
    .leftJoin(VoteTable, eq(OptionTable.id, VoteTable.option_id))
    .where(eq(OptionTable.poll_id, pollId))
    .groupBy(OptionTable.id)
    .orderBy(OptionTable.id);

  if (!results.length) {
    // Check if poll exists at all if results are empty
    const [pollExists] = await db
      .select()
      .from(PollTable)
      .where(eq(PollTable.id, pollId));

    if (!pollExists)
      return next(new AppError("No poll found with this ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      pollId,
      options: results,
    },
  });
});

export const whichOptionVoted = catchAsync(async function (req, res, next) {
  const { pollId } = req.params;

  // console.log("route hit", pollId);

  // The user is authenticated
  const userId = res.user.id;

  // check if the user is present in the db
  const [userFromDatabase] = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.id, userId));

  if (!userFromDatabase) {
    return next(new AppError("No User found with this ID", 401));
  }

  // get all options for this poll
  const options = await db
    .select()
    .from(OptionTable)
    .where(eq(OptionTable.poll_id, pollId));

  // go to votes table and check if there is any vote by this user for any of these options
  for (const el of options) {
    const [voteFromDatabase] = await db
      .select()
      .from(VoteTable)
      .where(
        and(eq(VoteTable.user_id, userId), eq(VoteTable.option_id, el.id)),
      );

    // console.log(voteFromDatabase);

    if (voteFromDatabase) {
      return res.status(200).json({
        status: "success",
        data: { optionId: el.id },
      });
    }
  }

  res.status(200).json({
    status: "success",
    data: { optionId: 0 },
  });
});
