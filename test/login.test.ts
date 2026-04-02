import { describe, it, expect, beforeAll } from "bun:test";
import { Elysia, t } from "elysia";
import { userRoutes } from "../src/routes/user-route";

// Mock implementation or direct use of app
// For unit testing the route logic, we can also test the service separately
// But here we test the route with Elysia's handle

describe("User Login API", () => {
    const app = new Elysia().use(userRoutes);

    it("should return error for invalid login", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "wrong@mail.com",
                    password: "wrongpassword"
                })
            })
        );

        const data: any = await response.json();
        
        expect(response.status).toBe(401);
        expect(data.message).toBe("Email atau Password salah");
        expect(data.data).toBe(null);
    });

    it("should return error for missing payload", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "test@mail.com"
                    // password missing
                })
            })
        );

        expect(response.status).toBe(422); // Validation error (Elysia default is 422)
    });
});
