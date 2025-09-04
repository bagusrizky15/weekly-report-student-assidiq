import type { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler( req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin client not initialized" })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: "Email is required" })
  }

  try {
    // Cari user ID berdasarkan email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    if (userError) return res.status(500).json({ error: userError.message })

    const user = userData.users.find(u => u.email === email)
    if (!user) return res.status(404).json({ error: "User not found" })

    // Delete user dari Auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteError) return res.status(500).json({ error: deleteError.message })

    // Delete profile dari table
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_email", email)

    if (profileError) return res.status(500).json({ error: profileError.message })

    res.status(200).json({ message: "User deleted successfully" })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
}
