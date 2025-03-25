import { createClientForServer } from '../clients/supabase/server'
import Link from 'next/link'
import Recorder from '../screens/Recorder'

export default async function Home() {
  const supabase = await createClientForServer()

  const session = await supabase.auth.getUser()

  if (!session.data.user)
    return (
      <div className='flex flex-col items-center justify-center h-screen gap-4'>
        <h1 className='text-4xl font-bold'>Not Authenticated</h1>
        <Link className='btn' href='/auth'>
          Sign in
        </Link>
      </div>
    )

  const {
    data: {
      user: { id: userId },
    },
  } = session

  console.log(session, userId)

  return (
    <div className=''>
      <Recorder userId={userId}/>
    </div>
  )
}