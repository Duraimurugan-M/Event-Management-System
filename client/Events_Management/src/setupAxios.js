import axios from 'axios';

// Set Authorization header synchronously at module load time so requests made
// during initial render (or on hard refresh) include the token.
try {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
} catch {
  // localStorage may not be available in some environments; ignore.
}

export default axios;
