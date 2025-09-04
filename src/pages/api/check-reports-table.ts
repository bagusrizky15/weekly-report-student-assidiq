import { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin client not initialized" })
  }

  try {
    // Try to access reports table
    const { data, error } = await supabaseAdmin
      .from("reports")
      .select("id")
      .limit(1)

    if (error) {
      console.error("Error accessing reports table:", error)
      // If table doesn't exist, return a specific error
      if (error.code === '42P01') { // Undefined table
        return res.status(404).json({ 
          error: "Reports table not found", 
          message: "Please create the reports table in your Supabase database" 
        })
      }
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ 
      success: true, 
      message: "Reports table exists and is accessible",
      sampleData: data
    })
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Unexpected error occurred" })
  }
}