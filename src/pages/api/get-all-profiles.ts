import { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin client not initialized" })
  }

  try {
    // Get all profiles
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ 
      success: true, 
      profiles: data
    })
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Unexpected error occurred" })
  }
}