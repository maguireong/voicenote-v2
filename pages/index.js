const clientId = process.env.GOOGLE_CLIENT_ID;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;

export default function Home() {
  const startOAuthFlow = () => {
    // Generate the authorization URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/cloud-platform&access_type=offline&prompt=consent`;
    
    console.log('Authorize this app by visiting this URL:', authUrl);
  
    // Redirect the user to the authorization URL
    window.location.href = authUrl;
  };
  
  return (
    <button onClick={startOAuthFlow} className="bg-blue-500 text-white px-4 py-2 rounded">
      Sign in with Google
    </button>
  );
}