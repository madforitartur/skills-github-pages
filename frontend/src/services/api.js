import axios from 'axios'
import { API_BASE_URL } from '../constants.js'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth')
  if (!raw) return config

  try {
    const { token } = JSON.parse(raw)
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // ignore
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config

    const status = error?.response?.status
    const isNetworkError = !error?.response
    const isRetryableStatus = status === 429 || (status >= 500 && status < 600)

    const retryable = (isNetworkError || isRetryableStatus) && config

    if (retryable) {
      config.__retryCount = config.__retryCount ?? 0

      if (config.__retryCount < 2) {
        config.__retryCount += 1
        const backoff = 250 * 2 ** (config.__retryCount - 1)
        await sleep(backoff)
        return api.request(config)
      }
    }

    return Promise.reject(error)
  },
)

export default api
