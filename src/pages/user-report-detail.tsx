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
  module: string;
  chapter: string;
  pages: string;
  lines: string;
  teacher_notes: string;
}

export default function UserReportDetail() {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        <h1 className="text-2xl font-bold">Report Details</h1>
        <Button
          onClick={() => router.push('/user-dashboard')}
          className="bg-gray-600 text-white hover:bg-gray-800"
        >
          Back
        </Button>
      </div>

      {/* Student Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Student information details</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Student Name</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{report?.student_name || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{report?.student_class || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">
              {report?.created_at ? new Date(report.created_at).toLocaleDateString('en-US') : "-"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Level</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{report?.student_level || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Halaqoh Name</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{report?.halaqoh_name || "-"}</p>
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Teacher Name</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{report?.teacher_name || "-"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabrizh (Memorization) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tahfizh (Memorization)</CardTitle>
          <CardDescription>Memorization information</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Juz</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{report?.juz || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Surah</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{report?.surah || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Verses</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{report?.verses || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount Memorized</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{report?.amount_memorized || "-"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Tahsin (Reading Improvement) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tahsin (Reading Improvement)</CardTitle>
          <CardDescription>Learning data</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Module</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{report?.module || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Chapter</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{report?.chapter || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pages</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{report?.pages || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Lines</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{report?.lines || "-"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Teacher's Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher's Notes</CardTitle>
          <CardDescription>Notes on student progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded min-h-[100px]">
            {report?.teacher_notes || "No notes from teacher"}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}