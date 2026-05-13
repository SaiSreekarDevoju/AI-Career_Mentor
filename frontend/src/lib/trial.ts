import type { User } from "@/store/authStore";

/** True when the user is on a trial account and the trial end time has passed. */
export function isTrialExpired(user: User | null | undefined, nowMs: number = Date.now()): boolean {
  if (!user?.is_trial_user || !user.trial_end_date) return false;
  return new Date(user.trial_end_date).getTime() <= nowMs;
}
