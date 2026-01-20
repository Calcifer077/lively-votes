class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Sets the error message

    this.statusCode = statusCode;
    // If status code starts with 4, it's a 'fail' (400, 404), otherwise it's an 'error' (500)
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // This property helps us distinguish between "operational" errors
    // (like bad user input) and "programming" errors (like a typo in your code)
    this.isOperational = true;

    // This captures the stack trace so you can see where the error happened
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
