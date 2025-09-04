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

  const { email } = req.body

  try {
    // First get the user ID
    const { data: userData, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_email", email)
      .single()

    if (userError) {
      console.error("Error finding user:", userError)
      return res.status(400).json({ error: userError.message })
    }

    const userId = userData.id

    // Update the role to admin
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating role:", updateError)
      return res.status(500).json({ error: updateError.message })
    }

    return res.status(200).json({ success: true, message: "User role updated to admin" })
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Unexpected error occurred" })
  }
}