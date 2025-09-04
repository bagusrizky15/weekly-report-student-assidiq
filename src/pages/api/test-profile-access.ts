import { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin client not initialized" })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_email", "admin2@admin.com")
      .single()

    if (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ 
      success: true, 
      profile: data
    })
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Unexpected error occurred" })
  }
}