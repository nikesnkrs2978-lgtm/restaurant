"use client"

import { useCartStore } from '@/store/cart'
import { useState } from 'react'

export default function Cart({ tableId }: { tableId: string }) {
    const { items, removeItem, getTotal, clearCart } = useCartStore()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const total = getTotal()

    const handleCheckout = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableId,
                    items: items.map((item) => ({
                        menuItemId: item.menuItem.id,
                        quantity: item.quantity,
                        notes: item.notes,
                    })),
                }),
            })

            if (response.ok) {
                alert('Order placed successfully!')
                clearCart()
                setIsOpen(false)
            } else {
                alert('Failed to place order. Please try again.')
            }
        } catch (error) {
            console.error('Checkout error:', error)
            alert('An error occurred.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (items.length === 0) return null

    return (
        <>
            {/* Floating Button / Bottom Bar */}
            {!isOpen && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg flex justify-between items-center z-50">
                    <div>
                        <p className="text-sm text-gray-500">{items.length} items</p>
                        <p className="text-xl font-bold">${total.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-black text-white px-6 py-3 rounded-lg font-bold"
                    >
                        View Cart
                    </button>
                </div>
            )}

            {/* Cart Modal/Sheet */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
                    <div className="bg-white w-full max-w-md h-full flex flex-col animate-slide-in">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold">Your Order</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-black"
                            >
                                Close
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.menuItem.id}
                                    className="flex justify-between items-center border-b pb-4"
                                >
                                    <div>
                                        <h3 className="font-bold">{item.menuItem.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            ${item.menuItem.price.toFixed(2)} x {item.quantity}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-bold">
                                            ${(item.menuItem.price * item.quantity).toFixed(2)}
                                        </p>
                                        <button
                                            onClick={() => removeItem(item.menuItem.id)}
                                            className="text-red-500 text-sm hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={isSubmitting}
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
