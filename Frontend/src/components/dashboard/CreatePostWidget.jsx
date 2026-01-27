import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPenNib, FaLock } from 'react-icons/fa6';
import { Button } from '../ui/Button';

export function CreatePostWidget({ onStart, client }) {
    const navigate = useNavigate();

    const isSuspended = client && client.isActive === false;

    const handleClick = () => {
        if (isSuspended) {
            alert("Resume the client to do posting");
            return;
        }

        if (onStart) {
            onStart();
        } else {
            navigate('/create-post-page');
        }
    };

    return (
        <div className={`rounded-xl p-6 shadow-lg flex flex-col items-center justify-center text-center h-full relative overflow-hidden transition-all ${isSuspended
            ? 'bg-gray-100 text-gray-500 border-2 border-dashed border-gray-300'
            : 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-500/20 text-white'
            }`}>
            {/* Background Decoration */}
            {!isSuspended && (
                <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-12 -mb-12 pointer-events-none" />
                </>
            )}

            <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl backdrop-blur-sm ${isSuspended ? 'bg-gray-200 text-gray-400' : 'bg-white/20'
                }`}>
                {isSuspended ? <FaLock /> : <FaPenNib />}
            </div>

            <h3 className="text-xl font-bold mb-2">
                {isSuspended ? 'Client Suspended' : 'Create New Post'}
            </h3>

            <p className={`text-sm mb-6 max-w-xs ${isSuspended ? 'text-gray-400' : 'text-blue-100'}`}>
                {isSuspended
                    ? 'Resume the client to create new posts.'
                    : 'Draft, schedule, and publish content across all your connected platforms instantly.'}
            </p>

            <Button
                onClick={handleClick}
                className={`font-bold border-none shadow-md w-full sm:w-auto ${isSuspended
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                disabled={isSuspended}
            >
                {isSuspended ? 'Suspended' : 'Start Creating'}
            </Button>
        </div>
    );
}
