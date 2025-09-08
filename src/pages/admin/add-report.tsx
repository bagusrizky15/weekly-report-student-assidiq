"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Define user type
interface User {
  id: string;
  full_name: string;
  user_class: string;
}

export default function AddReportPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)

  // Student Information
  const [studentName, setStudentName] = useState("")
  const [studentClass, setStudentClass] = useState("")
  const [studentLevel, setStudentLevel] = useState("")
  const [halaqohName, setHalaqohName] = useState("")
  const [teacherName, setTeacherName] = useState("")
  const [reportDate, setReportDate] = useState<Date>(new Date()) // New date field

  // Tabrizh (Memorization)
  const [juz, setJuz] = useState("")
  const [surah, setSurah] = useState("")
  const [verses, setVerses] = useState("")
  const [amountMemorized, setAmountMemorized] = useState("")

  // Tahsin (Reading Improvement)
  const [module, setModule] = useState("")
  const [chapter, setChapter] = useState("")
  const [pages, setPages] = useState("")
  const [lines, setLines] = useState("")

  // Teacher&#39;s Notes
  const [teacherNotes, setTeacherNotes] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const userEmail = searchParams.get('email')

  useEffect(() => {
    if (!userEmail) {
      setError("User email not found")
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        // Fetch user details from API route
        const userRes = await fetch(`/api/get-user-by-email?email=${encodeURIComponent(userEmail)}`)
        const userData = await userRes.json()

        if (!userRes.ok) {
          setError("Failed to fetch user data: " + userData.error)
        } else {
          setUser(userData)
          setStudentName(userData.full_name || "")
          setStudentClass(userData.user_class || "")
        }
        setLoading(false)
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
        setLoading(false)
      }
    }

    fetchUser()
  }, [userEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Ensure we have the user ID
    if (!user?.id) {
      alert("User information is incomplete. Please try again.")
      return
    }

    try {
      // Use API route to insert report with admin privileges
      const res = await fetch("/api/admin/add-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          user_email: userEmail,
          student_name: studentName,
          student_class: studentClass,
          student_level: studentLevel,
          halaqoh_name: halaqohName,
          teacher_name: teacherName,
          juz: juz,
          surah: surah,
          verses: verses,
          amount_memorized: amountMemorized,
          module: module,
          chapter: chapter,
          pages: pages,
          lines: lines,
          teacher_notes: teacherNotes,
          created_at: reportDate.toISOString()
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert("Failed to save report: " + result.error);
      } else {
        setIsSuccessDialogOpen(true);
      }
    } catch (err) {
      console.error("Error saving report:", err);
      alert("An error occurred while saving the report");
    }
  }

  const handleSuccessDialogClose = () => {
    setIsSuccessDialogOpen(false);
    router.push(`/admin/user-detail?email=${userEmail}`);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading student information...</p>
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
                onClick={() => router.back()}
                className="w-full py-5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 rounded-xl"
              >
                Back to Previous Page
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Add Student Report</h1>
            <p className="text-slate-600 mt-2">Create a new progress report for {studentName}</p>
          </div>

          <Button
            type="button"
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center gap-2 bg-white shadow-sm hover:shadow-md transition-shadow border-slate-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Details
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Student Information */}
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white pb-5">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  Student Information
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Basic details about the student
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                    <h3 className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-2">Student Name</h3>
                    <p className="font-bold text-lg text-slate-800">{studentName}</p>
                  </div>

                  <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                    <h3 className="text-xs font-medium text-indigo-700 uppercase tracking-wider mb-2">Class</h3>
                    <p className="font-bold text-lg text-slate-800">{studentClass}</p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                    <Label htmlFor="reportDate" className="text-xs font-medium text-purple-700 uppercase tracking-wider mb-2 block">
                      Report Date
                    </Label>
                    <DatePicker
                      date={reportDate}
                      onDateChange={(date) => date && setReportDate(date)}
                      className="w-full rounded-lg border-purple-200 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="studentLevel" className="text-sm font-medium text-slate-700 mb-2">
                      Student Level
                    </Label>
                    <Input
                      id="studentLevel"
                      value={studentLevel}
                      onChange={(e) => setStudentLevel(e.target.value)}
                      required
                      className="py-5 rounded-xl border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter student level"
                    />
                  </div>

                  <div>
                    <Label htmlFor="halaqohName" className="text-sm font-medium text-slate-700 mb-2">
                      Halaqoh Name
                    </Label>
                    <Input
                      id="halaqohName"
                      value={halaqohName}
                      onChange={(e) => setHalaqohName(e.target.value)}
                      required
                      className="py-5 rounded-xl border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter halaqoh name"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <Label htmlFor="teacherName" className="text-sm font-medium text-slate-700 mb-2">
                      Teacher Name
                    </Label>
                    <Input
                      id="teacherName"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      required
                      className="py-5 rounded-xl border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter teacher name"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabrizh (Memorization) */}
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white pb-5">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  Tahfizh (Memorization)
                </CardTitle>
                <CardDescription className="text-emerald-100">
                  Information about memorization progress
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="juz" className="text-sm font-medium text-slate-700 mb-2">
                      Juz
                    </Label>
                    <Input
                      id="juz"
                      value={juz}
                      onChange={(e) => setJuz(e.target.value)}
                      className="py-5 rounded-xl border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter juz number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="surah" className="text-sm font-medium text-slate-700 mb-2">
                      Surah
                    </Label>
                    <Input
                      id="surah"
                      value={surah}
                      onChange={(e) => setSurah(e.target.value)}
                      className="py-5 rounded-xl border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter surah name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="verses" className="text-sm font-medium text-slate-700 mb-2">
                      Verses
                    </Label>
                    <Input
                      id="verses"
                      value={verses}
                      onChange={(e) => setVerses(e.target.value)}
                      className="py-5 rounded-xl border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Example: 1-6"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amountMemorized" className="text-sm font-medium text-slate-700 mb-2">
                      Amount Memorized
                    </Label>
                    <Input
                      id="amountMemorized"
                      value={amountMemorized}
                      onChange={(e) => setAmountMemorized(e.target.value)}
                      className="py-5 rounded-xl border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Example: 6 verses"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tahsin (Reading Improvement) */}
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white pb-5">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                  </div>
                  Tahsin (Reading Improvement)
                </CardTitle>
                <CardDescription className="text-amber-100">
                  Details about reading progress
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="module" className="text-sm font-medium text-slate-700 mb-2">
                      Module
                    </Label>
                    <Input
                      id="module"
                      value={module}
                      onChange={(e) => setModule(e.target.value)}
                      className="py-5 rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Enter module name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chapter" className="text-sm font-medium text-slate-700 mb-2">
                      Chapter
                    </Label>
                    <Input
                      id="chapter"
                      value={chapter}
                      onChange={(e) => setChapter(e.target.value)}
                      className="py-5 rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Enter chapter name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pages" className="text-sm font-medium text-slate-700 mb-2">
                      Pages
                    </Label>
                    <Input
                      id="pages"
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      className="py-5 rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Example: 15-20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lines" className="text-sm font-medium text-slate-700 mb-2">
                      Lines
                    </Label>
                    <Input
                      id="lines"
                      value={lines}
                      onChange={(e) => setLines(e.target.value)}
                      className="py-5 rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Example: 1-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teacher&#39;s Notes */}
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white pb-5">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </div>
                  Teacher&#39;s Notes
                </CardTitle>
                <CardDescription className="text-violet-100">
                  Observations and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div>
                  <Label htmlFor="teacherNotes" className="text-sm font-medium text-slate-700 mb-2">
                    Notes
                  </Label>
                  <Textarea
                    id="teacherNotes"
                    value={teacherNotes}
                    onChange={(e) => setTeacherNotes(e.target.value)}
                    placeholder="Write detailed notes about student progress, evaluation, and suggestions for next week..."
                    rows={6}
                    className="rounded-xl border-slate-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
              <Button
                type="button"
                onClick={() => router.back()}
                variant="outline"
                className="bg-white py-6 rounded-xl border-slate-300 text-black"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="py-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Save Report
              </Button>
            </div>
          </div>
        </form>

        {/* Success Dialog */}
        <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl shadow-xl">
            <DialogHeader>
              <div className="mx-auto bg-green-100 p-3 rounded-full mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <DialogTitle className="text-center text-2xl font-bold text-slate-800">
                Report Saved Successfully!
              </DialogTitle>
              <DialogDescription className="text-center text-slate-600 mt-2">
                The student progress report has been saved successfully.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="text-center">
                <p className="text-slate-700">
                  You will be redirected to the student details page.
                </p>
              </div>
            </div>
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
    </div>
  )
}