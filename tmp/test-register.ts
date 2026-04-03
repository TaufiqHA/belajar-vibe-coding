import { registerUser } from "../src/services/user-service";

const testUser = {
  name: "John Doe",
  email: "john@mail.com",
  password: "password123"
};

console.log("Mencoba registrasi user baru...");

try {
  const result = await registerUser(testUser);
  console.log("Hasil registrasi:");
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
} catch (error) {
  console.error("Terjadi error saat registrasi:");
  console.error(error);
  process.exit(1);
}
