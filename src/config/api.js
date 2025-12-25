// API Configuration
// 환경에 맞게 BASE_URL을 변경하세요

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// API Endpoints
export const API_ENDPOINTS = {
  // Warehouse Stock APIs
  warehouse: {
    list: '/warehouses',
    stocks: '/warehouse/stocks',
    stockDetail: (id) => `/warehouse/stocks/${id}`
  },

  // 필요시 다른 API 엔드포인트 추가
  // order: {
  //   list: '/orders',
  //   detail: (id) => `/orders/${id}`
  // },
  // production: {
  //   workOrders: '/production/work-orders'
  // }
}

// HTTP Helper Functions
export const apiClient = {
  async get(url, params = {}) {
    try {
      // 빈 값 제거
      const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {})

      const queryString = new URLSearchParams(filteredParams).toString()
      const fullUrl = `${API_BASE_URL}${url}${queryString ? '?' + queryString : ''}`

      console.log('API Request:', fullUrl)

      const token = localStorage.getItem('accessToken')
      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers,
        mode: 'cors',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)

        // 401 Unauthorized - 로그인 페이지로 리다이렉트
        if (response.status === 401) {
          localStorage.removeItem('accessToken')
          const currentPath = window.location.pathname
          if (!currentPath.startsWith('/login')) {
            window.location.href = '/login'
          }
        }

        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      return data
    } catch (error) {
      console.error('API Request Failed:', error)
      throw error
    }
  },

  async post(url, data = {}) {
    const token = localStorage.getItem('accessToken')
    const headers = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      credentials: 'include'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)

      // 401 Unauthorized - 로그인 페이지로 리다이렉트
      if (response.status === 401) {
        localStorage.removeItem('accessToken')
        const currentPath = window.location.pathname
        if (!currentPath.startsWith('/login')) {
          window.location.href = '/login'
        }
      }

      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  },

  async put(url, data = {}) {
    const token = localStorage.getItem('accessToken')
    const headers = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      credentials: 'include'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)

      // 401 Unauthorized - 로그인 페이지로 리다이렉트
      if (response.status === 401) {
        localStorage.removeItem('accessToken')
        const currentPath = window.location.pathname
        if (!currentPath.startsWith('/login')) {
          window.location.href = '/login'
        }
      }

      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  },

  async delete(url) {
    const token = localStorage.getItem('accessToken')
    const headers = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers,
      credentials: 'include'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)

      // 401 Unauthorized - 로그인 페이지로 리다이렉트
      if (response.status === 401) {
        localStorage.removeItem('accessToken')
        const currentPath = window.location.pathname
        if (!currentPath.startsWith('/login')) {
          window.location.href = '/login'
        }
      }

      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  },

  async patch(url, data = {}) {
    const token = localStorage.getItem('accessToken')
    const headers = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
      credentials: 'include'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)

      // 401 Unauthorized - 로그인 페이지로 리다이렉트
      if (response.status === 401) {
        localStorage.removeItem('accessToken')
        const currentPath = window.location.pathname
        if (!currentPath.startsWith('/login')) {
          window.location.href = '/login'
        }
      }

      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }
}
