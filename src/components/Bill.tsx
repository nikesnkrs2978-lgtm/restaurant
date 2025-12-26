"use client"

import { useState, useEffect } from 'react'
import { Order, OrderItem, MenuItem } from '@prisma/client'

type OrderWithDetails = Order & {
    items: (OrderItem & { menuItem: MenuItem })[]
}

export default function Bill({ tableId }: { tableId: string }) {
    const [orders, setOrders] = useState<OrderWithDetails[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isPaying, setIsPaying] = useState(false)

    const fetchOrders = async () => {
        try {
            const res = await fetch(`/api/orders?tableId=${tableId}`)
            if (res.ok) {
                const data = await res.json()
                // Filter for UNPAID orders
                setOrders(data.filter((o: Order) => o.paymentStatus === 'UNPAID'))
            }
        } catch (error) {
            console.error('Failed to fetch orders', error)
        }
    }

    useEffect(() => {
        fetchOrders()
        const interval = setInterval(fetchOrders, 5000)
        return () => clearInterval(interval)
    }, [tableId])

    const handlePay = async (orderId: string) => {
        setIsPaying(true)
        try {
            // Mock payment delay
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Update payment status (we'll reuse the PATCH endpoint, but we might need to update it to allow paymentStatus update)
            // Actually, the current PATCH endpoint only updates 'status'. We need to update it to handle 'paymentStatus'.
            // For now, let's assume we update the status to 'ARCHIVED' which implies done, or we add a specific payment endpoint.
            // Let's stick to the requirement: "payment must be made after food is consumed and completed in kitchen".
            // So we should probably update paymentStatus to 'PAID'.

            // We need to update the PATCH endpoint to accept paymentStatus.
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus: 'PAID' }),
            })

            if (res.ok) {
                alert('Payment Successful! Thank you for dining with us.')
                fetchOrders()
                setIsOpen(false)
            }
        } catch (error) {
            console.error('Payment failed', error)
            alert('Payment failed')
        } finally {
            setIsPaying(false)
        }
    }

    if (orders.length === 0) return null

    const activeOrder = orders[0] // Assume one active order for simplicity
    const isReadyToPay = activeOrder.status === 'COMPLETED'

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg font-bold z-40"
            >
                View Bill
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-xl font-bold">Your Bill</h2>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500">
                                Close
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            {activeOrder.items.map((item) => (
                                <div key={item.id} className="flex justify-between">
                                    <span>{item.quantity}x {item.menuItem.name}</span>
                                    <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Total</span>
                                <span>${activeOrder.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <p className="text-sm text-gray-600 mb-1">Status:</p>
                            <p className={`font-bold ${isReadyToPay ? 'text-green-600' : 'text-orange-500'}`}>
                                {isReadyToPay ? 'Meal Served - Ready to Pay' : 'Preparing / Serving...'}
                            </p>
                        </div>

                        {isReadyToPay ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Card Number (Mock)"
                                    className="w-full p-2 border rounded-lg"
                                    defaultValue="4242 4242 4242 4242"
                                />
                                <button
                                    onClick={() => handlePay(activeOrder.id)}
                                    disabled={isPaying}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isPaying ? 'Processing...' : 'Pay Bill'}
                                </button>
                            </div>
                        ) : (
                            <p className="text-center text-sm text-gray-500">
                                You can pay once your meal has been served.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
