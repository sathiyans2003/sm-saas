import React, { useState, useEffect } from 'react';
import { fetchChats, startChat } from '../../api/chatsApi';
import { fetchContacts, addContact } from '../../api/contactsApi';

import { countries } from '../../utils/countries';

const ChatSidebar = ({ onSelectChat, selectedChatId }) => {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // New Chat Modal State
  const [showNewChat, setShowNewChat] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');

  // Phone Number state
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [startingChat, setStartingChat] = useState(false);

  // Country Code State
  const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.code === 'IN') || countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await fetchChats();
      setConversations(res.data);
    } catch (err) {
      console.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewChat = async () => {
    setShowNewChat(true);
    setNewPhoneNumber('');
    // Reset country search on open
    setCountrySearch('');
    try {
      const res = await fetchContacts(1, 1000); // Fetch all for selection
      setAllContacts(res.data.contacts);
    } catch (err) {
      console.error("Failed to load contacts");
    }
  };

  const handleStartChat = async (contactId) => {
    if (!contactId) {
      alert("Invalid contact ID");
      return;
    }
    try {
      const res = await startChat(contactId);
      setShowNewChat(false);
      const newChat = res.data;
      onSelectChat(newChat); // Select immediately so UI updates
      loadConversations(); // Refresh list in background
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to start chat (Server Error)");
    }
  };

  const handleStartNewNumber = async () => {
    if (!newPhoneNumber.trim()) return;
    setStartingChat(true);
    try {
      // Combine Code + Number. Strip leading 0s or + from input to be safe
      const cleanNumber = newPhoneNumber.trim().replace(/^0+/, '').replace(/^\+/, '');
      const fullPhone = `+${selectedCountry.phone}${cleanNumber}`;

      // 1. Check if number exists 
      // Check match for full phone OR raw input (in case they typed full number)
      const existing = allContacts.find(c =>
        c.phone === fullPhone ||
        c.phone === newPhoneNumber ||
        c.phone === `+${newPhoneNumber}`
      );

      if (existing) {
        await handleStartChat(existing._id);
        setStartingChat(false);
        return;
      }

      // 2. Create new contact
      const newContactPayload = {
        name: fullPhone, // Use full international format as name initially
        phone: fullPhone,
        email: '',
        customAttributes: {}
      };

      const contactRes = await addContact(newContactPayload);

      // 3. Start Chat
      await handleStartChat(contactRes.data._id);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to create contact or start chat.");
    } finally {
      setStartingChat(false);
    }
  };

  // Filter countries
  const filteredCountries = countries.filter(c =>
    c.label.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.phone.includes(countrySearch)
  );

  const filteredConversations = conversations.filter(c =>
    c.contactId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.contactId?.phone?.includes(search)
  );

  const filteredContacts = allContacts.filter(c =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.phone.includes(contactSearch)
  );

  return (
    <div className="chat-sidebar d-flex flex-column h-100 border-end position-relative">
      {/* Header */}
      <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
        <h6 className="fw-bold mb-0">Chats</h6>
        <button
          className="btn btn-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: 32, height: 32 }}
          onClick={handleOpenNewChat}
          title="New Chat"
        >
          <i className="bi bi-plus-lg"></i>
        </button>
      </div>

      {/* Search */}
      <div className="p-3 pt-2 pb-2">
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
          <input
            className="form-control bg-light border-start-0"
            placeholder="Search chats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-grow-1 overflow-auto">
        {loading ? (
          <div className="text-center p-3 text-muted small">Loading...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <i className="bi bi-chat-square-text fs-3 d-block mb-2"></i>
            <small>No active chats.<br />Click + to start one.</small>
          </div>
        ) : (
          filteredConversations.map(chat => (
            <div
              key={chat._id}
              className={`chat-item d-flex align-items-center p-3 border-bottom pointer ${selectedChatId === chat._id ? 'bg-light border-start border-4 border-primary' : 'hover-bg-light'}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="avatar rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 40, height: 40 }}>
                {chat.contactId?.name?.charAt(0).toUpperCase() || '#'}
              </div>
              <div className="chat-info flex-grow-1 overflow-hidden" style={{ minWidth: 0 }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 text-truncate" style={{ fontSize: '0.95rem' }}>{chat.contactId?.name || 'Unknown'}</h6>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </small>
                </div>
                <div className="text-muted text-truncate small" style={{ fontSize: '0.85rem' }}>
                  {chat.lastMessage || 'Start a conversation'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Chat Modal Overlay */}
      {showNewChat && (
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-white d-flex flex-column" style={{ zIndex: 10 }}>
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
            <h6 className="fw-bold mb-0">New Conversation</h6>
            <button className="btn btn-link text-dark p-0" onClick={() => setShowNewChat(false)}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="p-3 border-bottom bg-light position-relative">
            <label className="form-label small fw-bold text-muted">Phone Number</label>
            <div className="input-group mb-2">
              <button
                className="btn btn-white bg-white border dropdown-toggle d-flex align-items-center"
                type="button"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              >
                <img
                  src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                  alt={selectedCountry.code}
                  style={{ width: 24, height: 16, objectFit: 'cover' }}
                  className="me-1"
                />
              </button>
              <input
                type="number" // Number input for phone
                className="form-control"
                placeholder="Enter phone number"
                value={newPhoneNumber}
                onChange={e => setNewPhoneNumber(e.target.value)}
              />
            </div>

            {/* Country Dropdown */}
            {showCountryDropdown && (
              <div className="position-absolute start-0 bg-white border shadow rounded" style={{ top: '100%', left: 16, width: 300, zIndex: 1000, maxHeight: 300, overflow: 'auto' }}>
                <div className="p-2 border-bottom sticky-top bg-white">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
                    <input
                      className="form-control bg-light border-start-0"
                      placeholder="Search country..."
                      autoFocus
                      value={countrySearch}
                      onChange={e => setCountrySearch(e.target.value)}
                    />
                  </div>
                </div>
                {filteredCountries.map(country => (
                  <div
                    key={country.code}
                    className="d-flex align-items-center justify-content-between p-2 px-3 pointer hover-bg-light"
                    onClick={() => {
                      setSelectedCountry(country);
                      setShowCountryDropdown(false);
                      setCountrySearch('');
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                        alt={country.code}
                        style={{ width: 24, height: 16, objectFit: 'cover' }}
                        className="me-2"
                      />
                      <span className="small fw-bold">{country.label}</span>
                    </div>
                    <span className="text-muted small">+{country.phone}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn btn-success w-100 text-white"
              onClick={handleStartNewNumber}
              disabled={startingChat || !newPhoneNumber}
            >
              {startingChat ? 'Starting...' : 'Start Conversation'}
            </button>
          </div>

          <div className="p-2 border-bottom">
            <input
              className="form-control form-control-sm"
              placeholder="Or search contacts..."
              value={contactSearch}
              onChange={e => setContactSearch(e.target.value)}
            />
          </div>
          <div className="flex-grow-1 overflow-auto">
            {filteredContacts.map(contact => (
              <div
                key={contact._id}
                className="d-flex align-items-center p-3 border-bottom pointer hover-bg-light"
                onClick={() => handleStartChat(contact._id)}
              >
                <div className="avatar rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3" style={{ width: 36, height: 36 }}>
                  {contact.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h6 className="mb-0 small fw-bold">{contact.name}</h6>
                  <small className="text-muted">{contact.phone}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
