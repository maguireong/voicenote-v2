"use client"

// import { useEffect, useState } from 'react';
import VoiceRecorder from '../components/VoiceRecorder';
import { supabase } from '../clients/supabase/client';
// import { useRouter } from 'next/router';
import { signOut } from '../clients/actions'

const Recorder = ({userId}) => {
    // const router = useRouter();
    // const [session, setSession] = useState(null);

  // useEffect(() => {
  //   const fetchSession = async () => {
  //     const { data: { session }, error } = await supabase.auth.getSession();
  //     console.log("Session", session);

  //     // if (error) {
  //     //   console.error('Error fetching session:', error);
  //     //   router.push('/');
  //     // }

  //     // if (!session) {
  //     //   router.push('/');
  //     // } else {
  //     //   setSession(session);
  //     // }
  //   };

  //   fetchSession();
  // }, []);

  // if (!session) {
  //   return <div>Loading...</div>;
  // }


    return <div className="container mx-auto p-4">
            <VoiceRecorder userId={userId}/>
            <form action={signOut}>
          <button className='btn' type='submit'>
            Sign Out
          </button>
        </form>
        </div>;
}

export default Recorder;