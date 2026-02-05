import { useState } from 'react';
import { sendMessage } from '../../api/whatsappApi';

const ChatInput = ({ chat, onMessageSent }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const selectedSenderId = localStorage.getItem('selectedSenderId');

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;

    if (!selectedSenderId) {
      alert("Please select a Sender Number from 'WhatsApp Features > Manage Phone Numbers' first.");
      return;
    }

    setSending(true);
    try {
      await sendMessage({
        conversationId: chat._id,
        text,
        type: 'text',
        senderId: selectedSenderId
      });
      setText('');
      if (onMessageSent) onMessageSent();
    } catch (err) {
      console.error(err);
      alert("Failed to send message: " + (err.response?.data?.msg || err.message));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input p-3 bg-light border-top">
      {/* Sender Info - Optional but helpful */}
      {selectedSenderId && (
        <div className="text-muted small mb-1 ms-1" style={{ fontSize: '0.7em' }}>
          Sending as: <span className="fw-bold">{selectedSenderId.slice(-4).padStart(selectedSenderId.length, '*')}</span> (ID)
        </div>
      )}
      <div className="input-group bg-white rounded-pill shadow-sm overflow-hidden border">
        <button className="btn btn-white border-0 ps-3 text-muted">
          <i className="bi bi-emoji-smile"></i>
        </button>
        <button className="btn btn-white border-0 text-muted">
          <i className="bi bi-paperclip"></i>
        </button>
        <input
          type="text"
          className="form-control border-0 shadow-none"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className={`btn border-0 pe-3 ${text.trim() ? 'text-primary' : 'text-muted'}`}
          onClick={handleSend}
          disabled={sending || !text.trim()}
        >
          {sending ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-send-fill fs-5"></i>}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
