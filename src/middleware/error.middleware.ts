import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
  }

  // Prisma-like known errors (without importing Prisma)
  if ( err?.name === "PrismaClientKnownRequestError" || typeof err?.code === "string" ) {
    return res.status(400).json({
      success: false,
      message: "Database request failed",
      code: err.code,
    });
  }

  // Custom statusCode errors
  if (err?.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: err?.message || "Internal Server Error",
  });
};