"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabaseClient"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Alert,
    AlertTitle,
    AlertDescription,
} from "@/components/ui/alert"
import { AlertCircle, Shield } from "lucide-react"

export default function AdminLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    
    // Check if router is available
    useEffect(() => {
        if (!router) {
            console.error("Router is not available")
        }
    }, [router])

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        console.log("Attempting login with email:", email);
        
        // 1. Login with email & password
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        // 2. Check login error
        if (error) {
            console.error("Login error:", error);
            setError("❌ Email or password is incorrect!");
            return;
        }

        // 3. Get user from response
        const user = data?.user;
        if (!user) {
            console.error("No user in response data:", data);
            setError("❌ An error occurred, user not found.");
            return;
        }
        
        console.log("User logged in:", user);

        // 4. Get role from user_metadata or profiles table
        //    Supabase Auth stores user_metadata in JWT
        let role = user.user_metadata?.role || null;

        // If role is not in user_metadata, get it from profiles table
        if (!role) {
            try {
                // Call API route to check role using admin client on server
                const response = await fetch("/api/check-admin-role", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId: user.id }),
                });

                const result = await response.json();

                if (!response.ok) {
                    console.error("Role check error:", result.error);
                    setError("❌ Failed to fetch role data: " + result.error);
                    return;
                }

                role = result.role || "user";
            } catch (err) {
                console.error("Unexpected error when fetching profile:", err);
                setError("❌ An unexpected error occurred while fetching role data.");
                return;
            }
        }

        // 5. Check role, only admin can log in
        if (role !== "admin") {
            setError(`❌ Access denied! Your role: ${role}. Only admins can log in.`);
            // Logout to avoid storing regular user session
            await supabaseClient.auth.signOut();
            return;
        }

        // 6. Success → redirect to admin dashboard
        console.log("Redirecting to admin dashboard");
        try {
            router.push("/admin");
        } catch (err) {
            console.error("Router error:", err);
            setError("❌ Failed to redirect to admin dashboard.");
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 w-20 h-20 flex items-center justify-center shadow-lg mb-4">
                        <Shield className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                    <p className="text-blue-200 text-sm mt-1">Secure access for administrators</p>
                </div>
                
                <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center pb-6 pt-6">
                        <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
                        <CardDescription className="text-blue-100 mt-1 text-sm">
                            Sign in to your admin account
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 text-sm">Email Address</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@domain.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10 py-5 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700 text-sm">Password</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-10 py-5 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full py-5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold shadow-md transition-all duration-300"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Signing In...
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    
                    <CardFooter className="bg-gray-50 py-4">
                        <p className="text-xs text-gray-500 text-center">
                            Protected admin area. Unauthorized access is prohibited.
                        </p>
                    </CardFooter>
                </Card>
                
                {error && (
                    <div className="mt-4">
                        <Alert variant="destructive" className="rounded-lg shadow-md border-red-200 p-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="font-bold text-sm">Authentication Error</AlertTitle>
                            <AlertDescription className="text-xs">{error}</AlertDescription>
                        </Alert>
                    </div>
                )}
                
                <div className="mt-6 text-center">
                    <p className="text-xs text-blue-200">
                        © {new Date().getFullYear()} Admin Portal. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}