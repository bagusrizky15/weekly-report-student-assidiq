"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Define user and report types
interface User {
  id: string;
  full_name: string;
  user_email: string;
  user_class: string;
}

interface Report {
  id: string;
  created_at: string;
  teacher_name: string;
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        // Get current user
        const { data: authData, error: authError } = await supabaseClient.auth.getUser()
        
        if (authError) {
          setError("Failed to fetch user data: " + authError.message)
          setLoading(false)
          return
        }
        
        if (!authData.user) {
          router.replace("/login")
          return
        }
        
        // Fetch user details from profiles table
        const { data: userData, error: userError } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single()
          
        if (userError) {
          setError("Failed to fetch profile data: " + userError.message)
          setLoading(false)
          return
        }
        
        setUser(userData)
        
        // Fetch reports for this user
        const { data: reportData, error: reportError } = await supabaseClient
          .from("reports")
          .select("*")
          .eq("user_id", authData.user.id)
          .order("created_at", { ascending: false })
          
        if (reportError) {
          // If reports table doesn't exist, show a message
          if (reportError.code === '42P01') {
            console.log("Reports table not found, this is expected on first run")
          } else {
            console.error("Error fetching reports:", reportError)
          }
        } else {
          setReports(reportData || [])
        }
        
        setLoading(false)
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [router])

  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut()
      router.replace("/login")
    } catch (err) {
      console.error("Error during logout:", err)
      router.replace("/login")
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={handleLogout} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 relative min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <Button
          onClick={handleLogout}
          className="bg-gray-600 text-white hover:bg-gray-800"
        >
          Logout
        </Button>
      </div>

      {/* Student Information Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>My Information</CardTitle>
          <CardDescription>Details of my account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 p-2 bg-gray-50 rounded">{user?.full_name || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 p-2 bg-gray-50 rounded">{user?.user_email || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class</label>
              <p className="mt-1 p-2 bg-gray-50 rounded">{user?.user_class || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Report List</CardTitle>
              <CardDescription>History of my progress reports</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No reports available for you yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report, index) => (
                  <TableRow key={report.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{new Date(report.created_at).toLocaleDateString('en-US')}</TableCell>
                    <TableCell>{report.teacher_name || ""}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        onClick={() => router.push(`/user-report-detail?id=${report.id}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}