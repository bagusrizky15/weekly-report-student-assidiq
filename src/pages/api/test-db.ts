import { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin client not initialized" })
  }

  try {
    // Test connection by fetching table info
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .limit(1)

    if (error) {
      console.error("Database error:", error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ 
      success: true, 
      message: "Database connection successful",
      sampleData: data
    })
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Unexpected error occurred" })
  }
}