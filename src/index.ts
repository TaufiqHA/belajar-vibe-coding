import { Elysia } from "elysia";
import { db } from "./db";

const app = new Elysia()
  .get("/", () => ({
    message: "Welcome to Elysia with Drizzle and MySQL!",
    status: "online",
  }))
  .get("/users", async () => {
    try {
      const allUsers = await db.query.users.findMany();
      return allUsers;
    } catch (error) {
      return { error: "Database not connected or error fetching users." };
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
