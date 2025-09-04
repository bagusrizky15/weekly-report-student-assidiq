import { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin client not initialized" })
  }

  try {
    // Get all distinct role values
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .neq("role", null)

    if (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: error.message })
    }

    // Get distinct values
    const roles = [...new Set(data.map(item => item.role))]

    return res.status(200).json({ 
      success: true, 
      roles: roles
    })
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Unexpected error occurred" })
  }
}