// src/components/chat/ChatHeader.jsx
const ChatHeader = ({ chat }) => {
  const contactName = chat.contactId?.name || chat.contactId?.phone || 'Unknown';

  return (
    <div className="chat-header d-flex align-items-center p-3 border-bottom bg-white">
      <div className="avatar rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40 }}>
        {contactName.charAt(0).toUpperCase()}
      </div>
      <div>
        <div className="fw-bold">{contactName}</div>
        <small className="text-muted">{chat.contactId?.phone}</small>
      </div>
    </div>
  );
};

export default ChatHeader;
