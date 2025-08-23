import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';

export const useWebSocket = (onMessage) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;
  const userId = useSelector((state) => state.auth?.user?._id);

  const connect = useCallback(() => {
    if (!userId) return;

    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionAttempts(0);
      
      
      ws.send(JSON.stringify({
        type: 'register',
        userId: userId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setSocket(null);

      // Attempt to reconnect
      if (connectionAttempts < maxReconnectAttempts) {
        const delay = Math.pow(2, connectionAttempts) * 1000; // Exponential backoff
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
  }, [userId, connectionAttempts, onMessage]);

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
  }, [userId, connect]);

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