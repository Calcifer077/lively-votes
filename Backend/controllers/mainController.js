import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, count, sql, asc, inArray, notInArray } from "drizzle-orm";

import { OptionTable, PollTable, UsersTable, VoteTable } from "../db/schema.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { io } from "../app.js";

const db = drizzle(process.env.DATABASE_URL);

/**
 * It returns all polls regardless of any condition.
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

  res.status(200).json({
    status: "success",
    data: data,
  });
});

// Helper function for pagination function
// Returns all the polls that the user has participated in, only their ids
const pollsUserHaveParticipatedIn = async function (userId) {
  const res = await db
    .select({ id: VoteTable.poll_id })
    .from(VoteTable)
    .where(eq(VoteTable.user_id, userId));

  return res;
};

/**
 * This function will return polls with pagination.
 * Will accept page number and return the polls for that page.
 * What it returns
 * data:[
 *  {
 *    id: Id of poll,
 *    question: question of poll,
 *    user_id: Id of the user who created this poll,
 *    user: [
 *      id: Id of user,
 *      email: Email of user
 *    ],
 *    // Array of options belonging to this poll
 *    options: [
 *      {
 *         id: Id of option
 *         text: Text of option
 *         poll_id: Id of poll which this option belong to.
 *      }
 *    ]
 *   }
 * ]
 */

export const getPollsWithPagination = catchAsync(
  async function (req, res, next) {
    // The user is authenticated
    const userId = res.user.id;

    const [userFromDatabase] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.id, userId));

    if (!userFromDatabase) {
      return next(new AppError("No User found with this ID", 401));
    }

    // we will not be returning those polls in which user have voted in.
    const pollsUserHaveParticipatedInArr =
      await pollsUserHaveParticipatedIn(userId);

    const pollsUserVotedIn = [];

    pollsUserHaveParticipatedInArr.map((el) => pollsUserVotedIn.push(el.id));

    // data to be returned.
    let data = [];

    const page = req.params.page;
    const numberOfRowsPerRes = 9;

    // will store all the PollTable.id inside it which we have fetched.
    const pollIds = [];

    // 1. get total number of polls for this user and those polls page by page.
    // get the number of those polls in which user have not voted in / participated in.
    const [totalRowsInPollTable] = await db
      .select({ count: count() })
      .from(PollTable)
      .where(notInArray(PollTable.id, pollsUserVotedIn));

    // get those polls in which user have not voted in / participated in
    // limit -> tells how many result will come
    // offset -> from where (kind of like index) it will start
    const polls = await db
      .select({
        id: PollTable.id,
        question: PollTable.question,
        user_id: PollTable.user_id,
      })
      .from(PollTable)
      .orderBy(asc(PollTable.id))
      .limit(numberOfRowsPerRes)
      .offset((page - 1) * numberOfRowsPerRes)
      .where(notInArray(PollTable.id, pollsUserVotedIn));

    data = [...polls];

    // 2. Get the user that created polls found in above step
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
      pollIds.push(el.id);
    }

    // 3. Get options for above polls
    // this will contain all the options for the polls which we fetched in the above step.
    const optionsForAllPollsInAboveStep = await db
      .select({
        id: OptionTable.id,
        text: OptionTable.text,
        poll_id: OptionTable.poll_id,
      })
      .from(OptionTable)
      // will return those polls who have their poll_ids present in the pollIds array.
      .where(inArray(OptionTable.poll_id, pollIds));

    // go one by one through each option and push them into their respective polls.
    optionsForAllPollsInAboveStep.map((el) => {
      // find the poll into which we will push it.
      const pollToBeUpdated = data.find((item) => item.id === el.poll_id);

      // if that poll exist
      if (pollToBeUpdated) {
        // push this option into that polls option array.
        pollToBeUpdated.options.push(el);
      }
    });

    res.status(200).json({
      status: "success",
      data: data,
      page: Number(page),
      rowsPerPage: numberOfRowsPerRes,
      totalRows: totalRowsInPollTable.count,
      totalPages: Math.ceil(totalRowsInPollTable.count / numberOfRowsPerRes),
    });
  },
);

/**
 * Create a new poll
 * User should be authenticated for this to work
 * Needs questions and options from req.body
 * What it returns
 * data : {
 *  id: id from poll table (pollId)
 *  question: question from poll table
 *  user_id: user_id from poll table
 *  Aray of options created for this poll
 *  options:
 *    [
 *      id: id of option
 *      text: text of option
 *      poll_id: poll_id of option to which it belongs
 *    ]
 *  }
 */

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
    data: dataToReturn,
  });
});

// A error handling, helper function used to create a vote in database
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

// creates new vote in the database, user should be authenticated for this.

/**
 * Creates a new vote in the database
 * User should be authenticated for this
 * Updates in case vote is already present
 * what it returns:
 * {
 *  id: id from vote table
 *  user_id: user_id of user who voted
 *  poll_id: poll_id of poll to which this vote belongs
 *  option_id: option_id of the option on which vote was casted
 * }
 */
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

    // this event will be emitted when a vote has already been casted and user changed his vote.
    io.emit("votes:caste", pollId);

    return res.status(200).json({
      status: "success",
      data: dataToReturn,
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

  // this event will be emitted when the user is casting vote for the very first time.
  io.emit("votes:caste", pollId);

  res.status(201).json({
    status: "success",
    data: dataToReturn,
  });
});

/**
 * Count votes for a poll using its pollId
 * What it needs -> parameters from req.params (pollId)
 * User needs to be authenticated for this
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

  // This user is authenticated
  const userId = res.user.id;

  const [userFromDatabase] = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.id, userId));

  if (!userFromDatabase) {
    return next(new AppError("No User found with this ID", 401));
  }

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

  const dataToReturn = {
    pollId,
    options: results,
  };

  res.status(200).json({
    status: "success",
    data: dataToReturn,
  });
});

/**
 * Returns the options which is voted by the current user for a particular poll
 * User is required to be authenticated for this to work.
 * It needs pollId from params.
 * what it returns:
 * {
 *  optionId: which option is voted by this user.
 * }
 * If there is not vote by this user it will return 0.
 */
export const whichOptionVoted = catchAsync(async function (req, res, next) {
  const { pollId } = req.params;

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
