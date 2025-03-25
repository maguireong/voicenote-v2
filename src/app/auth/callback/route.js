import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClientForServer } from '../../../clients/supabase/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClientForServer()
    const { data: session, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log("Exchanging code for session with error if any", error)
    console.log("Datetime", (new Date(session.session.expires_at * 1000)))
    console.log("Sessionsss", session.session)
    const { error: supabaseError } = await supabase
      .from('tokens')
      .upsert({ google_access_token: session.session.provider_token, google_refresh_token: session.session.provider_refresh_token, user_id: session.user.id }, { onConflict: 'user_id' })
      .select()
    console.log("Error while saving", supabaseError)
    if (supabaseError) {
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}