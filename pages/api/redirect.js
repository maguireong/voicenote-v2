import { OAuth2Client } from 'google-auth-library';

export default async function handler(req, res) {
  console.log("Serverless Function Called");
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the authorization code from the query parameters
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is missing' });
    }

    console.log('Authorization Code:', code);

    // Initialize OAuth2 client
    // const oauth2Client = new OAuth2Client(
    //   process.env.GOOGLE_CLIENT_ID,
    //   process.env.GOOGLE_CLIENT_SECRET,
    //   process.env.GOOGLE_REDIRECT_URI
    // );

    // Exchange the authorization code for tokens
    // const { tokens } = await oauth2Client.getToken(code);
    // console.log('Tokens:', tokens);

    // // Save the refresh token (if needed)
    // if (tokens.refresh_token) {
    //   console.log('Refresh Token:', tokens.refresh_token);
    //   process.env[] = tokens.refresh_token;
    //   // Store the refresh token securely (e.g., in a database or environment variable)
    // }

    // Redirect the user back to your app
    res.redirect(`/redirect?code=${code}`);
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}