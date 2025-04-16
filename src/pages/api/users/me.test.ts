import type { APIContext } from "astro";
import { describe, expect, it, vi } from "vitest";
import { DELETE } from "./me";
import { deleteUserAccount } from "../../../lib/services/userService";
import { logServerError } from "../../../lib/utils/errorLogger";

vi.mock("../../../lib/services/userService");
vi.mock("../../../lib/utils/errorLogger");

describe("DELETE /api/users/me", () => {
  const mockContext = {
    locals: {
      session: {
        user: {
          id: "test-user-id",
        },
      },
    },
  } satisfies Partial<APIContext>;

  it("returns 401 when user is not authenticated", async () => {
    const response = await DELETE({ locals: {} } as APIContext);
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body).toEqual({ message: "Unauthorized" });
    expect(logServerError).toHaveBeenCalledWith({
      message: "Unauthorized attempt to delete account",
      context: { path: "/api/users/me", method: "DELETE" },
    });
  });

  it("returns 204 when user account is successfully deleted", async () => {
    vi.mocked(deleteUserAccount).mockResolvedValueOnce({ error: null });

    const response = await DELETE(mockContext as APIContext);
    expect(response.status).toBe(204);
    expect(deleteUserAccount).toHaveBeenCalledWith("test-user-id");
  });

  it("returns 500 when deletion fails", async () => {
    const testError = new Error("Test error");
    vi.mocked(deleteUserAccount).mockResolvedValueOnce({ error: testError });

    const response = await DELETE(mockContext as APIContext);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.message).toBe("Internal Server Error");
    expect(logServerError).toHaveBeenCalledWith({
      message: "Failed to delete user account",
      error: testError,
      userId: "test-user-id",
      context: { path: "/api/users/me", method: "DELETE" },
    });
  });
});
