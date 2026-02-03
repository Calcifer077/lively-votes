import bcrypt from "bcrypt";
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import jwt, { decode } from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { UsersTable } from "../db/schema.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const db = drizzle(process.env.DATABASE_URL);

const accessTokenSecretKey = process.env.JWT_SECRET_ACCESS_TOKEN;
const accessTokenExpiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN;
const refreshTokenSecretKey = process.env.JWT_SECRET_REFRESH_TOKEN;
const refreshTokenExpiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN;

// will create access token and returns it.
function createAcessToken(payload) {
  const options = {
    expiresIn: Number(accessTokenExpiresIn) * 60 * 1000,
  };

  const token = jwt.sign(payload, accessTokenSecretKey, options);

  // const cookieOption = {
  //   expires: new Date(
  //     Date.now() + Number(accessTokenExpiresIn) * 24 * 60 * 60 * 1000,
  //   ),
  //   httpOnly: true,
  // };

  return token;
}

// will create refresh token, set it as cookie and return it
function createRefreshToken(payload, res) {
  const options = {
    expiresIn: Number(refreshTokenExpiresIn) * 24 * 60 * 60 * 1000,
  };

  const token = jwt.sign(payload, refreshTokenSecretKey, options);

  const cookieOption = {
    expires: new Date(
      Date.now() + Number(refreshTokenExpiresIn) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  res.cookie("refreshToken", token, cookieOption);

  return token;
}

// function createAndSendToken(payload, res) {
//   const options = {
//     // 2 days
//     expiresIn: Number(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000,
//   };

//   const token = jwt.sign(payload, secretKey, options);

//   const cookieOption = {
//     expires: new Date(
//       Date.now() + Number(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000,
//     ),
//     httpOnly: true,
//   };

//   return token;
// }

// To verify access token
function verfiyAcessToken(token) {
  const res = jwt.verify(token, accessTokenSecretKey);

  return res;
}

// Verify refresh token
function verfiyRefreshToken(token) {
  const res = jwt.verify(token, refreshTokenSecretKey);

  return res;
}

// function verifyToken(token) {
//   const res = jwt.verify(token, secretKey);

//   return res;
// }

function validateEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

// A error handling function
async function createUser(user) {
  try {
    const [userThatWasCreated] = await db
      .insert(UsersTable)
      .values(user)
      .returning();

    return userThatWasCreated;
  } catch (err) {
    if (err.cause.code === "23505") {
      throw new AppError(
        "A user with this email already exists. Please login",
        409,
      );
    }

    throw err;
  }
}

// Number of hashing rounds.
const saltRounds = 5;

export const signUp = catchAsync(async function (req, res, next) {
  // What to do?
  // 1. Get data from the user
  const { name, email, password } = req.body;

  // The email given is invalid.
  if (!validateEmail(email)) {
    return next(new AppError("Email is invalid", 401));
  }

  // 2. Feed data into the database with encrypted password
  // Hash the password and send to database.
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = {
    name,
    email,
    password: hashedPassword,
  };

  const userThatWasCreated = await createUser(user);

  const payloadForToken = {
    id: userThatWasCreated.id,
    email: userThatWasCreated.email,
  };

  // 3. Create a jwt and send with the request
  // const token = createAndSendToken(payloadForToken, res);
  const accessToken = createAcessToken(payloadForToken);
  const refreshToken = createRefreshToken(payloadForToken, res);

  res.status(201).json({
    status: "success",
    accessToken,
    refreshToken,
    data: {
      user: userThatWasCreated,
    },
  });
});

export const login = catchAsync(async function (req, res, next) {
  // Get data from the body.
  const { email, password } = req.body;

  // There was no email
  if (!email) {
    return next(new AppError("Please provide a email", 401));
  }

  // There was no password
  if (!password) {
    return next(new AppError("Please provide password", 401));
  }

  // The email given is invalid.
  if (!validateEmail(email)) {
    return next(new AppError("Email is invalid", 401));
  }

  // get user from database, and compare both of them.
  const [userFromDatabase] = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.email, email));

  if (!userFromDatabase) {
    return next(new AppError("There is no user with this email ID", 401));
  }

  const passwordComparison = await bcrypt.compare(
    password,
    userFromDatabase.password,
  );

  if (!passwordComparison) {
    return next(new AppError("Provided password is incorrect", 401));
  }
  const payloadForToken = {
    id: userFromDatabase.id,
    email: userFromDatabase.email,
  };

  // 3. Create a jwt and send with the request
  // const token = createAndSendToken(payloadForToken, res);
  const accessToken = createAcessToken(payloadForToken);
  const refreshToken = createRefreshToken(payloadForToken, res);

  res.status(200).json({
    status: "success",
    accessToken,
    refreshToken,
    data: {
      user: userFromDatabase,
    },
  });
});

// This controller is for refresh token
// Will be called when their is unauthorized access to the app.
// It will first verify the user from refresh token, which is stored in cookies.
// Try to find a user using this refresh token, if the user is found.
// Send new access and refresh token
export const refresh = catchAsync(async function (req, res, next) {
  let token;

  if (req.cookies.refreshToken) {
    token = req.cookies.refreshToken;
  }

  // There is no token present.
  if (!token) {
    return next(new AppError("You are not logged in. Please log in.", 401));
  }

  // 2. verify token
  const decoded = verfiyRefreshToken(token);

  const [userFromDatabase] = await db
    .select({
      id: UsersTable.id,
      email: UsersTable.email,
    })
    .from(UsersTable)
    .where(eq(UsersTable.id, decoded.id));

  if (!userFromDatabase) {
    return next(new AppError("Something went wrong. Please login again.", 401));
  }

  // get new access and refresh token
  const payloadForToken = {
    id: userFromDatabase.id,
    email: userFromDatabase.email,
  };

  // Create new access and refresh token
  const accessToken = createAcessToken(payloadForToken);
  const refreshToken = createRefreshToken(payloadForToken, res);

  res.status(200).json({
    status: "success",
    data: {
      accessToken: accessToken,
    },
  });
});

// this will rely on refresh token
export const protect = catchAsync(async function (req, res, next) {
  // 1. get the token
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) token = req.cookies.jwt;

  // There is no token present.
  if (!token) {
    return next(new AppError("You are not logged in. Please log in.", 401));
  }

  // 2. verify token
  const decoded = verfiyAcessToken(token);

  const [userFromDatabase] = await db
    .select({
      id: UsersTable.id,
      email: UsersTable.email,
    })
    .from(UsersTable)
    .where(eq(UsersTable.id, decoded.id));

  if (!userFromDatabase) {
    return next(new AppError("Something went wrong. Please login again.", 401));
  }

  // 3. grant access
  res.user = userFromDatabase;
  next();
});

export const logout = catchAsync(async function (req, res, next) {
  // 1. Reset the cookie
  res.cookie("jwt", "loggedout");

  res.setHeader("authorization", " ");

  // 2. Send response
  res.status(200).json({
    message: "success",
    token: null,
  });
});
