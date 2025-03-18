const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

export default function Home() {
  const startOAuthFlow = () => {
    // Generate the authorization URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/cloud-platform&access_type=offline&prompt=consent`;
    
    console.log('Authorize this app by visiting this URL:', authUrl);
  
    // Redirect the user to the authorization URL
    window.location.href = authUrl;
  };
  
  return (
    <div className="flex justify-center"><button
      onClick={startOAuthFlow}
      className="flex items-center justify-center bg-white text-gray-700 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-gray-300"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/48px-Google_%22G%22_logo.svg.png"
        alt="Google Logo"
        className="w-6 h-6 mr-3"
      />
      <span className="font-medium">Sign in with Google</span>
    </button></div>
  );
}