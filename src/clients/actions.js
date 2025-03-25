'use server'

import { createClientForServer } from './supabase/server'
import { redirect } from 'next/navigation'

const signInWith = provider => async () => {
  const supabase = await createClientForServer()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      scopes: 'https://www.googleapis.com/auth/cloud-platform', // Critical scope
      redirectTo: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
      queryParams: {
        access_type: 'offline', // Required for refresh token
        prompt: 'consent' // Forces Google to return refresh token
      }
    },
  })

  console.log(data)

  if (error) {
    console.log(error)
  }

  redirect(data.url)
}

const signinWithGoogle = signInWith('google')

const signOut = async () => {
  const supabase = await createClientForServer()
  await supabase.auth.signOut()
}

export { signinWithGoogle, signOut }