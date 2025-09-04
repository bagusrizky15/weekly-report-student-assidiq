import { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin client not initialized" })
  }

  const { email, password, fullName, userClass } = req.body

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    const userId = data.user?.id

    if (userId) {
      // First check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 means no rows found
        console.error("Error checking existing profile:", fetchError)
        // If there's an error other than not found, delete the auth user and return error
        await supabaseAdmin.auth.admin.deleteUser(userId)
        return res.status(500).json({ error: fetchError.message })
      }

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const { error: profileError } = await supabaseAdmin.from("profiles").insert({
          id: userId,
          full_name: fullName,
          user_email: email,
          user_class: userClass,
          role: "student" // Default role for new users
        })

        if (profileError) {
          console.error("Profile insert error:", profileError)
          // If profile insertion fails, we should delete the auth user to avoid inconsistencies
          await supabaseAdmin.auth.admin.deleteUser(userId)
          return res.status(400).json({ error: profileError.message })
        }
      } else {
        // If profile exists, update it
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({
            full_name: fullName,
            user_email: email,
            user_class: userClass,
            role: "student"
          })
          .eq("id", userId)

        if (profileError) {
          console.error("Profile update error:", profileError)
          return res.status(400).json({ error: profileError.message })
        }
      }
    }

    return res.status(200).json({ success: true, user: data.user })
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Unexpected error occurred" })
  }
}
