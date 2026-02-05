import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/chats';

// Fetch all conversations
export const fetchChats = () => {
    return axios.get(API_BASE);
};

// Start a new chat
export const startChat = (contactId) => {
    return axios.post(API_BASE, { contactId });
};

// Delete a chat
export const deleteChat = (id) => {
    return axios.delete(`${API_BASE}/${id}`);
};

// Get messages for a chat
export const getMessages = (id) => {
    return axios.get(`${API_BASE}/${id}/messages`);
};

// Send a message
export const sendMessage = (id, data) => { // data = { type, content }
    return axios.post(`${API_BASE}/${id}/messages`, data);
};

// Update chat (assign agent, change status)
export const updateChat = (id, data) => {
    return axios.put(`${API_BASE}/${id}`, data);
};
