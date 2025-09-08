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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
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

  const openLogoutDialog = () => {
    setIsLogoutDialogOpen(true)
  }

  const closeLogoutDialog = () => {
    setIsLogoutDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="max-w-md w-full border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-rose-500 text-white pb-5">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              Error
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <p className="text-slate-700 mb-6">{error}</p>
              <Button 
                onClick={handleLogout} 
                className="w-full py-5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 rounded-xl"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Student Dashboard</h1>
            <p className="text-slate-600 mt-2">View your progress reports and account information</p>
          </div>
          
          <Button
            onClick={openLogoutDialog}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </Button>
        </div>

        {/* Student Information Section */}
        <Card className="mb-8 border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white pb-5">
            <div className="flex items-center gap-3">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <CardTitle>My Information</CardTitle>
            </div>
            <CardDescription className="text-blue-100">Personal details and account information</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-2">Full Name</h3>
                <p className="font-bold text-lg text-slate-800">{user?.full_name || "-"}</p>
              </div>
              
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                <h3 className="text-xs font-medium text-indigo-700 uppercase tracking-wider mb-2">Email Address</h3>
                <p className="font-bold text-lg text-slate-800 truncate">{user?.user_email || "-"}</p>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                <h3 className="text-xs font-medium text-purple-700 uppercase tracking-wider mb-2">Class</h3>
                <p className="font-bold text-lg text-slate-800">{user?.user_class || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Section */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white pb-5">
            <div className="flex items-center gap-3">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <CardTitle>My Progress Reports</CardTitle>
            </div>
            <CardDescription className="text-emerald-100">History of your weekly quran reports</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No Reports Yet</h3>
                <p className="text-slate-600 mb-6">You do not have any progress reports available at the moment.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">No</TableHead>
                      <TableHead className="py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Date</TableHead>
                      <TableHead className="py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Teacher</TableHead>
                      <TableHead className="py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-200">
                    {reports.map((report, index) => (
                      <TableRow 
                        key={report.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-800 font-bold">{index + 1}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 font-medium text-slate-800">
                          {new Date(report.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-slate-700">
                          <div className="flex items-center gap-2">
                            <div className="bg-slate-100 p-1 rounded">
                              <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                              </svg>
                            </div>
                            {report.teacher_name || "Unassigned"}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <Button 
                            size="sm" 
                            onClick={() => router.push(`/user-report-detail?id=${report.id}`)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="bg-white rounded-2xl shadow-xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-blue-100 p-3 rounded-full mb-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold text-slate-800">
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-600 mt-2">
              Are you sure you want to logout from your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 pt-4">
            <AlertDialogCancel 
              onClick={closeLogoutDialog}
              className="bg-white flex-1 py-5 text-black-700 rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="flex-1 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}