import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

export function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Processing...');
    const processedRef = useRef(false); // Track if we've already processed this code

    useEffect(() => {
        const code = searchParams.get('code');

        if (code) {
            // Prevent double-execution in React Strict Mode
            if (processedRef.current) return;
            processedRef.current = true;

            connectFacebook(code);
        } else {
            setStatus('Error: No authorization code received.');
        }
    }, [searchParams]);

    const connectFacebook = async (code) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token'); // Assuming JWT is stored here
            const selectedClientRaw = localStorage.getItem('selectedClient');
            const selectedClient = selectedClientRaw ? JSON.parse(selectedClientRaw) : null;
            const clientId = selectedClient?.id;

            if (!clientId || clientId === 'all') {
                setStatus('Error: Please select a client before connecting social accounts.');
                return;
            }

            const response = await fetch(`${API_URL}/api/meta/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code, clientId })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('Success! Connected. Redirecting...');
                setTimeout(() => navigate('/dashboard'), 1200);
            } else {
                const errorMsg = data.error || `Server error: ${response.status}`;
                console.error('Facebook connection failed:', errorMsg);
                setStatus(`Error: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Connection error:', error);
            setStatus(`Error: ${error.message || 'Could not reach backend.'}`);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="p-8 text-center max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Connecting to Facebook</h2>
                <div className={`text-lg ${status.startsWith('Error') ? 'text-red-600' : 'text-blue-600'}`}>
                    {status}
                </div>
            </Card>
        </div>
    );
}
