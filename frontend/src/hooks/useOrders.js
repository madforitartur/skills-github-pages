import { useCallback, useState } from 'react'
import ordersService from '../services/ordersService.js'

export function useOrders() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [orders, setOrders] = useState([])

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await ordersService.list()
      setOrders(data)
      return data
    } catch (e) {
      setError(e)
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchOrderById = useCallback(async (id) => {
    setIsLoading(true)
    setError(null)
    try {
      return await ordersService.getById(id)
    } catch (e) {
      setError(e)
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isLoading, error, orders, fetchOrders, fetchOrderById }
}
