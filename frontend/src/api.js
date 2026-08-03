import axios from 'axios'

// VITE_API_URL is empty in dev → Vite proxy handles /api → localhost:5000
// Set VITE_API_URL in production to your deployed backend URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30s — sandbox execution can take a few seconds
})

// Response interceptor: unwrap errors into a consistent shape
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default api
