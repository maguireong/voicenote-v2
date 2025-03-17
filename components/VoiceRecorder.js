import React, { useState, useRef } from 'react';

const VoiceRecorder = ({code}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      setAudioBlob(audioBlob);
      audioChunksRef.current = [];
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;
  
    try {
      // Create a FormData object

      console.log('Authorization Code in redirect:', code);
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav'); // Append the Blob as a file
      formData.append('authorisationCode', code); // Append the authorization code
  
      // Send the request to the API
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
  
      // Parse the response
      const result = await response.json();
  
      // Set the transcription
      setTranscription(result.transcription);
      console.log('Transcription:', result.transcription);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {audioBlob && (
        <div className="mt-4">
          <audio controls src={URL.createObjectURL(audioBlob)} />
          <button
            onClick={transcribeAudio}
            className="bg-green-500 text-white px-4 py-2 rounded mt-2"
          >
            Transcribe
          </button>
        </div>
      )}
      {transcription && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Transcription:</h2>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;