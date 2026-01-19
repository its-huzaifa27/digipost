import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

export function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Processing...');

    useEffect(() => {
        const code = searchParams.get('code');

        if (code) {
            connectFacebook(code);
        } else {
            setStatus('Error: No authorization code received.');
        }
    }, [searchParams]);

    const connectFacebook = async (code) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token'); // Assuming JWT is stored here

            const response = await fetch(`${API_URL}/api/meta/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('Success! Facebook connected. Redirecting...');
                setTimeout(() => navigate('/settings'), 2000);
            } else {
                setStatus(`Error: ${data.error || 'Failed to connect'}`);
            }
        } catch (error) {
            console.error('Connection error:', error);
            setStatus('Error: Could not reach backend.');
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
