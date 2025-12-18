// API Configuration
// 환경에 맞게 BASE_URL을 변경하세요

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// API Endpoints
export const API_ENDPOINTS = {
  // Warehouse Stock APIs
  warehouse: {
    list: '/warehouse/warehouses',
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

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
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
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  },

  async put(url, data = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  },

  async delete(url) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }
}
