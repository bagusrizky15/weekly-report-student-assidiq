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
        
        // 1. Login pakai email & password
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        // 2. Cek login error
        if (error) {
            console.error("Login error:", error);
            setError("❌ Email atau password salah!");
            return;
        }

        // 3. Ambil user dari response
        const user = data?.user;
        if (!user) {
            console.error("No user in response data:", data);
            setError("❌ Terjadi kesalahan, user tidak ditemukan.");
            return;
        }
        
        console.log("User logged in:", user);

        // 4. Ambil role dari user_metadata atau tabel profiles
        //    Supabase Auth menyimpan user_metadata di JWT
        let role = user.user_metadata?.role || null;

        // Kalau role tidak ada di user_metadata, ambil dari tabel profiles
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
                    setError("❌ Gagal mengambil data role: " + result.error);
                    return;
                }

                role = result.role || "user";
            } catch (err) {
                console.error("Unexpected error when fetching profile:", err);
                setError("❌ Terjadi kesalahan tidak terduga saat mengambil data role.");
                return;
            }
        }

        // 5. Cek role, hanya admin yang bisa masuk
        if (role !== "admin") {
            setError(`❌ Akses ditolak! Role Anda: ${role}. Hanya admin yang boleh login.`);
            // Logout supaya tidak menyimpan session user biasa
            await supabaseClient.auth.signOut();
            return;
        }

        // 6. Sukses → redirect ke dashboard admin
        console.log("Redirecting to admin dashboard");
        try {
            router.push("/admin");
        } catch (err) {
            console.error("Router error:", err);
            setError("❌ Gagal mengarahkan ke dashboard admin.");
        }
    }


    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle className="text-center">Admin Login</CardTitle>
                    <CardDescription className="text-center">
                        Masuk dengan akun admin
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
                        Hanya untuk akun admin.
                    </p>
                </CardFooter>
            </Card>

            {error && (
                <div className="absolute top-4 right-4 w-[300px]">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Login Gagal</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}
        </div>
    )
}