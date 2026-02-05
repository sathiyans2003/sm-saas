// src/components/chat/ChatWindow.jsx
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

const ChatWindow = ({ chat }) => {
  if (!chat) {
    return (
      <div className="chat-window d-flex flex-column align-items-center justify-content-center bg-light">
        <div className="text-center text-muted">
          <i className="bi bi-chat-left-text fs-1 mb-3"></i>
          <h5>Select a conversation</h5>
          <p>Choose a chat from the left or start a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window d-flex flex-column">
      <ChatHeader chat={chat} />
      <ChatMessages chat={chat} />
      <ChatInput chat={chat} />
    </div>
  );
};

export default ChatWindow;
