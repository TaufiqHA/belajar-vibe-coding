import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser } from "../services/user-service";

export const userRoutes = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body, set }) => {
    const result = await registerUser(body);

    if (!result.success) {
      set.status = 400; // Or whatever status is preferred for existing user
      return {
        message: result.message,
        data: null
      };
    }

    set.status = 201;
    return {
      message: result.message,
      data: result.data
    };
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: "email" }),
      password: t.String()
    })
  })
  .post("/login", async ({ body, set }) => {
    const result = await loginUser(body);

    if (!result.success) {
      set.status = 401;
      return {
        message: result.message,
        data: null
      };
    }

    return {
      data: result.data
    };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String()
    })
  })
  .get("/current", async ({ headers, set }) => {
    const authHeader = headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const parts = authHeader.split(" ");
    const token = parts[1];

    if (parts.length !== 2 || !token) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const user = await getCurrentUser(token);

    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    return {
      data: user
    };
  });
