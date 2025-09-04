"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabaseClient"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabaseClient.auth.getUser()
        if (data.user) {
          // We don't need to store the user data in state since we're redirecting
          // Check user role
          const { data: profileData, error } = await supabaseClient
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single()
            
          if (error) {
            console.error("Error fetching profile:", error)
            router.replace("/login")
            return
          }
          
          // Redirect based on role
          if (profileData?.role === "admin") {
            router.replace("/admin")
          } else {
            router.replace("/user-dashboard")
          }
        } else {
          router.replace("/login")
        }
      } catch (err) {
        console.error("Error checking user:", err)
        router.replace("/login")
      } finally {
        setLoading(false)
      }
    }
    
    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Redirecting...</p>
    </div>
  )
}
