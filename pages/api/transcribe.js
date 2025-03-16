import { SpeechClient } from '@google-cloud/speech';
import fs from 'fs';
import path from 'path';

const NOTION_TOKEN = "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";
const DATABASE_ID = "12e726ebeb6f80258371c7dd12c94f9d";

const getPublishedDate = () => new Date().toISOString();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Save the uploaded file temporarily
    const file = req.body.file;
    const filePath = path.join(process.cwd(), 'temp-audio.wav');
    fs.writeFileSync(filePath, Buffer.from(file, 'base64'));

    console.log('Audio file saved:', filePath);

    // Initialize Google Cloud Speech-to-Text client
    const client = new SpeechClient();

    // Read the audio file
    const audio = {
      content: fs.readFileSync(filePath).toString('base64'),
    };

    // Configure the request
    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
    };

    const request = {
      audio: audio,
      config: config,
    };

    // Transcribe the audio
    console.log('Request:', request);
    const [response] = await client.recognize(request);
    // console.log(request.audio.content);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    
    console.log(response, transcription);

    // Save transcription to Notion
    const notionResponse = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: {
          Date: {
            date: {
              start: getPublishedDate(),
            },
          },
  
          Text: {
            title: [
              {
                text: {
                  content: transcription,
                  link: null,
                },
              },
            ],
          },
        }
      })
    });

    const notionData = await notionResponse.json();

    console.log(notionData);

    // Delete the temporary file
    fs.unlinkSync(filePath);

    // Return the transcription and Notion response
    res.status(200).json({ transcription, notionData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}