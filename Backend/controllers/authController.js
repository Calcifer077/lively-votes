import bcrypt from "bcrypt";
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import jwt, { decode } from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { UsersTable } from "../db/schema.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { supabase } from "../utils/supabase.js";

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

function setRefreshTokenInCookie(token, res) {
  const cookieOption = {
    expires: new Date(
      Date.now() + Number(refreshTokenExpiresIn) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  res.cookie("refreshToken", token, cookieOption);

  return token;
}

export const signUpWithSupabase = catchAsync(async function (req, res, next) {
  const { name, email, password } = req.body;

  if (!validateEmail(email)) {
    return next(new AppError("Email is invalid", 401));
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = {
    name,
    email,
    password: hashedPassword,
  };

  const userThatWasCreated = await createUser(user);

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }

  setRefreshTokenInCookie(data.session.refresh_token, res);

  res.status(201).json({
    status: "success",
    accessToken: data.session.access_token,
    data: {
      user: userThatWasCreated,
    },
  });
});

export const loginWithSupabase = catchAsync(async function (req, res, next) {
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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }

  setRefreshTokenInCookie(data.session.refresh_token, res);

  return res.status(200).json({
    status: "success",
    accessToken: data.session.access_token,
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
  // const token = req.params.refreshToken;
  let token;

  if (req.cookies.refreshToken) {
    token = req.cookies.refreshToken;
  }

  // There is no token present.
  if (!token) {
    return next(new AppError("You are not logged in. Please log in.", 401));
  }

  // 2. verify token
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: token,
  });

  const userEmail = data.user.email;

  const [userFromDatabase] = await db
    .select({
      id: UsersTable.id,
      email: UsersTable.email,
    })
    .from(UsersTable)
    .where(eq(UsersTable.email, userEmail));

  if (!userFromDatabase) {
    return next(new AppError("Something went wrong. Please login again.", 401));
  }

  setRefreshTokenInCookie(data.session.refresh_token, res);

  return res.status(200).json({
    status: "success",
    accessToken: data.session.access_token,
    data: {
      user: userFromDatabase,
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
  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const userEmail = data.user.email;

  const [userFromDatabase] = await db
    .select({
      id: UsersTable.id,
      email: UsersTable.email,
    })
    .from(UsersTable)
    .where(eq(UsersTable.email, userEmail));

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

  // 'global' means sign out of all active sessions.
  const { error } = await supabase.auth.signOut({ scope: "global" });

  if (error) {
    return res
      .status(401)
      .json({ error: "Something went wrong. Please try again." });
  }

  // 2. Send response
  res.status(200).json({
    message: "success",
    token: null,
  });
});

// responsible for sending mail after forgetting password
export const forgotPassword = catchAsync(async function (req, res, next) {
  const email = req.body.email;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:5173/reset-password", // Must match added redirect URL
  });

  if (error) {
    // Don't reveal if email exists → always 200 OK in production
    return res.status(200).json({
      status: "success",
      message: {
        message: "Reset email sent if account exists",
      },
    });
  }

  return res.status(200).json({
    status: "success",
    message: {
      message: "Reset email sent if account exists",
    },
  });
});

// responsible for resetting password
// How resetting password works?
// 1. get access and refresh token
// 2. update password
// Why do we need access and refresh token, because you need to create a session before updating the password.
// Both access and refresh token are appended in the reset url link by supabase, you need to get them from the URL.
// After setting session we can simply update the password.
export const resetPassword = catchAsync(async function (req, res, next) {
  const { password, access_token, refresh_token } = req.body;

  if (!access_token || !refresh_token) {
    return res.status(401).json({
      status: "error",
      message: "Something went wrong. Please try again later.",
    });
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (sessionError) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired session. Please log in again.",
    });
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return res.status(401).json({
      status: "error",
      message: "Something went wrong. Please try again later.",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
});
