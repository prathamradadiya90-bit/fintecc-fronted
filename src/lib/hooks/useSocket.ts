'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
  'http://localhost:5000';

let globalSocket: Socket | null = null;

/**
 * Detects whether the configured socket endpoint supports persistent Socket.IO / WebSockets.
 * Vercel Serverless Functions do not support persistent stateful WebSockets.
 * If running against a *.vercel.app backend without an explicit dedicated socket gateway,
 * we gracefully disable Socket.IO connection attempts to prevent infinite 404 handshake floods.
 */
export function isSocketHostSupported(url: string): boolean {
  if (!url || typeof window === 'undefined') return false;
  const clean = url.trim().toLowerCase();
  if (clean === 'disabled' || clean === 'none' || clean === 'false' || clean === 'off') {
    return false;
  }
  // If an explicit non-vercel socket URL is configured via NEXT_PUBLIC_SOCKET_URL, allow it
  if (process.env.NEXT_PUBLIC_SOCKET_URL && !process.env.NEXT_PUBLIC_SOCKET_URL.includes('.vercel.app')) {
    return true;
  }
  // If socket URL points to Vercel serverless domain, WebSockets are not supported
  if (clean.includes('.vercel.app')) {
    return false;
  }
  return true;
}

function getOrCreateSocket(): Socket | null {
  if (!isSocketHostSupported(SOCKET_URL)) {
    return null;
  }

  if (!globalSocket || globalSocket.disconnected) {
    try {
      globalSocket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 5000,
      });

      // Catch error so unhandled rejections do not pollute the console
      globalSocket.on('connect_error', () => {});
    } catch {
      globalSocket = null;
    }
  }
  return globalSocket;
}

/**
 * Custom hook for Socket.IO connectivity with automatic fallback for serverless deployments.
 * Connects, joins all relevant rooms (user.id, user.clientId, user.firmId),
 * and provides state flags for fallback polling when running on serverless infrastructure.
 */
export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSupported] = useState(() => isSocketHostSupported(SOCKET_URL));
  const user = useSelector((state: RootState) => state.auth.user);

  const joinAllRooms = useCallback((socket: Socket) => {
    if (!socket || !socket.connected) return;

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
    if (!isSupported) {
      setIsConnected(false);
      return;
    }

    const socket = getOrCreateSocket();
    if (!socket) {
      setIsConnected(false);
      return;
    }

    socketRef.current = socket;
    setIsConnected(socket.connected);

    const onConnect = () => {
      setIsConnected(true);
      joinAllRooms(socket);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = () => {
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // If socket is already connected, join rooms immediately
    if (socket.connected) {
      joinAllRooms(socket);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, [isSupported, joinAllRooms]);

  return {
    socket: socketRef.current,
    isConnected,
    isSupported,
    isPollingFallback: !isSupported || (!isConnected && !socketRef.current?.connected),
  };
}
