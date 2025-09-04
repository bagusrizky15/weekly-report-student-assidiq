import type { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin client not initialized" })
  }

  const { email, fullName, userClass, password } = req.body

  if (!email || !fullName || !userClass) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    // Update profile
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ full_name: fullName, user_class: userClass })
      .eq("user_email", email)

    if (error) {
      console.error("Profile update error:", error)
      return res.status(500).json({ error: error.message })
    }

    // Update password jika ada
    if (password && password.length > 0) {
      // Cari user ID berdasarkan email
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers()
      if (userError) {
        console.error("List users error:", userError)
        return res.status(500).json({ error: userError.message })
      }

      const user = userData.users.find(u => u.email === email)
      if (!user) return res.status(404).json({ error: "User not found" })

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password })
      if (updateError) {
        console.error("Password update error:", updateError)
        return res.status(500).json({ error: updateError.message })
      }
    }

    res.status(200).json({ message: "User updated successfully", data })
  } catch (err) {
    console.error("Unexpected error:", err)
    res.status(500).json({ error: (err as Error).message || "Unexpected error occurred" })
  }
}
