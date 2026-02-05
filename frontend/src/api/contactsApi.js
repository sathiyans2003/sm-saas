import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/contacts';
const TAG_API = 'http://localhost:5000/api/tags';

console.log('CONTACTS API LOADED');

/* =========================
   CONTACTS
========================= */

// ✅ FETCH CONTACTS (pagination + tag filter)
export const fetchContacts = (page = 1, limit = 20, tag = '') => {
  return axios.get(API_BASE, {
    params: { page, limit, tag }
  });
};

// ✅ ADD CONTACT
export const addContact = (data) => {
  return axios.post(API_BASE, data);
};

// ✅ UPDATE CONTACT
export const updateContact = (id, data) => {
  return axios.put(`${API_BASE}/${id}`, data);
};

// ✅ DELETE SINGLE CONTACT
export const deleteContact = (id) => {
  return axios.delete(`${API_BASE}/${id}`);
};

// ✅ DELETE ALL CONTACTS
export const deleteAllContacts = () => {
  return axios.delete(`${API_BASE}/delete-all`);
};

// ✅ BULK DELETE
export const bulkDelete = (ids) => {
  return axios.post(`${API_BASE}/bulk-delete`, { ids });
};

// ✅ IMPORT CONTACTS (JSON Payload)
export const importContacts = (data) => {
  return axios.post(`${API_BASE}/import`, data);
};

// ✅ EXPORT CONTACTS
export const exportContacts = () => {
  return axios.get(`${API_BASE}/export`, {
    responseType: 'blob'
  });
};

/* =========================
   TAGS
========================= */

// ✅ FETCH TAGS
export const fetchTags = () => {
  return axios.get(TAG_API);
};

// ✅ BULK ASSIGN TAG  🔥 BACKEND MATCH
export const bulkAssignTag = ({ tagId, contactIds, allSelected }) => {
  return axios.post(`${API_BASE}/assign-tag`, {
    tagId,
    contactIds,
    allSelected
  });
};

// ✅ REMOVE TAG FROM CONTACT  🔥 BACKEND MATCH
export const removeTagFromContact = (contactId, tagId) => {
  return axios.post(`${API_BASE}/remove-tag`, {
    contactId,
    tagId
  });
};
