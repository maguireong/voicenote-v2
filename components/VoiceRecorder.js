import React, { useState, useRef } from 'react';
import axios from 'axios';

const VoiceRecorder = () => {
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
  
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Audio = reader.result.split(',')[1]; // Extract base64 data
      try {
        const response = await axios.post('/api/transcribe', {
          file: base64Audio,
        });
        setTranscription(response.data.transcription);
        console.log('Notion Response:', response.data.notionData); // Log Notion response
      } catch (error) {
        console.error('Error transcribing audio:', error);
      }
    };
    reader.readAsDataURL(audioBlob);
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