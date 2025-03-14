'use client';

import React, { useEffect, useState } from 'react';

const OfflineDetector = () => {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        // Check initial network status
        setIsOffline(!navigator.onLine);

        // Set up event listeners for online/offline status
        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => setIsOffline(false);

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-16 md:bottom-4 left-0 right-0 mx-auto w-11/12 md:w-1/3 bg-red-500 text-white p-3 rounded-lg shadow-lg z-50 flex items-center justify-center">
            <span className="font-bold">You are offline</span>
            <span className="ml-2">Check your internet connection</span>
        </div>
    );
};

export default OfflineDetector; 