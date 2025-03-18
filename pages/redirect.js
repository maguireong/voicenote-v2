import VoiceRecorder from '../components/VoiceRecorder';
import { useRouter } from 'next/router';

export default function Redirect() {
    const router = useRouter();
    const { code } = router.query; // Extract the code from the URL

    return Boolean(code) ? (
        <div className="container mx-auto p-4">
            <VoiceRecorder code={code} />
        </div>
    ) : <div>Loading...</div>;
}