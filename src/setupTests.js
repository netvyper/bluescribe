import axios from 'axios';

// Route API requests to the local backend during JSDOM testing
axios.defaults.baseURL = 'http://localhost:3001';
