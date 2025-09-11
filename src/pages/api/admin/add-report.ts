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
    const {
      user_id,
      user_email,
      student_name,
      student_class,
      student_level,
      halaqoh_name,
      teacher_name,
      juz,
      surah,
      verses,
      amount_memorized,
      tasmi,
      module,
      chapter,
      pages,
      lines,
      teacher_notes,
      created_at
    } = req.body

    // Validate required fields
    if (!user_id || !user_email || !student_name) {
      return res.status(400).json({ error: "Required fields are missing" })
    }

    // Use admin client to insert report (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from("reports")
      .insert({
        user_id,
        user_email,
        student_name,
        student_class,
        student_level,
        halaqoh_name,
        teacher_name,
        juz: juz || "",
        surah: surah || "",
        verses: verses || "",
        amount_memorized: amount_memorized || "",
        tasmi: tasmi || "",
        module: module || "",
        chapter: chapter || "",
        pages: pages || "",
        lines: lines || "",
        teacher_notes: teacher_notes || "",
        created_at: created_at || new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("Error inserting report:", error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true, report: data })
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Unexpected error occurred" })
  }
}