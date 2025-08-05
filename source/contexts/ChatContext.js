import React, { createContext, useState, useEffect, useContext } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../configs/firebaseConfig';
import { AuthContext } from './AuthContext';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const chatRoomsRef = ref(db, `chatRooms/${user.id}`);

    const unsubscribe = onValue(chatRoomsRef, async (snapshot) => {
      let count = 0;
      const rooms = snapshot.val();
      if (!rooms) return;

      Object.entries(rooms).forEach(([otherUserId, info]) => {
        if (info?.unreadCount && info?.unreadCount > 0) {
          count += info.unreadCount;
        }
      });

      setTotalUnread(count);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <ChatContext.Provider value={{ totalUnread }}>
      {children}
    </ChatContext.Provider>
  );
};
