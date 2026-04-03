import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { userRoutes } from "../src/routes/user-route";

describe("Get Current User API", () => {
    const app = new Elysia().use(userRoutes);

    it("should return 401 if Authorization header is missing", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users/current", {
                method: "GET"
            })
        );

        const data: any = await response.json();
        expect(response.status).toBe(401);
        expect(data.message).toBe("Unauthorized");
    });

    it("should return 401 if Authorization header format is invalid", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users/current", {
                method: "GET",
                headers: {
                    "Authorization": "InvalidToken123"
                }
            })
        );

        const data: any = await response.json();
        expect(response.status).toBe(401);
        expect(data.message).toBe("Unauthorized");
    });

    it("should return 401 if token is not found in database", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users/current", {
                method: "GET",
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
