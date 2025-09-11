"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabaseClient } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { 
  Card,
  CardContent,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  UserCircle, 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeft,
  AlertCircle
} from "lucide-react"

// Define user and report types
interface User {
  id: string;
  full_name: string;
  user_class: string;
  user_email: string;
}

interface Report {
  id: string;
  created_at: string;
  teacher_name: string;
  parent_sign: boolean;
}

export default function UserDetailPage() {
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const userEmail = searchParams.get('email')

  useEffect(() => {
    if (!userEmail) {
      setError("User email not found")
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch user details from API route
        const userRes = await fetch(`/api/get-user-by-email?email=${encodeURIComponent(userEmail)}`)
        
        // Check if response is ok and content type is JSON before parsing
        const contentType = userRes.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const userData = await userRes.json()

          if (!userRes.ok) {
            setError("Failed to fetch user data: " + userData.error)
            setLoading(false)
            return
          }

          setUser(userData)
        } else {
          // Handle non-JSON responses (like HTML error pages)
          const text = await userRes.text();
          if (!userRes.ok) {
            setError(`Failed to fetch user data: Server returned ${userRes.status} status`);
          } else {
            setError("Failed to fetch user data: Unexpected response format");
            console.warn("Unexpected response format:", text.substring(0, 100) + "..."); // Log first 100 chars
          }
          setLoading(false)
          return
        }

        // Fetch reports for this user
        const { data: reportData, error: reportError } = await supabaseClient
          .from("reports")
          .select("*")
          .eq("user_email", userEmail)
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
        setError("An unexpected error occurred: " + (err as Error).message)
        console.error(err)
        setLoading(false)
      }
    }

    fetchData()
  }, [userEmail])

  const handleAddReport = () => {
    router.push(`/admin/add-report?email=${userEmail}`)
  }

  const handleEditReport = (reportId: string) => {
    router.push(`/admin/edit-report?id=${reportId}`)
  }

  const openDeleteDialog = (reportId: string) => {
    setReportToDelete(reportId)
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setReportToDelete(null)
  }

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;

    try {
      // Use API route to delete report with admin privileges
      const res = await fetch("/api/admin/delete-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: reportToDelete }),
      });

      // Check if response is ok and content type is JSON before parsing
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await res.json();
        
        if (!res.ok) {
          setError("Failed to delete report: " + result.error);
        } else {
          // Refresh reports
          setReports(reports.filter(report => report.id !== reportToDelete));
          closeDeleteDialog();
        }
      } else {
        // Handle non-JSON responses (like HTML error pages)
        const text = await res.text();
        if (!res.ok) {
          setError(`Failed to delete report: Server returned ${res.status} status`);
        } else {
          // Even for successful responses, if it's not JSON, we should handle it
          console.warn("Unexpected response format:", text.substring(0, 100) + "..."); // Log first 100 chars
          // Refresh reports anyway since the response was successful
          setReports(reports.filter(report => report.id !== reportToDelete));
          closeDeleteDialog();
        }
      }
    } catch (err) {
      console.error("Error deleting report:", err);
      setError("An error occurred while deleting the report: " + (err as Error).message);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading student details...</p>
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
                <AlertCircle className="h-6 w-6" />
              </div>
              Error
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
              <p className="text-slate-700 mb-6">{error}</p>
              <Button 
                onClick={() => router.push('/admin')} 
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
              >
                Back to Dashboard
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
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
              <UserCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Student Reports</h1>
              <p className="text-slate-600 mt-1">View and manage student progress reports</p>
            </div>
          </div>
          
          <Button
            onClick={() => router.push('/admin')}
            variant="outline"
            className="flex items-center gap-2 bg-white shadow-sm hover:shadow-md transition-shadow border-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Student Information Section */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 mb-8 border-0 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white pb-5">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="bg-white/20 p-2 rounded-lg">
                <UserCircle className="h-6 w-6" />
              </div>
              Student Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <UserCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-800">Full Name</h3>
                </div>
                <p className="text-lg font-bold text-slate-800">{user?.full_name || "-"}</p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-800">Class</h3>
                </div>
                <p className="text-lg font-bold text-slate-800">{user?.user_class || "-"}</p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-blue-800">Email</h3>
                </div>
                <p className="text-lg font-bold text-slate-800 truncate">{user?.user_email || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Section */}
        <Card className="border-1 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="text-black pb-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6" />
                </div>
                Progress Reports
              </CardTitle>
              <Button 
                onClick={handleAddReport} 
                className="flex items-center gap-2 bg-white text-blue-700 hover:bg-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <Plus className="h-4 w-4" />
                Add New Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No Reports Found</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">This student does not have any progress reports yet. Get started by creating the first report.</p>
                <Button 
                  onClick={handleAddReport}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Report
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">No</TableHead>
                      <TableHead className="py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Date</TableHead>
                      <TableHead className="py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Teacher</TableHead>
                      <TableHead className="py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Sign</TableHead>
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
                        <TableCell className="py-4 px-6">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            report.parent_sign 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.parent_sign ? "Signed" : "Not Signed"}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-3">
                            <Button 
                              size="sm" 
                              onClick={() => handleEditReport(report.id)}
                              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => openDeleteDialog(report.id)}
                              className="bg-rose-500 hover:bg-rose-600 shadow-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl shadow-xl">
          <DialogHeader className="pt-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-rose-600" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-slate-800">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600 mt-2">
              Are you sure you want to delete this report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={closeDeleteDialog}
              className="bg-white flex-1 py-5 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteReport}
              variant="destructive"
              className="flex-1 py-5 bg-rose-600 hover:bg-rose-700"
            >
              Delete Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}