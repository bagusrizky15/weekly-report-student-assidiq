"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BookOpen, User, Calendar, Trophy, FileText, GraduationCap, CheckCircle } from "lucide-react"

// Define report type
interface Report {
  id: string;
  student_name: string;
  student_class: string;
  created_at: string;
  student_level: string;
  halaqoh_name: string;
  teacher_name: string;
  juz: string;
  surah: string;
  verses: string;
  amount_memorized: string;
  tasmi: string;
  module: string;
  chapter: string;
  pages: string;
  lines: string;
  teacher_notes: string;
  parent_sign: boolean;
}

export default function UserReportDetail() {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSigned, setIsSigned] = useState(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        
        // Get reportId from search params
        const reportId = searchParams?.get('id')
        
        if (!reportId) {
          setError("Report ID not found")
          setLoading(false)
          return
        }
        
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
        
        // Fetch report details
        const { data: reportData, error: reportError } = await supabaseClient
          .from("reports")
          .select("*")
          .eq("id", reportId)
          .eq("user_id", authData.user.id) // Ensure user can only see their own reports
          .single()
          
        if (reportError) {
          setError("Failed to fetch report data: " + reportError.message)
          setLoading(false)
          return
        }
        
        if (!reportData) {
          setError("Report not found")
          setLoading(false)
          return
        }
        
        setReport(reportData)
        setIsSigned(reportData.parent_sign || false)
        setLoading(false)
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
        setLoading(false)
      }
    }
    
    // Only fetch if searchParams is available
    if (searchParams) {
      fetchReport()
    }
  }, [searchParams, router])

  const handleSign = async () => {
    if (!report) return

    try {
      const { error } = await supabaseClient
        .from('reports')
        .update({ parent_sign: true })
        .eq('id', report.id)

      if (error) {
        setError(`Failed to sign report: ${error.message}`)
      } else {
        setIsSigned(true)
        setIsSuccessDialogOpen(true)
      }
    } catch (err) {
      setError("An unexpected error occurred while signing.")
      console.error(err)
    }
  }

  const handleSuccessDialogClose = () => {
    setIsSuccessDialogOpen(false)
  }

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
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <div className="flex items-center mb-2">
              <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <strong className="font-bold">Error</strong>
            </div>
            <span className="block sm:inline">{error}</span>
            <button 
              onClick={handleLogout} 
              className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report Details</h1>
            <p className="text-gray-600 mt-2">Weekly progress report for {report?.student_name}</p>
          </div>
          
          <Button
            onClick={() => router.push('/user-dashboard')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Button>
        </div>

        {/* Report Header Card */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold">{report?.student_name}</h2>
                <p className="text-blue-100 mt-1">Class: {report?.student_class || "-"}</p>
                <div className="flex items-center mt-3">
                  <Calendar className="h-5 w-5 text-blue-200 mr-2" />
                  <p className="text-blue-100">
                    {report?.created_at ? new Date(report.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : "-"}
                  </p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-yellow-300 mr-3" />
                  <div>
                    <p className="text-sm text-blue-100">Level</p>
                    <p className="text-xl font-bold">{report?.student_level || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Information */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Student Information</CardTitle>
                  <CardDescription>Personal and academic details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Student Name</label>
                  <p className="text-lg font-medium text-gray-900">{report?.student_name || "-"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Class</label>
                  <p className="text-lg font-medium text-gray-900">{report?.student_class || "-"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Halaqoh Name</label>
                  <p className="text-lg font-medium text-gray-900">{report?.halaqoh_name || "-"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Teacher Name</label>
                  <p className="text-lg font-medium text-gray-900">{report?.teacher_name || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tahfizh (Memorization) */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Tahfizh (Memorization)</CardTitle>
                  <CardDescription>Quran memorization progress</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Juz</label>
                  <p className="text-lg font-medium text-gray-900">{report?.juz || "-"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Surah</label>
                  <p className="text-lg font-medium text-gray-900">{report?.surah || "-"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Verses</label>
                  <p className="text-lg font-medium text-gray-900">{report?.verses || "-"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Amount Memorized</label>
                  <p className="text-lg font-medium text-gray-900">{report?.amount_memorized || "-"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tasmi</label>
                  <p className="text-lg font-medium text-gray-900">{report?.tasmi || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tahsin (Reading Improvement) */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Tahsin (Reading Improvement)</CardTitle>
                  <CardDescription>Quran reading development</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Module</label>
                  <p className="text-lg font-medium text-gray-900">{report?.module || "-"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Chapter</label>
                  <p className="text-lg font-medium text-gray-900">{report?.chapter || "-"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pages</label>
                  <p className="text-lg font-medium text-gray-900">{report?.pages || "-"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Lines</label>
                  <p className="text-lg font-medium text-gray-900">{report?.lines || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teacher's Notes */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden lg:col-span-2">
            <CardHeader className="bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Teacher&#39;s Notes</CardTitle>
                  <CardDescription>Evaluation and recommendations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-gray-50 rounded-xl p-6 min-h-[150px]">
                <p className="text-gray-700 whitespace-pre-line">
                  {report?.teacher_notes || "No notes from teacher"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sign Button Section */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSign}
            disabled={isSigned}
            className={`py-6 px-8 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 ${
              isSigned
                ? 'bg-green-600 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white hover:shadow-xl'
            }`}
          >
            {isSigned ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Signed
              </>
            ) : (
              'Sign Report'
            )}
          </Button>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl shadow-xl">
          <DialogHeader>
            <div className="mx-auto bg-green-100 p-3 rounded-full mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-slate-800">
              Report Signed!
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600 mt-2">
              You have successfully signed this report.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={handleSuccessDialogClose}
              className="w-full py-5 bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 text-white font-semibold rounded-xl"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}