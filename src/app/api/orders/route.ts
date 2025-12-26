import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Fetch all orders (for Kitchen Display)
// GET: Fetch orders (optionally filtered by tableId)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const tableId = searchParams.get('tableId') // This is the QR code (e.g., table-1)

        let whereClause = {}

        if (tableId) {
            const table = await prisma.table.findUnique({
                where: { qrCode: tableId },
            })
            if (table) {
                whereClause = { tableId: table.id }
            } else {
                return NextResponse.json([]) // Table not found, return empty
            }
        }

        const orders = await prisma.order.findMany({
            where: whereClause,
            include: {
                table: true,
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(orders)
    } catch (error) {
        console.error('Error fetching orders:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}

// POST: Create a new order (for Client)
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { tableId, items } = body

        if (!tableId || !items || items.length === 0) {
            return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
        }

        // Calculate total and verify items exist
        let total = 0
        const orderItemsData = []

        for (const item of items) {
            const menuItem = await prisma.menuItem.findUnique({
                where: { id: item.menuItemId },
            })

            if (!menuItem) {
                return NextResponse.json(
                    { error: `Menu item not found: ${item.menuItemId}` },
                    { status: 404 }
                )
            }

            total += menuItem.price * item.quantity
            orderItemsData.push({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                notes: item.notes,
            })
        }

        // Find the table by QR code (which is passed as tableId)
        const table = await prisma.table.findUnique({
            where: { qrCode: tableId },
        })

        if (!table) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 })
        }

        // Create Order
        const order = await prisma.order.create({
            data: {
                tableId: table.id, // Use the actual UUID
                total,
                status: 'PENDING',
                paymentStatus: 'UNPAID', // Mock payment for now
                items: {
                    create: orderItemsData,
                },
            },
            include: {
                items: true,
            },
        })

        return NextResponse.json(order, { status: 201 })
    } catch (error) {
        console.error('Error creating order:', error)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
}
