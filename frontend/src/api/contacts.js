import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/contacts';

/* FETCH CONTACTS */
export const fetchContacts = () => {
  return axios.get(API_BASE);
};

/* ADD CONTACT */
export const addContact = (data) => {
  return axios.post(API_BASE, data);
};

/* UPDATE CONTACT */
export const updateContact = (id, data) => {
  return axios.put(`${API_BASE}/${id}`, data);
};

/* DELETE SINGLE CONTACT */
export const deleteContact = (id) => {
  return axios.delete(`${API_BASE}/${id}`);
};

/* BULK DELETE */
export const bulkDelete = (ids) => {
  return axios.post(`${API_BASE}/bulk-delete`, { ids });
};

/* IMPORT CONTACTS */
export const importContacts = (data) => {
  return axios.post(`${API_BASE}/import`, data);
};

/* EXPORT CONTACTS */
export const exportContacts = () => {
  return axios.get(`${API_BASE}/export`, {
    responseType: 'blob'
  });
};


// TAG APIs
export const fetchTags = () =>
  axios.get(`${API_BASE}/tags`);

export const bulkAssignTag = (ids, tagId) =>
  axios.post(`${API_BASE}/bulk-tag`, {
    ids, tagId
  });

export const removeTagFromContact = (contactId, tagId) =>
  axios.post(`${API_BASE}/${contactId}/remove-tag`, {
    tagId
  });
