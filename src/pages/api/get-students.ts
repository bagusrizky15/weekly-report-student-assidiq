import { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin client not initialized" })
  }

  try {
    // Get all students
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("full_name, user_email, user_class, role, avatar_url")
      .eq("role", "student")
      .order("full_name", { ascending: true })

    if (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: error.message })
    }

    console.log("Fetched students data:", data);
    return res.status(200).json({ 
      success: true, 
      students: data
    })
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Unexpected error occurred" })
  }
}