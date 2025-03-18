import React, { useState, useRef } from 'react';

const VoiceRecorder = ({ code }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
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

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');
      formData.append('authorisationCode', code);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Voice Recorder</h1>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full ${
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200`}
        >
          {isRecording ? (
            <div className="flex items-center justify-center">
              <span className="mr-2">Stop Recording</span>
              <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
            </div>
          ) : (
            'Start Recording'
          )}
        </button>

        {audioBlob && (
          <div className="mt-4">
            <audio controls src={URL.createObjectURL(audioBlob)} className="w-full mt-2" />
            <button
              onClick={transcribeAudio}
              disabled={isTranscribing}
              className={`w-full ${
                isTranscribing ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
              } text-white font-semibold py-2 px-4 rounded-lg mt-2 transition-all duration-200`}
            >
              {isTranscribing ? (
                <div className="flex items-center justify-center">
                  <span className="mr-2">Transcribing...</span>
                  <div className="w-4 h-4 border-2 border-white border-t-2 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                'Transcribe'
              )}
            </button>
          </div>
        )}

        {transcription && (
          <div className="mt-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Transcription:</h2>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{transcription}</p>
            <div className="mt-4">
              <a
                href="https://www.notion.so/12e726ebeb6f80258371c7dd12c94f9d?v=f8232dced2664394b9f5a847137c11b5&pvs=4"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline"
              >
                See here for the table
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;