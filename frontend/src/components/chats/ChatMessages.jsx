// src/components/chat/ChatMessages.jsx
const ChatMessages = ({ chat }) => {
  return (
    <div className="chat-messages p-3 bg-light flex-grow-1 overflow-auto d-flex flex-column justify-content-center align-items-center">
      <div className="text-muted small">
        No messages yet. Start the conversation!
      </div>
    </div>
  );
};

export default ChatMessages;
