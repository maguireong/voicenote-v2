
export default function Home() {
  const startOAuthFlow = () => {
    // Generate the authorization URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=429276411238-21113j0sruftbjq1rueke0l0dsq201i7.apps.googleusercontent.com&redirect_uri=http://localhost:3000/api/redirect&response_type=code&scope=https://www.googleapis.com/auth/cloud-platform&access_type=offline&prompt=consent`;
    
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