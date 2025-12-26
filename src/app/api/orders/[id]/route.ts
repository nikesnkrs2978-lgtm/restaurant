import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { status, paymentStatus } = body

        const validStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'ARCHIVED']

        const updateData: any = {}
        if (status && validStatuses.includes(status)) {
            updateData.status = status
        }
        if (paymentStatus === 'PAID') {
            updateData.paymentStatus = 'PAID'
            updateData.status = 'ARCHIVED' // Auto-archive on payment
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'Invalid update data' }, { status: 400 })
        }

        const order = await prisma.order.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json(order)
    } catch (error) {
        console.error('Error updating order:', error)
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }
}
