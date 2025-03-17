const { OAuth2Client } = require('google-auth-library');
const { GoogleAuth } = require('google-auth-library');
const { SpeechClient } = require('@google-cloud/speech');
const { google } = require('googleapis');
const multer = require('multer');
const url = require('url');
require('dotenv').config();

// Notion configuration
const NOTION_TOKEN = process.env.NOTION_TOKEN || "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";
const DATABASE_ID = process.env.DATABASE_ID || "12e726ebeb6f80258371c7dd12c94f9d";

const getPublishedDate = () => new Date().toISOString();

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Use multer middleware to parse the request
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
};

export default async function handler(req, res) {
  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end(); // End the response early for OPTIONS
  }

  if (req.method !== 'POST') {
    // Handle unsupported HTTP methods
    return res.setHeader("Access-Control-Allow-Origin", "*").status(405).send("Method Not Allowed"); // Include CORS header
  }

  try {
    // Use multer to parse the request
    upload.single('file')(req, res, async (err) => {
      if (err) {
        console.error('Error parsing file upload:', err);
        return res.status(400).json({ message: 'File upload error' });
      }

      // Extract authorization code from the query parameters
      const authorizationCode = req.body.authorisationCode;

      console.log('Authorization code:', authorizationCode);

      if (!authorizationCode) {
        return res.status(400).json({ message: 'Authorization code not found' });
      }

      console.log('Initializing OAuth2 client');
      const oauth2Client = new google.auth.OAuth2(
        "429276411238-21113j0sruftbjq1rueke0l0dsq201i7.apps.googleusercontent.com",
        "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",
        "http://localhost:3000/api/redirect",
      );

      const { tokens } = await oauth2Client.getToken(authorizationCode);
      
      oauth2Client.setCredentials(tokens);
      
      console.log('Retrieving tokens');

      console.log('Initializing SpeechClient');
      // Initialize the SpeechClient with OAuth2 credentials
      const auth = new GoogleAuth({
        authClient: oauth2Client,
      });

      const client = new SpeechClient({ auth });

      // Get the file data from the request
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const audioBytes = file.buffer.toString('base64');

      // Configure the request
      const audio = {
        content: audioBytes,
      };
      const config = {
        encoding: 'WEBM_OPUS', // Adjust based on your file format
        sampleRateHertz: 48000, // Adjust based on your file
        languageCode: 'en-US', // Set the language
      };
      const request = {
        audio: audio,
        config: config,
      };

      // Send the request to the API
      const [response] = await client.recognize(request);

      // Extract the transcription
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

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
      res.status(200).json({ transcription });
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}