"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabaseClient"
import { User } from "@/types/user"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
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
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  LogOut,
  Users
} from "lucide-react"

export default function AdminDashboard() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [userClass, setUserClass] = useState("")
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<User[]>([])
    const [fetchingUsers, setFetchingUsers] = useState(false)
    const [addingUser, setAddingUser] = useState(false)
    const [editingUser, setEditingUser] = useState(false)
    const [deletingUser, setDeletingUser] = useState(false)
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
    const router = useRouter()

    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    
    // Success message dialog states
    const [isAddSuccessDialogOpen, setIsAddSuccessDialogOpen] = useState(false)
    const [isEditSuccessDialogOpen, setIsEditSuccessDialogOpen] = useState(false)
    const [isDeleteSuccessDialogOpen, setIsDeleteSuccessDialogOpen] = useState(false)
    
    // Error message dialog states
    const [isAddErrorDialogOpen, setIsAddErrorDialogOpen] = useState(false)
    const [isEditErrorDialogOpen, setIsEditErrorDialogOpen] = useState(false)
    const [isDeleteErrorDialogOpen, setIsDeleteErrorDialogOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    // Check session
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

    // Fetch users from 'users' table
    const fetchUsers = async () => {
        try {
            setFetchingUsers(true)
            const res = await fetch("/api/get-students")
            
            // Check if response is ok and content type is JSON before parsing
            const contentType = res.headers.get("content-type")
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const result = await res.json()
                
                if (!res.ok) {
                    console.log("Error fetching users:", result.error)
                    return
                }
                
                setUsers(result.students as User[])
                console.log("Fetched data:", result.students)
            } else {
                // Handle non-JSON responses (like HTML error pages)
                await res.text()
                if (!res.ok) {
                    console.log(`Server returned ${res.status} status when fetching users`)
                } else {
                    console.log("Unexpected response format when fetching users")
                }
            }
        } catch (error) {
            console.log("Error fetching users:", error)
        } finally {
            setFetchingUsers(false)
        }
    }

    // Update user function
    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return

        setEditingUser(true);
        try {
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

            // Check if response is ok and content type is JSON before parsing
            const contentType = res.headers.get("content-type")
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const result = await res.json()
                
                if (result.error) {
                    setErrorMessage(result.error)
                    setIsEditErrorDialogOpen(true)
                } else {
                    setIsEditDialogOpen(false)
                    setIsEditSuccessDialogOpen(true)
                    fetchUsers()
                }
            } else {
                // Handle non-JSON responses (like HTML error pages)
                await res.text()
                if (!res.ok) {
                    setErrorMessage(`Server returned ${res.status} status`)
                } else {
                    setErrorMessage("Unexpected response format")
                }
                setIsEditErrorDialogOpen(true)
            }
        } catch (error) {
            console.error("Error editing user:", error)
            setErrorMessage("An unexpected error occurred while updating the user")
            setIsEditErrorDialogOpen(true)
        } finally {
            setEditingUser(false);
        }
    }

    // Delete user function
    const handleDeleteUser = async () => {
        if (!selectedUser) return

        setDeletingUser(true);
        try {
            const res = await fetch("/api/admin/deleteUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: selectedUser.user_email }),
            })

            // Check if response is ok and content type is JSON before parsing
            const contentType = res.headers.get("content-type")
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const result = await res.json()
                
                if (result.error) {
                    setErrorMessage(result.error)
                    setIsDeleteErrorDialogOpen(true)
                } else {
                    setIsDeleteDialogOpen(false)
                    setIsDeleteSuccessDialogOpen(true)
                    fetchUsers()
                }
            } else {
                // Handle non-JSON responses (like HTML error pages)
                await res.text()
                if (!res.ok) {
                    setErrorMessage(`Server returned ${res.status} status`)
                } else {
                    setErrorMessage("Unexpected response format")
                }
                setIsDeleteErrorDialogOpen(true)
            }
        } catch (error) {
            console.error("Error deleting user:", error)
            setErrorMessage("An unexpected error occurred while deleting the user")
            setIsDeleteErrorDialogOpen(true)
        } finally {
            setDeletingUser(false);
        }
    }

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddingUser(true);
        try {
            const res = await fetch("/api/admin/addUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, fullName, userClass }),
            })

            // Check if response is ok and content type is JSON before parsing
            const contentType = res.headers.get("content-type")
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const result = await res.json()
                
                if (result.error) {
                    setErrorMessage(result.error)
                    setIsAddErrorDialogOpen(true)
                } else {
                    setEmail("")
                    setPassword("")
                    setFullName("")
                    setUserClass("")
                    setIsAddDialogOpen(false)
                    setIsAddSuccessDialogOpen(true)
                    fetchUsers()
                }
            } else {
                // Handle non-JSON responses (like HTML error pages)
                await res.text()
                if (!res.ok) {
                    setErrorMessage(`Server returned ${res.status} status`)
                } else {
                    setErrorMessage("Unexpected response format")
                }
                setIsAddErrorDialogOpen(true)
            }
        } catch (error) {
            console.error("Error adding user:", error)
            setErrorMessage("An unexpected error occurred while adding the user")
            setIsAddErrorDialogOpen(true)
        } finally {
            setAddingUser(false)
        }
    }

    const handleLogout = async () => {
        try {
            console.log("Logging out user")
            await supabaseClient.auth.signOut()
            router.push("/admin/login")
        } catch (error) {
            console.error("Error during logout:", error)
            // Even if there's an error, redirect to login page
            router.push("/admin/login")
        }
    }

    const handleViewReports = (userEmail: string) => {
        router.push(`/admin/user-detail?email=${userEmail}`)
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-2">Manage users and their reports</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Button 
                            onClick={() => setIsLogoutDialogOpen(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>

                

                {/* User Management Section */}
                <Card className="border-0 shadow-lg mb-6">
                    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl">User Management</CardTitle>
                            <CardDescription>Manage student accounts and access</CardDescription>
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add New User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[450px] rounded-xl overflow-hidden shadow-2xl bg-white">
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
                                    </div>
                                    <DialogHeader className="text-white relative z-10">
                                        <DialogTitle className="text-2xl font-bold">Add New User</DialogTitle>
                                        <DialogDescription className="text-emerald-100 mt-2">
                                            Create a new student account. Enter the required information below.
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>
                                <form onSubmit={handleAddUser} className="space-y-6 py-6 px-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="student@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="pl-10 py-5 rounded-lg border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name</Label>
                                        <div className="relative">
                                            <Input
                                                id="fullName"
                                                type="text"
                                                placeholder="Student Full Name"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                                className="pl-10 py-5 rounded-lg border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="userClass" className="text-gray-700 font-medium">Class</Label>
                                        <div className="relative">
                                            <Input
                                                id="userClass"
                                                type="text"
                                                placeholder="Class 1A"
                                                value={userClass}
                                                onChange={(e) => setUserClass(e.target.value)}
                                                required
                                                className="pl-10 py-5 rounded-lg border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Secure password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="pl-10 py-5 rounded-lg border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter className="flex gap-3 pt-4">
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline" className="flex-1 py-5 rounded-lg bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm">
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 py-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300" disabled={addingUser}>
                                            {addingUser ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Creating...
                                                </div>
                                            ) : (
                                                "Create User"
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {fetchingUsers ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading users...</p>
                                </div>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                                <p className="text-gray-500 mb-6">Get started by adding a new user</p>
                                <Button 
                                    onClick={() => setIsAddDialogOpen(true)}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First User
                                </Button>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="w-16 py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">No</TableHead>
                                            <TableHead className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</TableHead>
                                            <TableHead className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</TableHead>
                                            <TableHead className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</TableHead>
                                            <TableHead className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-200">
                                        {users.map((user, index) => (
                                            <TableRow 
                                                key={index} 
                                                className="hover:bg-blue-50 transition-colors duration-150"
                                            >
                                                <TableCell className="py-4 px-4 text-sm font-medium text-gray-900">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-800 text-sm font-bold">{index + 1}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-4 text-sm font-medium text-gray-900">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-700 font-medium">
                                                                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-4 text-sm text-gray-500">
                                                    <div className="text-sm text-gray-900">{user.user_email}</div>
                                                </TableCell>
                                                <TableCell className="py-4 px-4 text-sm text-gray-500">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {user.user_class}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4 px-4 text-sm text-gray-500">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleViewReports(user.user_email)}
                                                            className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm hover:shadow-md transition-all duration-300"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Reports</span>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setIsEditDialogOpen(true);
                                                            }}
                                                            className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-300"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Edit</span>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setIsDeleteDialogOpen(true);
                                                            }}
                                                            className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm hover:shadow-md transition-all duration-300"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Delete</span>
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

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information. Leave password blank to keep current password.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <form onSubmit={handleEditUser} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="editEmail">Email</Label>
                                <Input
                                    id="editEmail"
                                    type="email"
                                    value={selectedUser.user_email}
                                    disabled
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editFullName">Full Name</Label>
                                <Input
                                    id="editFullName"
                                    type="text"
                                    value={selectedUser.full_name}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, full_name: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editUserClass">Class</Label>
                                <Input
                                    id="editUserClass"
                                    type="text"
                                    value={selectedUser.user_class}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, user_class: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editPassword">Password</Label>
                                <Input
                                    id="editPassword"
                                    type="password"
                                    placeholder="New password (optional)"
                                    value={selectedUser.user_password || ""}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, user_password: e.target.value })
                                    }
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button className="bg-white border border-gray-300 hover:bg-gray-50 text-black" type="button">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-700" disabled={editingUser}>
                                    {editingUser ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </div>
                                    ) : (
                                        "Update User"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user{" "}
                            <span className="font-semibold">{selectedUser?.full_name}</span> and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white border border-gray-300 hover:bg-gray-50">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deletingUser}
                        >
                            {deletingUser ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Deleting...
                                </div>
                            ) : (
                                "Delete User"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Add User Success Dialog */}
            <Dialog open={isAddSuccessDialogOpen} onOpenChange={setIsAddSuccessDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-green-600">Success!</DialogTitle>
                        <DialogDescription>
                            User has been added successfully.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsAddSuccessDialogOpen(false)} className="bg-green-600 hover:bg-green-700">
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Success Dialog */}
            <Dialog open={isEditSuccessDialogOpen} onOpenChange={setIsEditSuccessDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-green-600">Success!</DialogTitle>
                        <DialogDescription>
                            User has been updated successfully.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsEditSuccessDialogOpen(false)} className="bg-green-600 hover:bg-green-700">
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Success Dialog */}
            <Dialog open={isDeleteSuccessDialogOpen} onOpenChange={setIsDeleteSuccessDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-green-600">Success!</DialogTitle>
                        <DialogDescription>
                            User has been deleted successfully.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsDeleteSuccessDialogOpen(false)} className="bg-green-600 hover:bg-green-700">
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add User Error Dialog */}
            <Dialog open={isAddErrorDialogOpen} onOpenChange={setIsAddErrorDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Error!</DialogTitle>
                        <DialogDescription>
                            {errorMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsAddErrorDialogOpen(false)} className="bg-red-600 hover:bg-red-700">
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Error Dialog */}
            <Dialog open={isEditErrorDialogOpen} onOpenChange={setIsEditErrorDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Error!</DialogTitle>
                        <DialogDescription>
                            {errorMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsEditErrorDialogOpen(false)} className="bg-red-600 hover:bg-red-700">
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Error Dialog */}
            <Dialog open={isDeleteErrorDialogOpen} onOpenChange={setIsDeleteErrorDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Error!</DialogTitle>
                        <DialogDescription>
                            {errorMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsDeleteErrorDialogOpen(false)} className="bg-red-600 hover:bg-red-700">
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <AlertDialogContent className="bg-white rounded-2xl shadow-xl">
                    <AlertDialogHeader>
                        <div className="mx-auto bg-red-100 p-3 rounded-full mb-4">
                            <LogOut className="h-6 w-6 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-center text-xl font-bold text-gray-800">
                            Confirm Logout
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-gray-600 mt-2">
                            Are you sure you want to logout from the admin dashboard?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex gap-3 pt-4">
                        <AlertDialogCancel 
                            className="bg-white flex-1 py-5 text-gray-700 hover:bg-gray-50 rounded-xl"
                            onClick={() => setIsLogoutDialogOpen(false)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            className="flex-1 py-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl"
                        >
                            Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}