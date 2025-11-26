import { supabase } from "./supabase";

export interface UsageStatus {
  can_generate: boolean;
  docs_used: number;
  limit_value: number;
  days_until_reset: number;
}

export interface UsageResult {
  success: boolean;
  new_count: number;
  limit_reached: boolean;
  limit_value: number;
}

export async function checkUsageLimits(userId: string): Promise<UsageStatus> {
  const { data, error } = await supabase.rpc("check_and_reset_monthly_usage", {
    user_id: userId,
  });

  if (error) {
    if (error.message.includes("Profile not found")) {
      throw new Error("PROFILE_NOT_FOUND");
    }
    throw new Error(`Usage check failed: ${error.message}`);
  }

  const usage = Array.isArray(data) ? data[0] : data;

  if (!usage) {
    throw new Error("No usage data returned");
  }

  return {
    can_generate: usage.can_generate,
    docs_used: usage.docs_used,
    limit_value: usage.limit_value,
    days_until_reset: usage.days_until_reset,
  };
}

export async function incrementUsage(userId: string): Promise<UsageResult> {
  const { data, error } = await supabase.rpc("increment_doc_usage", {
    user_id: userId,
  });

  if (error) {
    throw new Error(`Usage increment failed: ${error.message}`);
  }

  const result = Array.isArray(data) ? data[0] : data;

  if (!result) {
    throw new Error("No result returned from increment");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("monthly_limit")
    .eq("id", userId)
    .single();

  return {
    success: result.success,
    new_count: result.new_count,
    limit_reached: result.limit_reached,
    limit_value: profile?.monthly_limit || 50,
  };
}
