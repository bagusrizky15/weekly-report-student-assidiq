import { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin client not initialized" })
  }

  const { email } = req.query

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: "Email is required" })
  }

  try {
    // Use admin client to avoid RLS issues
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, user_email, user_class, role, created_at, updated_at")
      .eq("user_email", email)
      .single()

    if (error) {
      console.error("Profile query error:", error)
      return res.status(500).json({ error: error.message })
    }

    if (!data) {
      return res.status(404).json({ error: "User not found" })
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Unexpected error occurred" })
  }
}