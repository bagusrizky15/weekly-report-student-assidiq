import { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin client not initialized" })
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { id } = req.body

    // Validate required fields
    if (!id) {
      return res.status(400).json({ error: "Report ID is missing" })
    }

    // Use admin client to delete report (bypasses RLS)
    const { error } = await supabaseAdmin
      .from("reports")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting report:", error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Unexpected error occurred" })
  }
}