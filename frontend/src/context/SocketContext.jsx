import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [invites, setInvites] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id) {
      // Connect to Socket.io backend
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      // Listen for meeting invitations from connections
      newSocket.on('meet_invite', ({ senderUsername, roomCode, connectionsList }) => {
        // Only trigger invite if the logged-in user is in the connections list
        if (connectionsList.includes(user._id)) {
          setInvites((prev) => [
            ...prev,
            { id: Math.random(), senderUsername, roomCode, time: new Date().toLocaleTimeString() }
          ]);
        }
      });

      return () => {
        newSocket.close();
      };
    } else {
      setSocket(null);
    }
  }, [user]);

  const clearInvite = (id) => {
    setInvites((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <SocketContext.Provider value={{ socket, invites, clearInvite }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
