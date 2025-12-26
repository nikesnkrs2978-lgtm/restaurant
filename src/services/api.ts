import { MenuItem, Order, OrderStatus, PaymentStatus } from '@/types';

// Define types locally if not importing from a shared file yet, 
// or better, let's create a types file in src/types.ts to match the frontend's expectations.
// For now, I'll define them here or assume they are in @/types (which I should create).

export const api = {
    getMenu: async (): Promise<MenuItem[]> => {
        const res = await fetch('/api/menu');
        if (!res.ok) throw new Error('Failed to fetch menu');
        const data = await res.json();

        // Adapt DB data to Frontend MenuItem interface
        return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            imageUrl: item.imageUrl,
            // Mocking these for now as they are not in DB
            calories: 0,
            macros: 'N/A'
        }));
    },

    getOrders: async (tableId?: string): Promise<Order[]> => {
        const url = tableId ? `/api/orders?tableId=${tableId}` : '/api/orders';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();

        // Adapt DB data to Frontend Order interface
        return data.map((order: any) => ({
            id: order.id,
            tableId: order.table?.qrCode || 'unknown', // Map table relation to tableId string if needed
            status: order.status as OrderStatus,
            paymentStatus: order.paymentStatus as PaymentStatus,
            total: order.total,
            createdAt: new Date(order.createdAt).getTime(),
            items: order.items.map((item: any) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                notes: item.notes,
                // Hydrate item details if available in the relation
                name: item.menuItem?.name,
                price: item.menuItem?.price
            }))
        }));
    },

    createOrder: async (tableId: string, items: { menuItemId: string; quantity: number; notes?: string }[]): Promise<Order> => {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableId, items }),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to create order');
        }
        return await res.json();
    },

    updateOrder: async (orderId: string, updates: { status?: OrderStatus; paymentStatus?: PaymentStatus }): Promise<Order> => {
        const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update order');
        return await res.json();
    },

    requestAssistance: async (tableId: string, needsAssistance: boolean): Promise<void> => {
        const res = await fetch(`/api/tables/${tableId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ needsAssistance }),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to update assistance status');
        }
    },

    getTables: async (): Promise<any[]> => {
        const res = await fetch('/api/tables');
        if (!res.ok) throw new Error('Failed to fetch tables');
        return await res.json();
    },

    getTable: async (tableId: string): Promise<any> => {
        const res = await fetch(`/api/tables/${tableId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch table');
        return await res.json();
    }
};
