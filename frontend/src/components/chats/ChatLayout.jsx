import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import './chat.css';

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ChatLayout = () => {
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    if (location.state?.chat) {
      setSelectedChat(location.state.chat);
      // Clear state so refresh doesn't keep selecting it? 
      // Actually standard behavior is fine.
    }
  }, [location.state]);

  return (
    <div className="chat-layout">
      <ChatSidebar onSelectChat={setSelectedChat} selectedChatId={selectedChat?._id} />
      <ChatWindow chat={selectedChat} />
    </div>
  );
};

export default ChatLayout;
// src/components/chats/ChatLayout.jsx  