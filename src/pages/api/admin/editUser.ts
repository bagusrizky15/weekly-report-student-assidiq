import type { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Edit user request body:", req.body);
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin client not initialized" })
  }

  const { email, fullName, userClass, password, avatarUrl } = req.body

  if (!email || !fullName || !userClass) {
    return res.status(400).json({ error: "Missing required fields" })
  }
  
  console.log("Processing edit user with avatarUrl:", avatarUrl);

  try {
    // Get current user data to check existing avatar
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("avatar_url")
      .eq("user_email", email)
      .single()

    if (fetchError) {
      console.error("Error fetching current user:", fetchError)
      return res.status(500).json({ error: fetchError.message })
    }

    // Handle avatar removal
    if (avatarUrl === null && currentUser.avatar_url) {
      try {
        // Extract file path from the public URL
        const currentAvatarUrl = currentUser.avatar_url;
        // Extract the file name from the URL
        const urlParts = currentAvatarUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        if (fileName) {
          // Remove the file from storage
          const { error: deleteError } = await supabaseAdmin
            .storage
            .from('avatars')
            .remove([fileName])
          
          if (deleteError) {
            console.error("Error deleting avatar file:", deleteError)
            // Don't return error here as we still want to update the profile
          }
        }
      } catch (deleteErr) {
        console.error("Error processing avatar deletion:", deleteErr)
        // Continue with profile update even if file deletion fails
      }
    }

    // Update profile with avatar URL
    const updateData: Record<string, string | null> = { 
      full_name: fullName, 
      user_class: userClass 
    };
    
    // Handle avatar_url explicitly
    if (avatarUrl === null) {
      // Explicitly set to null when removing
      updateData.avatar_url = null;
      console.log("Setting avatar_url to null");
    } else if (avatarUrl !== undefined) {
      // Set new avatar URL
      updateData.avatar_url = avatarUrl;
      console.log("Setting avatar_url to:", avatarUrl);
    }
    // If avatarUrl is undefined, we don't update the field at all
    
    console.log("Update data being sent to database:", updateData);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("user_email", email)

    if (error) {
      console.error("Profile update error:", error)
      return res.status(500).json({ error: error.message })
    }
    
    console.log("Profile updated successfully:", data);

    // Update password if provided
    if (password && password.length > 0) {
      // Find user ID based on email
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
