// src/pages/api/check-admin-role.ts
import { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin client not initialized" })
  }

  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" })
  }

  try {
    // Use admin client to avoid RLS issues
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Profile query error:", profileError)
      return res.status(500).json({ error: profileError.message })
    }

    const role = profileData?.role || "user"

    return res.status(200).json({ role })
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Unexpected error occurred" })
  }
}