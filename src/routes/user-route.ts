import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/user-service";

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
      name: t.String({ maxLength: 255 }),
      email: t.String({ format: "email", maxLength: 255 }),
      password: t.String({ maxLength: 255 })
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
      email: t.String({ format: "email", maxLength: 255 }),
      password: t.String({ maxLength: 255 })
    })
  })
  // Refactor logic extracted to derive() for DRY
  .derive(({ headers }) => {
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { bearerToken: null };
    }

    const parts = authHeader.split(" ");
    const token = parts[1];
    if (parts.length !== 2 || !token) {
      return { bearerToken: null };
    }

    return { bearerToken: token };
  })
  .get("/current", async ({ bearerToken, set }) => {
    if (!bearerToken) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const user = await getCurrentUser(bearerToken);

    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    return {
      data: user
    };
  })
  .delete("/logout", async ({ bearerToken, set }) => {
    if (!bearerToken) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const success = await logoutUser(bearerToken);

    if (!success) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    return {
      data: "OK"
    };
  });
