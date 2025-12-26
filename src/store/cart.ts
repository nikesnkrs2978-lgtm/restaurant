import { create } from 'zustand'
import { MenuItem } from '@prisma/client'

export interface CartItem {
    menuItem: MenuItem
    quantity: number
    notes?: string
}

interface CartStore {
    items: CartItem[]
    addItem: (menuItem: MenuItem, quantity: number, notes?: string) => void
    removeItem: (menuItemId: string) => void
    clearCart: () => void
    getTotal: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    addItem: (menuItem, quantity, notes) => {
        set((state) => {
            const existingItem = state.items.find((i) => i.menuItem.id === menuItem.id)
            if (existingItem) {
                return {
                    items: state.items.map((i) =>
                        i.menuItem.id === menuItem.id
                            ? { ...i, quantity: i.quantity + quantity, notes: notes || i.notes }
                            : i
                    ),
                }
            }
            return { items: [...state.items, { menuItem, quantity, notes }] }
        })
    },
    removeItem: (menuItemId) => {
        set((state) => ({
            items: state.items.filter((i) => i.menuItem.id !== menuItemId),
        }))
    },
    clearCart: () => set({ items: [] }),
    getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.menuItem.price * item.quantity, 0)
    },
}))
