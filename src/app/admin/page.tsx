'use client';

import {useEffect, useState} from 'react';
import api from '@/lib/api';

interface OrderItem {
    id: number;
    menuItemName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    specialInstructions?: string;
}

interface Order {
    id: number;
    orderNumber: string;
    status: string;
    customerName: string;
    customerPhone: string;
    totalAmount: string;
    createdAt: string;
    items: OrderItem[];
}

export default function AdminPage(){
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async() => {
        const res = await api.get('/api/orders');
        setOrders(res.data);
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleAccept = async (id: number) => {
        await api.patch(`/api/orders/${id}/accept`);
        fetchOrders();
    };

    const handleDecline = async (id: number, orderNumber: string) => {
        const confirmed = window.confirm(`确认取消订单 ${orderNumber}？\n此操作将自动退款给顾客，无法撤销。`);
        if (!confirmed) return;
        await api.patch(`/api/orders/${id}/cancel`);
        fetchOrders();
    };

    const handleReady = async (id: number) => {
        await api.patch(`/api/orders/${id}/ready`);
        fetchOrders();
    };

    const handleComplete = async (id: number) => {
        await api.patch(`/api/orders/${id}/complete`);
        fetchOrders();
    };

    const paidOrders = orders.filter(o => o.status === 'PAID');
    const preparingOrders = orders.filter(o => o.status === 'PREPARING');
    const readyOrders = orders.filter(o => o.status === 'READY');
    const today = new Date().toDateString();

    const todayRevenue = orders
        .filter(o => {
            const orderDate = new Date(o.createdAt).toDateString();
            return orderDate === today && !['CANCELLED', 'PENDING_PAYMENT'].includes(o.status);})
        .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <p className="text-gray-500">Loading...</p>
        </div>
    );

    return (
        <div className="p-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-xl font-semibold">Kitchen Dashboard</h1>
                    <p className="text-sm text-gray-500">Auto-refreshes every 10 seconds</p>
                </div>
                <button onClick={fetchOrders}
                        className="border px-4 py-2 rounded-lg text-sm text-gray-600">
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'New orders', value: paidOrders.length },
                    { label: 'Preparing', value: preparingOrders.length },
                    { label: 'Ready', value: readyOrders.length },
                    { label: "Today's revenue", value: `$${todayRevenue.toFixed(2)}` },
                ].map(stat => (
                    <div key={stat.label} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                        <p className="text-xl font-semibold">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Three columns */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-sm font-medium text-gray-500 uppercase">New Orders</h2>
                        {paidOrders.length > 0 && (
                            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                {paidOrders.length}
              </span>
                        )}
                    </div>
                    {paidOrders.length === 0 && <p className="text-gray-400 text-sm">No new orders</p>}
                    {paidOrders.map(order => (
                        <OrderCard key={order.id} order={order}
                                   onAccept={() => handleAccept(order.id)}
                                   onDecline={() => handleDecline(order.id, order.orderNumber)} />
                    ))}
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-sm font-medium text-gray-500 uppercase">Preparing</h2>
                        {preparingOrders.length > 0 && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                {preparingOrders.length}
              </span>
                        )}
                    </div>
                    {preparingOrders.length === 0 && <p className="text-gray-400 text-sm">Nothing preparing</p>}
                    {preparingOrders.map(order => (
                        <OrderCard key={order.id} order={order}
                                   onReady={() => handleReady(order.id)} />
                    ))}
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-sm font-medium text-gray-500 uppercase">Ready for Pickup</h2>
                        {readyOrders.length > 0 && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                {readyOrders.length}
              </span>
                        )}
                    </div>
                    {readyOrders.length === 0 && <p className="text-gray-400 text-sm">Nothing ready</p>}
                    {readyOrders.map(order => (
                        <OrderCard key={order.id} order={order}
                                   onComplete={() => handleComplete(order.id)} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function OrderCard({ order, onAccept, onDecline, onReady, onComplete }: {
    order: Order;
    onAccept?: () => void;
    onDecline?: () => void;
    onReady?: () => void;
    onComplete?: () => void;
}) {
    return (
        <div className={`bg-white border rounded-xl p-4 mb-3 ${
            order.status === 'PAID' ? 'border-l-4 border-l-orange-400' : ''
        }`}>
            <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-sm">{order.orderNumber}</span>
                <span className="text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleTimeString([], {
              hour: '2-digit', minute: '2-digit'
          })}
        </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
                {order.customerName} · {order.customerPhone}
            </p>
            <div className="border-t my-2" />
            {order.items?.map(item => (
                <div key={item.id} className="flex justify-between text-sm mb-1">
                    <span>{item.quantity}x {item.menuItemName}</span>
                    <span className="text-gray-500">${item.subtotal?.toFixed(2)}</span>
                </div>
            ))}
            {order.items?.some(i => i.specialInstructions) && (
                <p className="text-xs text-gray-400 mt-1 italic">
                    Note: {order.items.find(i => i.specialInstructions)?.specialInstructions}
                </p>
            )}
            <div className="border-t my-2" />
            <div className="flex justify-between font-semibold text-sm mb-3">
                <span>Total</span>
                <span>${Number(order.totalAmount)?.toFixed(2)}</span>
            </div>

            {onAccept && onDecline && (
                <div className="flex gap-2">
                    <button onClick={onDecline}
                            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">
                        Decline
                    </button>
                    <button onClick={onAccept}
                            className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium">
                        Accept & Print
                    </button>
                </div>
            )}
            {onReady && (
                <button onClick={onReady}
                        className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium">
                    Mark as Ready
                </button>
            )}
            {onComplete && (
                <div className="space-y-2">
                    <div className="bg-green-50 text-green-700 text-xs text-center py-1 rounded-lg">
                        Ready for pickup
                    </div>
                    <button onClick={onComplete}
                            className="w-full border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">
                        Completed — Customer Picked Up
                    </button>
                </div>
            )}
        </div>
    );
}
