"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabaseClient } from "@/lib/supabaseClient"
import {
  Card,
  CardContent,
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
  AlertDialogDescription,
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
  const [userName, setUserName] = useState("")
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
      // Fetch user's full name after successful login
      const {data: userData} = await supabaseClient
        .from('profiles')
        .select('full_name')
        .eq('user_email', email)
        .single()

      if (userData?.full_name) {
        setUserName(userData.full_name)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/")
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden bg-white/95 backdrop-blur-sm">
          {/* Logo Section */}
          <div className="flex flex-col items-center pt-8 pb-4">
            <div className="bg-white rounded-2xl p-4 w-24 h-24 flex items-center justify-center shadow-lg mb-4 border border-gray-200">
              <Image
                src="/logo.jpeg"
                alt="School Logo"
                width={80}
                height={80}
                className="rounded-xl"
              />
            </div>
            <div className="text-center px-8">
              <CardTitle className="text-2xl font-bold text-gray-800">Weekly Quran Report</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                SD Al Siddiq International
              </CardDescription>
            </div>
          </div>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@alsiddiq.sch.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 py-6 rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
                    className="pl-12 py-6 rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base shadow-sm"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="bg-gray-50 py-4 px-8">
            <p className="text-xs text-gray-500 text-center w-full">
              Use the email & password provided by your school administrator.
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} SD Al Siddiq International. All rights reserved.
          </p>
        </div>
      </div>

      <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialogContent className="bg-white text-black rounded-2xl shadow-xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-red-100 p-3 rounded-full mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold text-gray-800">
              Login Failed
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 mt-2">
              {error}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setError(null)}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl"
            >
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ Alert Success */}
      {success && (
        <div className="fixed top-6 right-6 w-[450px] z-50"> {/* Increased width */}
          <Alert className="bg-green-50 border-green-500 text-green-700 rounded-2xl shadow-xl p-4"> {/* Added padding */}
            <div className="flex items-center space-x-3"> {/* Added space between items */}
              <CheckCircle2Icon className="h-6 w-6 text-green-600 flex-shrink-0" /> {/* Added flex-shrink-0 */}
              <div className="flex-1"> {/* Simplified div structure */}
                <AlertTitle className="font-bold">Login Successful!</AlertTitle>
                <AlertDescription className="flex items-center gap-1 mt-1">
                  Welcome <span className="font-medium">{userName ? userName : 'Student'}</span>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </div>
      )}
    </div>
  )
}
