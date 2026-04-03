import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

export const registerUser = async (payload: any) => {
  const { name, email, password } = payload;

  // 1. Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
     return {
        success: false,
        message: "User already exists"
     };
  }

  // 2. Hash password (bcrypt compatible)
  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // 3. Insert user
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // 4. Get created user (without password)
  const newUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  return {
    success: true,
    message: "User created successfully",
    data: {
        id: newUser?.id,
        name: newUser?.name,
        email: newUser?.email,
        created_at: newUser?.createdAt
    }
  };
};

export const loginUser = async (payload: any) => {
  const { email, password } = payload;

  // 1. Find user by email
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  // 2. Verify password
  if (!user || !(await Bun.password.verify(password, user.password))) {
    return {
      success: false,
      message: "Email atau Password salah"
    };
  }

  // 3. Generate token UUID
  const token = crypto.randomUUID();

  // 4. Save session
  await db.insert(sessions).values({
    token,
    userId: user.id
  });

  return {
    success: true,
    data: token
  };
};

export const getCurrentUser = async (token: string) => {
  // 1. Find session by token
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
  });

  if (!session) {
    return null;
  }

  // 2. Find user by userId in session
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId as any), // Ensure compatibility for serial/int types
  });

  if (!user) {
    return null;
  }

  // 3. Return safe user data
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.createdAt
  };
};

export const logoutUser = async (token: string) => {
  // Directly delete session by token for efficiency
  const [result] = await db.delete(sessions).where(eq(sessions.token, token));
  
  // Return true if at least one row was affected (deleted)
  return (result as any).affectedRows > 0;
};
