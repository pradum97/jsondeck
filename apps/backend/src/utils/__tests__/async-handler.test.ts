import { describe, expect, it, vi } from "vitest";
import { asyncHandler } from "../async-handler";

const createRequest = () => ({}) as any;
const createResponse = () => ({}) as any;

describe("asyncHandler", () => {
  it("passes errors to next", async () => {
    const error = new Error("boom");
    const handler = async () => {
      throw error;
    };
    const next = vi.fn();

    const wrapped = asyncHandler(handler);
    await wrapped(createRequest(), createResponse(), next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
