import axios from 'axios';

const API_SEGMENTS = 'http://localhost:5000/api/segments';
const API_IMPORTS = 'http://localhost:5000/api/imports';

export const fetchSegments = () => axios.get(API_SEGMENTS);
export const fetchImports = () => axios.get(API_IMPORTS);
