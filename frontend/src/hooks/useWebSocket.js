import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';

export const useWebSocket = (onMessage) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const reconnectTimeoutRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const maxReconnectAttempts = 5;
  const userId = useSelector((state) => state.auth?.user?._id);

  // Update the ref when onMessage changes to avoid stale closures
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!userId) return;

    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionAttempts(0);
      
      // Register user with WebSocket server
      ws.send(JSON.stringify({
        type: 'register',
        userId: userId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessageRef.current) {
          onMessageRef.current(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setSocket(null);

      // Only attempt to reconnect if we haven't exceeded max attempts
      if (connectionAttempts < maxReconnectAttempts) {
        const delay = Math.min(Math.pow(2, connectionAttempts) * 1000, 30000); // Cap at 30s
        console.log(`Attempting to reconnect in ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setConnectionAttempts(prev => prev + 1);
          connect();
        }, delay);
      } else {
        console.error('Max reconnection attempts reached');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);
  }, [userId, connectionAttempts]); // Removed onMessage from dependencies

  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [userId]); 

  // Reset connection attempts when userId changes
  useEffect(() => {
    setConnectionAttempts(0);
  }, [userId]);

  const sendMessage = useCallback((message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket is not connected');
    return false;
  }, [socket]);

  const joinRoom = useCallback((roomId) => {
    return sendMessage({
      type: 'joinRoom',
      roomId,
      userId
    });
  }, [sendMessage, userId]);

  const leaveRoom = useCallback((roomId) => {
    return sendMessage({
      type: 'leaveRoom',
      roomId,
      userId
    });
  }, [sendMessage, userId]);

  const sendChatMessage = useCallback((roomId, content) => {
    return sendMessage({
      type: 'message',
      roomId,
      content,
      userId
    });
  }, [sendMessage, userId]);

  const sendTypingIndicator = useCallback((roomId, isTyping) => {
    return sendMessage({
      type: 'typing',
      roomId,
      userId,
      content: isTyping
    });
  }, [sendMessage, userId]);

  const markAsRead = useCallback((roomId) => {
    return sendMessage({
      type: 'markAsRead',
      roomId,
      userId
    });
  }, [sendMessage, userId]);

  return {
    socket,
    isConnected,
    sendMessage,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    sendTypingIndicator,
    markAsRead,
    connectionAttempts
  };
};