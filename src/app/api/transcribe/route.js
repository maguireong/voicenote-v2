"use server"

import { NextResponse } from 'next/server';
import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { SpeechClient } from '@google-cloud/speech';
import { createClientForServer } from '../../../clients/supabase/server'

// Notion configuration
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

const getPublishedDate = () => new Date().toISOString();

export async function POST(request) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Initialize OAuth2 client
    const oauth2Client = new OAuth2Client(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
    );

    const supabase = await createClientForServer();
    const { data, error } = await supabase.from('tokens')
        .select('google_access_token, google_refresh_token')
        .eq('user_id', userId)
        .single()
    console.log("Retreiving tokens", data.google_access_token, data.google_refresh_token)

    oauth2Client.setCredentials({
        access_token: data.google_access_token,
        refresh_token: data.google_refresh_token,
        scope: 'https://www.googleapis.com/auth/cloud-platform'
      });
    
    console.log("Settedddd tokenss")

    // Initialize SpeechClient
    const auth = new GoogleAuth({
      authClient: oauth2Client,
    });

    console.log("Preparing auth")

    const client = new SpeechClient({ 
        auth,
        projectId: "voicenote-453810"
     });

    // Process the file
    const audioBytes = Buffer.from(await file.arrayBuffer()).toString('base64');

    console.log("Processed file")

    // Configure the request
    const speechRequest = {
        audio: { content: audioBytes },
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          model: 'latest_long',
        },
      };

    console.log("Calling speechhhh")

    // Send the request to the API
    const [response] = await client.recognize(speechRequest);

    console.log("getting response", response)

    // Extract the transcription
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    
    console.log("getting transcription", transcription)

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
        },
      }),
    });

    const notionData = await notionResponse.json();
    console.log(notionData);

    // Return the transcription
    return NextResponse.json({ transcription });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}