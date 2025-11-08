import axios from 'axios';

// Configure axios base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

axios.defaults.baseURL = API_URL;

export default axios;

