"use client"

import { MenuItem } from '@prisma/client'
import { useCartStore } from '@/store/cart'
import { useState } from 'react'

interface ProductCardProps {
    item: MenuItem
}

export default function ProductCard({ item }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem)
    const [isAdded, setIsAdded] = useState(false)

    const handleAdd = () => {
        addItem(item, 1)
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 1000)
    }

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="h-48 w-full relative">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <span className="text-lg font-semibold text-green-600">
                        ${item.price.toFixed(2)}
                    </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden">
                    {item.description}
                </p>
                <button
                    onClick={handleAdd}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${isAdded
                            ? 'bg-green-500 text-white'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                >
                    {isAdded ? 'Added!' : 'Add to Order'}
                </button>
            </div>
        </div>
    )
}
