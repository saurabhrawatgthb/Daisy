'use client'
import React, { useEffect, useState } from 'react'
import { Order } from '@prisma/client'
import '../dashboard.css'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/admin/orders')
        const data = await res.json()
        setOrders(data.orders || [])
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchOrders()
  }, [])

  return (
    <div className="dashboard-wrapper">
      <h1 className="page-title">Order Management</h1>
      <div className="glass-card" style={{ padding: '30px' }}>
        {loading ? <p className="empty-state">Loading orders...</p> : orders.length === 0 ? <p className="empty-state">No orders found.</p> : (
          <table className="daisy-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Contact</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id.slice(0,8)}</td>
                  <td><strong>{o.customerName}</strong></td>
                  <td><span style={{ color: 'var(--text-muted)' }}>{o.customerEmail}</span></td>
                  <td>₹{o.totalAmount}</td>
                  <td><span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
