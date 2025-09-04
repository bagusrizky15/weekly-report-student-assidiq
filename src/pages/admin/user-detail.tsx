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
  user_class: string;
  user_email: string;
}

interface Report {
  id: string;
  created_at: string;
  teacher_name: string;
}

export default function UserDetailPage() {
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const userEmail = searchParams.get('email')

  useEffect(() => {
    if (!userEmail) {
      setError("Email pengguna tidak ditemukan")
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch user details from API route
        const userRes = await fetch(`/api/get-user-by-email?email=${encodeURIComponent(userEmail)}`)
        const userData = await userRes.json()

        if (!userRes.ok) {
          setError("Gagal mengambil data pengguna: " + userData.error)
          setLoading(false)
          return
        }

        setUser(userData)

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
        setError("Terjadi kesalahan tidak terduga")
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

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
      try {
        // Use API route to delete report with admin privileges
        const res = await fetch("/api/admin/delete-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: reportId }),
        });

        const result = await res.json();

        if (!res.ok) {
          alert("Gagal menghapus laporan: " + result.error);
        } else {
          // Refresh reports
          setReports(reports.filter(report => report.id !== reportId));
          alert("Laporan berhasil dihapus!");
        }
      } catch (err) {
        console.error("Error deleting report:", err);
        alert("Terjadi kesalahan saat menghapus laporan");
      }
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
            onClick={() => router.push('/admin')} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 relative min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detail Pengguna & Laporan</h1>
        <Button
          onClick={() => router.push('/admin')}
          className="bg-gray-600 text-white hover:bg-gray-800"
        >
          Kembali
        </Button>
      </div>

      {/* Student Information Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informasi Siswa</CardTitle>
          <CardDescription>Detail informasi siswa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama</label>
              <p className="mt-1 p-2 bg-gray-50 rounded">{user?.full_name || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kelas</label>
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
              <CardTitle>Daftar Laporan</CardTitle>
              <CardDescription>Histori laporan perkembangan siswa</CardDescription>
            </div>
            <Button onClick={handleAddReport} className="bg-green-600 hover:bg-green-700">
              Tambah Laporan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada laporan untuk siswa ini</p>
              <Button onClick={handleAddReport} className="mt-4">
                Tambah Laporan Pertama
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Guru</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report, index) => (
                  <TableRow key={report.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{new Date(report.created_at).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{report.teacher_name || ""}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleEditReport(report.id)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteReport(report.id)}
                        >

                          Hapus
                        </Button>
                      </div>
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