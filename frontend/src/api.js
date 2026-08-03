import axios from 'axios'

// VITE_API_URL is empty in dev → Vite proxy handles /api → localhost:5000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000, // 120s — Mistral can be slow; sandbox also needs time
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
