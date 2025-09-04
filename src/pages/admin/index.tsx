"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabaseClient"
import { User } from "@/types/user"

export default function AdminDashboard() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [userClass, setUserClass] = useState("")
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<User[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [dropdownOpenIndex, setDropdownOpenIndex] = useState<number | null>(null)

    // Cek session
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data } = await supabaseClient.auth.getUser()
                if (!data.user) {
                    console.log("No user found, redirecting to login")
                    router.push("/admin/login")
                } else {
                    console.log("User found, loading dashboard")
                    setLoading(false)
                    fetchUsers()
                }
            } catch (error) {
                console.error("Error checking session:", error)
                router.push("/admin/login")
            }
        }
        checkSession()
    }, [router])

    // Fetch user dari tabel 'users'
    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/get-students")
            const result = await res.json()
            
            if (!res.ok) {
                console.log("Error fetching users:", result.error)
                return
            }
            
            setUsers(result.students as User[])
            console.log("Fetched data:", result.students)
        } catch (error) {
            console.log("Error fetching users:", error)
        }
    }

    // Fungsi update user
    const handleEditUser = async () => {
        if (!selectedUser) return

        const res = await fetch("/api/admin/editUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: selectedUser.user_email,
                fullName: selectedUser.full_name,
                userClass: selectedUser.user_class,
                password: selectedUser.user_password,
            }),
        })

        const result = await res.json()
        if (result.error) {
            alert("❌ " + result.error)
        } else {
            alert("✅ User berhasil diupdate!")
            setIsEditDialogOpen(false)
            fetchUsers()
        }
    }

    // Fungsi delete user
    const handleDeleteUser = async () => {
        if (!selectedUser) return

        const res = await fetch("/api/admin/deleteUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: selectedUser.user_email }),
        })

        const result = await res.json()
        if (result.error) {
            alert("❌ " + result.error)
        } else {
            alert("✅ User berhasil dihapus!")
            setIsDeleteDialogOpen(false)
            fetchUsers()
        }
    }

    const handleAddUser = async () => {
        const res = await fetch("/api/admin/addUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, fullName, userClass }),
        })

        const result = await res.json()
        if (result.error) {
            alert("❌ " + result.error)
        } else {
            alert("✅ User berhasil ditambahkan!")
            setEmail("")
            setPassword("")
            setFullName("")
            setUserClass("")
            setIsDialogOpen(false)
            fetchUsers()
        }
    }

    const handleLogout = async () => {
        try {
            console.log("Logging out user")
            await supabaseClient.auth.signOut()
            router.push("/admin/login")
        } catch (error) {
            console.error("Error during logout:", error)
            router.push("/admin/login")
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="p-6 relative min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                    Logout
                </button>
            </div>

            {/* Tabel User */}
            <div className="bg-white p-6 rounded-2xl shadow mb-6 overflow-x-auto h-screen flex flex-col">
                <h2 className="text-xl font-bold mb-4">Daftar User</h2>
                <div className="flex-1 overflow-y-auto">
                    <table className="min-w-full border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border-b text-left">No</th>
                                <th className="py-2 px-4 border-b text-left">Nama</th>
                                <th className="py-2 px-4 border-b text-left">Email</th>
                                <th className="py-2 px-4 border-b text-left">Class</th>
                                <th className="py-2 px-4 border-b text-left"></th>
                                <th className="py-2 px-4 border-b text-left"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-4 text-center">
                                        Tidak ada data user
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, index) => (
                                    <tr key={index} className="hover:bg-gray-50 relative">
                                        <td className="py-2 px-4 border-b">{index + 1}</td>
                                        <td className="py-2 px-4 border-b">{user.full_name}</td>
                                        <td className="py-2 px-4 border-b">{user.user_email}</td>
                                        <td className="py-2 px-4 border-b">{user.user_class}</td>
                                        <td className="py-2 border-b">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => router.push(`/admin/user-detail?email=${user.user_email}`)}
                                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                >
                                                    Report
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsEditDialogOpen(true);
                                                    }}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            </div>


            {/* Dialog Edit User */}
            {isEditDialogOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md relative">
                        <button
                            onClick={() => setIsEditDialogOpen(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold mb-4">Edit User</h2>
                        <input
                            type="email"
                            placeholder="Email"
                            className="border p-2 w-full mb-2 rounded"
                            value={selectedUser.user_email}
                            disabled
                        />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="border p-2 w-full mb-2 rounded"
                            value={selectedUser.full_name}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, full_name: e.target.value })
                            }
                        />
                        <input
                            type="text"
                            placeholder="Class"
                            className="border p-2 w-full mb-2 rounded"
                            value={selectedUser.user_class}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, user_class: e.target.value })
                            }
                        />
                        <input
                            type="password"
                            placeholder="Password (opsional)"
                            className="border p-2 w-full mb-4 rounded"
                            value={selectedUser.user_password || ""}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, user_password: e.target.value })
                            }
                        />
                        <button
                            onClick={handleEditUser}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
                        >
                            Update User
                        </button>
                    </div>
                </div>
            )}

            {/* Dialog Delete User */}
            {isDeleteDialogOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm relative">
                        <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
                        <p className="mb-4">
                            Apakah Anda yakin ingin menghapus user{" "}
                            <span className="font-semibold">{selectedUser.full_name}</span>?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="px-4 py-2 border rounded"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tombol Tambah User */}
            <button
                onClick={() => setIsDialogOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition"
            >
                + Tambah User
            </button>

            {/* Dialog Tambah User */}
            {isDialogOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md relative">
                        <button
                            onClick={() => setIsDialogOpen(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold mb-4">Tambah User</h2>
                        <input
                            type="email"
                            placeholder="Email (Wajib)"
                            className="border p-2 w-full mb-2 rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="border p-2 w-full mb-2 rounded"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Class"
                            className="border p-2 w-full mb-2 rounded"
                            value={userClass}
                            onChange={(e) => setUserClass(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="border p-2 w-full mb-4 rounded"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            onClick={handleAddUser}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
                        >
                            Tambahkan User
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}