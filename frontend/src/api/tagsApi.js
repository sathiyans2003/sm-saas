import axios from 'axios';

const TAG_API = 'http://localhost:5000/api/tags';
const CONTACT_API = 'http://localhost:5000/api/contacts';


// ✅ FETCH TAGS
export const fetchTags = () => {
  return axios.get(TAG_API);
};

// ✅ CREATE TAG
export const createTag = (data) => {
  return axios.post(TAG_API, data);
};

// ✅ BULK ASSIGN TAG
export const bulkAssignTag = (data) => {
  return axios.post(`${CONTACT_API}/assign-tag`, data);
};
/* DELETE TAG */
export const deleteTag = (id) => {
  return axios.delete(`http://localhost:5000/api/tags/${id}`);
};
