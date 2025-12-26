export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    calories: number;
    macros: string;
}

export interface OrderItem {
    menuItemId: string;
    quantity: number;
    notes?: string;
    name?: string;
    price?: number;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'ARCHIVED';
export type PaymentStatus = 'UNPAID' | 'PAID';

export interface Order {
    id: string;
    tableId: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    total: number;
    items: OrderItem[];
    createdAt: number;
}
