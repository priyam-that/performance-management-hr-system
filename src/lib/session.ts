import { cookies } from "next/headers";
import { getUserByEmail } from "./auth";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const email = cookieStore.get("crystal_user")?.value;
  if (!email) return null;
  return getUserByEmail(email) || null;
}
