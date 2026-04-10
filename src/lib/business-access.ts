import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Returns true if the business owner has an active subscription or is still
 * within their trial window. When false, the public booking surface should
 * be shown as "paused" and booking creation should be rejected.
 */
export async function isBusinessBookable(ownerUserId: string): Promise<boolean> {
  const [owner] = await db
    .select()
    .from(users)
    .where(eq(users.id, ownerUserId))
    .limit(1);

  if (!owner) return false;

  if (owner.subscriptionStatus === "active") return true;

  if (
    owner.subscriptionStatus === "trialing" &&
    owner.trialEndsAt &&
    new Date(owner.trialEndsAt) > new Date()
  ) {
    return true;
  }

  return false;
}
