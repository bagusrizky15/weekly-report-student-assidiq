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
import { AlertCircle } from "lucide-react"

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
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle className="text-center">Admin Login</CardTitle>
                    <CardDescription className="text-center">
                        Sign in with admin account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Login"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-gray-500 text-center w-full">
                        For admin accounts only.
                    </p>
                </CardFooter>
            </Card>

            {error && (
                <div className="absolute top-4 right-4 w-[300px]">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Login Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}
        </div>
    )
}