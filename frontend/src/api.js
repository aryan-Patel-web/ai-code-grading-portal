import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://kpmg-ai-backend.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
})

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 — just reject with the error message, do NOT clear storage or redirect
// The App component handles session state from localStorage on load
// Clearing here causes blank screen on refresh
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.error || error?.message || 'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default api