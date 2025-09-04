import { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin client not initialized" })
  }

  try {
    // Get table info
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .limit(1)

    if (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: error.message })
    }

    // Get the actual table structure
    const { data: tableData, error: tableError } = await supabaseAdmin
      .from("profiles")
      .select()
      .limit(0)

    if (tableError) {
      console.error("Table error:", tableError)
      return res.status(500).json({ error: tableError.message })
    }

    return res.status(200).json({ 
      success: true, 
      sampleData: data,
      tableInfo: tableData
    })
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Unexpected error occurred" })
  }
}