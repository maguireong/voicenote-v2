"use client"

// import { useEffect, useState } from 'react';
import VoiceRecorder from '../components/VoiceRecorder';
// import { useRouter } from 'next/router';
import { signOut } from '../clients/actions'

const Recorder = ({user}) => {
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


    return (
        <div className="relative min-h-screen">
        <VoiceRecorder user={user} />
      </div>
    );
}

export default Recorder;