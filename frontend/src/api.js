// import axios from 'axios'

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || '/api',
//   headers: { 'Content-Type': 'application/json' },
//   timeout: 120000,
// })

// // Attach JWT token on every request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })

// // Redirect to login on 401
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error?.response?.status === 401) {
//       localStorage.removeItem('token')
//       localStorage.removeItem('user')
//       window.location.href = '/login'
//     }
//     const message = error?.response?.data?.error || error?.message || 'An unexpected error occurred'
//     return Promise.reject(new Error(message))
//   }
// )

// export default api


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

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    const message = error?.response?.data?.error || error?.message || 'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default api