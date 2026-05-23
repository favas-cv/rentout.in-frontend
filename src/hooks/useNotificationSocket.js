import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { selectIsAuthenticated, selectAuthToken } from '../store/authSlice';

/**
 * Hook to manage real-time notifications via WebSockets.
 * Listens for new notifications and updates the local cache/shows toasts.
 */
export const useNotificationSocket = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const token = useSelector(selectAuthToken);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        // Construct WebSocket URL dynamically based on API URL
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        let domain = '127.0.0.1:8000'; // Fallback
        
        try {
            const url = new URL(import.meta.env.VITE_API_URL);
            domain = url.host;
        } catch (e) {
            console.error('[Notification WS] Invalid VITE_API_URL, using fallback domain');
        }

        const wsUrl = `${protocol}://${domain}/ws/notifications/?token=${token}`;

        console.log(`[Notification WS] Connecting to ${wsUrl}`);
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('[Notification WS] Message received:', data);
                
                // Show toast if title is present (as per user snippet pattern)
                // Structure expected: { data: { title: "..." } } or { title: "..." }
                const title = data.data?.title || data.title;
                const message = data.data?.message || data.message || "New notification received";

                if (title) {
                    toast.success(title, {
                        icon: '🔔',
                        style: {
                            borderRadius: '1rem',
                            background: '#333',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: 'bold',
                        },
                    });
                }

                // Invalidate notifications query to fetch fresh data and update Bell count
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            } catch (err) {
                console.error('[Notification WS] Error parsing message:', err);
            }
        };

        socket.onopen = () => {
            console.log('[Notification WS] Connection established');
        };

        socket.onclose = (event) => {
            console.log('[Notification WS] Connection closed', event.reason);
        };

        socket.onerror = (err) => {
            console.error('[Notification WS] WebSocket error:', err);
        };

        // Cleanup on unmount or auth change
        return () => {
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close();
            }
        };
    }, [isAuthenticated, token, queryClient]);
};

export default useNotificationSocket;
