"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabaseClient } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"

// Define report type
interface Report {
  id: string;
  student_name: string;
  student_class: string;
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
  created_at: string;
  user_email: string;
}

export default function EditReportPage() {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Student Information
  const [studentName, setStudentName] = useState("")
  const [studentClass, setStudentClass] = useState("")
  const [studentLevel, setStudentLevel] = useState("")
  const [halaqohName, setHalaqohName] = useState("")
  const [teacherName, setTeacherName] = useState("")
  const [reportDate, setReportDate] = useState<Date>() // Date field
  
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
  
  // Teacher's Notes
  const [teacherNotes, setTeacherNotes] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const reportId = searchParams.get('id')

  useEffect(() => {
    if (!reportId) {
      setError("Report ID not found")
      setLoading(false)
      return
    }

    const fetchReport = async () => {
      try {
        const { data, error } = await supabaseClient
          .from("reports")
          .select("*")
          .eq("id", reportId)
          .single()

        if (error) {
          setError("Failed to fetch report data: " + error.message)
        } else if (data) {
          setReport(data)
          // Set all form fields
          setStudentName(data.student_name || "")
          setStudentClass(data.student_class || "")
          setStudentLevel(data.student_level || "")
          setHalaqohName(data.halaqoh_name || "")
          setTeacherName(data.teacher_name || "")
          setJuz(data.juz || "")
          setSurah(data.surah || "")
          setVerses(data.verses || "")
          setAmountMemorized(data.amount_memorized || "")
          setModule(data.module || "")
          setChapter(data.chapter || "")
          setPages(data.pages || "")
          setLines(data.lines || "")
          setTeacherNotes(data.teacher_notes || "")
          // Set the date if it exists
          if (data.created_at) {
            setReportDate(new Date(data.created_at))
          }
        } else {
          setError("Report not found")
        }
        setLoading(false)
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
        setLoading(false)
      }
    }

    fetchReport()
  }, [reportId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reportId) {
      alert("Report ID not found.")
      return
    }
    
    try {
      // Use API route to update report with admin privileges
      const res = await fetch("/api/admin/edit-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: reportId,
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
          created_at: reportDate ? reportDate.toISOString() : new Date().toISOString()
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert("Failed to save report: " + result.error);
      } else {
        alert("Report updated successfully!");
        router.push(`/admin/user-detail?email=${report?.user_email}`);
      }
    } catch (err) {
      console.error("Error saving report:", err);
      alert("An error occurred while saving the report");
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
            onClick={() => router.back()} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 relative min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Report</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>Student information details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="studentClass">Class</Label>
                <Input
                  id="studentClass"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reportDate">Date</Label>
                <DatePicker
                  date={reportDate}
                  onDateChange={(date) => date && setReportDate(date)}
                />
              </div>
              <div>
                <Label htmlFor="studentLevel">Level</Label>
                <Input
                  id="studentLevel"
                  value={studentLevel}
                  onChange={(e) => setStudentLevel(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="halaqohName">Halaqoh Name</Label>
                <Input
                  id="halaqohName"
                  value={halaqohName}
                  onChange={(e) => setHalaqohName(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="teacherName">Teacher Name</Label>
                <Input
                  id="teacherName"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabrizh (Memorization) */}
          <Card>
            <CardHeader>
              <CardTitle>Tabrizh (Memorization)</CardTitle>
              <CardDescription>Memorization information</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="juz">Juz</Label>
                <Input
                  id="juz"
                  value={juz}
                  onChange={(e) => setJuz(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="surah">Surah</Label>
                <Input
                  id="surah"
                  value={surah}
                  onChange={(e) => setSurah(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="verses">Verses</Label>
                <Input
                  id="verses"
                  value={verses}
                  onChange={(e) => setVerses(e.target.value)}
                  placeholder="Example: 1-6"
                />
              </div>
              <div>
                <Label htmlFor="amountMemorized">Amount Memorized</Label>
                <Input
                  id="amountMemorized"
                  value={amountMemorized}
                  onChange={(e) => setAmountMemorized(e.target.value)}
                  placeholder="Example: 6 verses"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tahsin (Reading Improvement) */}
          <Card>
            <CardHeader>
              <CardTitle>Tahsin (Reading Improvement)</CardTitle>
              <CardDescription>Learning data</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="module">Module</Label>
                <Input
                  id="module"
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="chapter">Chapter</Label>
                <Input
                  id="chapter"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pages">Pages</Label>
                <Input
                  id="pages"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="Example: 15-20"
                />
              </div>
              <div>
                <Label htmlFor="lines">Lines</Label>
                <Input
                  id="lines"
                  value={lines}
                  onChange={(e) => setLines(e.target.value)}
                  placeholder="Example: 1-10"
                />
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
              <Textarea
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                placeholder="Write notes about student progress, evaluation, and suggestions for next week..."
                rows={5}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Report
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}