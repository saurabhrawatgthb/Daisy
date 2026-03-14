import React from 'react'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import './dashboard.css'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const productsCount = await prisma.product.count()
  const ordersCount = await prisma.order.count()
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })
  
  const totalRevenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: 'Paid' } // Assuming Paid orders only
  })

  return (
    <div className="dashboard-wrapper">
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <h3>Total Products</h3>
          <p className="stat-value">{productsCount}</p>
        </div>
        <div className="stat-card glass-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{ordersCount}</p>
        </div>
        <div className="stat-card glass-card">
          <h3>Revenue</h3>
          <p className="stat-value">₹{totalRevenue._sum.totalAmount || 0}</p>
        </div>
      </div>

      <div className="recent-orders glass-card">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <Link href="/admin/orders" className="view-all">View All</Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <p className="empty-state">No orders yet.</p>
        ) : (
          <table className="daisy-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id.slice(0,8)}</td>
                  <td>{order.customerName}</td>
                  <td>₹{order.totalAmount}</td>
                  <td><span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span></td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
