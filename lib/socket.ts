import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;

    connect(userId: string) {
        if (!userId) return;
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            upgrade: false
        });

        this.socket.on('connect', () => {
            console.log('📡 Socket.io connected to server');
            console.log(`👤 Joining notification room for user: ${userId}`);
            this.socket?.emit('join', userId);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    onNotification(callback: (notification: any) => void) {
        this.socket?.on('notification', callback);
    }

    offNotification() {
        this.socket?.off('notification');
    }
}

export const socketService = new SocketService();
