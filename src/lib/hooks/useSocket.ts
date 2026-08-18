'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
  'http://localhost:5000';

let globalSocket: Socket | null = null;

function getOrCreateSocket(): Socket {
  if (!globalSocket || globalSocket.disconnected) {
    globalSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }
  return globalSocket;
}

/**
 * Custom hook for Socket.IO connectivity.
 * Connects, joins all relevant rooms (user.id, user.clientId, user.firmId),
 * and maintains a persistent connection for real-time messaging.
 */
export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const joinAllRooms = useCallback((socket: Socket) => {
    if (!socket.connected) return;

    // 1. Join user's personal auth room
    if (user?.id) {
      socket.emit('join_user_room', user.id);
    }

    // 2. Join client record room (backend emits chat messages to user_${clientId})
    if (user?.clientId) {
      socket.emit('join_user_room', user.clientId);
    }

    // 3. Join firm rooms (backend emits chat messages to user_${firmId} and firm updates to firm_${firmId})
    if (user?.firmId) {
      socket.emit('join_firm_room', user.firmId);
      socket.emit('join_user_room', user.firmId);
    }
  }, [user?.id, user?.clientId, user?.firmId]);

  useEffect(() => {
    const socket = getOrCreateSocket();
    socketRef.current = socket;

    setIsConnected(socket.connected);

    const onConnect = () => {
      setIsConnected(true);
      joinAllRooms(socket);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // If socket is already connected, join rooms immediately
    if (socket.connected) {
      joinAllRooms(socket);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [joinAllRooms]);

  return { socket: socketRef.current, isConnected };
}
