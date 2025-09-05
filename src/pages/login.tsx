"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabaseClient } from "@/lib/supabaseClient"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { CheckCircle2Icon } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean | null>(null)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError("Sorry, the email / password you entered is incorrect.")
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push("/")
      }, 1500)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        {/* Logo */}
        <div className="flex flex-col items-center mt-4">
          <Image
            src="/logo.jpeg"
            alt="Logo"
            width={100}
            height={100}
            className="mb-2"
          />
        </div>

        <CardHeader>
          <CardTitle className="text-center">Weekly Quran Report</CardTitle>
          <CardDescription className="text-center">
            SD Al Siddiq International
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@student.com"
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-gray-500">
            Use the email & password provided by admin.
          </p>
        </CardFooter>
      </Card>


      <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialogContent className="bg-white text-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              {error}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setError(null)}
              className="bg-black text-white hover:bg-blue-700"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ Alert Success */}
      {success && (
        <div className="absolute top-6 right-6 w-[300px]">
          <Alert className="bg-green-50 border-green-500 text-green-700">
            <CheckCircle2Icon className="text-green-600" />
            <AlertTitle>Login Successful!</AlertTitle>
            <AlertDescription>
              You will be redirected to the dashboard...
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
