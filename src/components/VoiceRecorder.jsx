import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { signOut } from '../clients/actions'

const VoiceRecorder = ({ user }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [volumeLevels, setVolumeLevels] = useState(Array(20).fill(10));
  
  // Audio analysis refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  const updateWaveform = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate average volume
    const values = Array.from(dataArrayRef.current);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Update wave points based on volume
    setVolumeLevels(prev => {
      const newLevels = [...prev];
      newLevels.shift(); // Remove oldest value
      // Add new value (normalized to 0-40 range)
      newLevels.push(Math.min(40, average / 2.5));
      return newLevels;
    });
    
    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis
      audioContextRef.current = new (window.AudioContext || (window).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 32;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      // Start animation loop
      updateWaveform();
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
        
        // Stop animation
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');
      formData.append('userId', user.id);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setTranscription(result.transcription);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4 relative">
      {/* Logout button positioned at top-right */}
      <form 
        action={signOut}
        method="POST"
        className="absolute top-4 right-4"
      >
        <button
          type="submit"
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors bg-white/80 hover:bg-white px-4 py-2 rounded-full shadow-sm border border-white/20 backdrop-blur-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </form>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Voice Recorder</h1>
            <p className="text-sm text-gray-500">Welcome back, {user.user_metadata.name}</p>
          </div>
          <Image
            src={user.user_metadata.avatar_url}
            alt="User avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>

        {/* Wave visualization - now responds to actual volume */}
        <div className="relative mb-8 h-20 w-full overflow-hidden rounded-lg bg-indigo-50/50">
          <div className="absolute bottom-0 left-0 right-0 h-full flex items-end">
            {volumeLevels.map((height, index) => (
              <div 
                key={index}
                className="flex-1 bg-indigo-400/50 transition-all duration-100 ease-out"
                style={{ 
                  height: `${isRecording ? height : 10}%`,
                  backgroundColor: isRecording 
                    ? `rgba(99, 102, 241, ${0.3 + (height / 40) * 0.7})` 
                    : 'rgba(99, 102, 241, 0.2)'
                }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
              : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200'
          } text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-md active:scale-95`}
        >
          {isRecording ? (
            <div className="flex items-center justify-center space-x-2">
              <span>Stop Recording</span>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Start Recording</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>

        {audioBlob && (
          <div className="mt-6 space-y-4 animate-fade-in">
            <audio 
              controls 
              src={URL.createObjectURL(audioBlob)} 
              className="w-full rounded-lg bg-gray-50 [&::-webkit-media-controls-panel]:bg-gray-100"
            />
            <button
              onClick={transcribeAudio}
              disabled={isTranscribing}
              className={`w-full ${
                isTranscribing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
              } text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-md active:scale-95`}
            >
              {isTranscribing ? (
                <div className="flex items-center justify-center space-x-2">
                  <span>Transcribing</span>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Transcribe</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        )}

        {transcription && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Transcription</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{transcription}</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href="https://www.notion.so/12e726ebeb6f80258371c7dd12c94f9d?v=f8232dced2664394b9f5a847137c11b5&pvs=4"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>View Table</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;