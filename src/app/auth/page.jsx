"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientForBrowser } from '../../clients/supabase/client'
import { signinWithGoogle } from '../../clients/actions'

export default function Page() {
  const router = useRouter()
  const supabase = createClientForBrowser()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/')
    })
  }, [router, supabase])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 w-full max-w-md border border-white/20 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your voice recordings</p>
        </div>

        <form className="w-full">
          <button
            formAction={signinWithGoogle}
            type="submit"
            className="w-full flex items-center justify-center bg-white text-gray-800 px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 active:scale-95"
          >
            <div className="flex items-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/48px-Google_%22G%22_logo.svg.png"
                alt="Google Logo"
                className="w-5 h-5 mr-3"
              />
              <span className="font-medium">Continue with Google</span>
            </div>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>

      {/* Optional wave decoration at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-20 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-full flex items-end">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="flex-1 bg-indigo-300/20 transition-all duration-1000 ease-in-out"
              style={{ 
                height: `${10 + Math.sin(i/2) * 15}%`,
                animation: `wave 3s infinite ${i * 0.1}s alternate`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}