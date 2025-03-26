import { createClientForServer } from '../clients/supabase/server'
import { redirect } from 'next/navigation'
import Recorder from '../screens/Recorder'

export default async function Home() {
  const supabase = await createClientForServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth') // Automatically redirect to auth page
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      <Recorder user={user} />
    </div>
  )
}