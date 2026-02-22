import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const successResponse = (data: unknown, status: number = 200) => {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
};

export const errorResponse = (error: unknown) => {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Input validation failed",
          details: error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  console.error("[API Error]:", error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
};

export const wrapHandler = <T extends unknown[]>(
  handler: (req: Request, ...args: T) => Promise<Response>
) => {
  return async (req: Request, ...args: T) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      return errorResponse(error);
    }
  };
};
