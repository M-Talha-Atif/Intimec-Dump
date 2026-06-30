import { NextResponse } from "next/server";
import { apiErrorResponse } from "./apiErrorResponse";

type AsyncHandler<T = unknown> = (...args: any[]) => Promise<NextResponse<T>>;

export function wrapRoute<T>(handler: AsyncHandler<T>) {
  return async (...args: Parameters<AsyncHandler<T>>) => {
    try {
      return await handler(...args);
    } catch (err) {
      return apiErrorResponse(err);
    }
  };
}
