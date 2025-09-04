import { NextApiRequest, NextApiResponse } from "next"
import { supabaseClient } from "@/lib/supabaseClient"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { email, password } = req.body

  try {
    console.log("Attempting login with email:", email)
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login error:", error)
      return res.status(400).json({ error: error.message })
    }

    const user = data?.user
    if (!user) {
      console.error("No user in response data:", data)
      return res.status(400).json({ error: "User not found" })
    }
    
    console.log("User logged in:", user)

    // Get role by calling our new API endpoint
    const roleResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/check-admin-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.id }),
    });

    const roleResult = await roleResponse.json();

    if (!roleResponse.ok) {
      console.error("Role check error:", roleResult.error);
      return res.status(500).json({ error: roleResult.error });
    }

    const role = roleResult.role;

    console.log("User role:", role)

    if (role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin access required." })
    }

    console.log("Redirecting to admin dashboard")
    
    return res.status(200).json({ success: true, user: data.user })
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Unexpected error occurred" })
  }
}