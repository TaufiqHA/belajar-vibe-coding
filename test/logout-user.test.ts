import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { userRoutes } from "../src/routes/user-route";

describe("Get Logout User API", () => {
    const app = new Elysia().use(userRoutes);

    it("should return 401 if Authorization header is missing on logout", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users/logout", {
                method: "DELETE"
            })
        );

        const data: any = await response.json();
        expect(response.status).toBe(401);
        expect(data.message).toBe("Unauthorized");
    });

    it("should return 401 if token is not found in database on logout", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users/logout", {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer non-existent-token"
                }
            })
        );

        const data: any = await response.json();
        expect(response.status).toBe(401);
        expect(data.message).toBe("Unauthorized");
    });
});
