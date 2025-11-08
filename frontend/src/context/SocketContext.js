import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('join-room', user.id);
      });

      newSocket.on('new-notice', (data) => {
        setNotifications(prev => [data, ...prev]);
        // You can also show a toast notification here
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('New Notice', {
            body: data.message || 'A new notice has been posted',
            icon: '/logo192.png'
          });
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);

      // Request notification permission
      if (window.Notification && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = React.useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

