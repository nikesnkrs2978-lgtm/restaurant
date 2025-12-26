import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params // This is the QR code (e.g., table-1)
        const body = await request.json()
        const { needsAssistance } = body

        // Find the table first by QR code
        const table = await prisma.table.findUnique({
            where: { qrCode: id },
        })

        if (!table) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 })
        }

        const updatedTable = await prisma.table.update({
            where: { id: table.id },
            data: { needsAssistance },
        })

        return NextResponse.json(updatedTable)
    } catch (error) {
        console.error('Error updating table:', error)
        return NextResponse.json({ error: 'Failed to update table' }, { status: 500 })
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const table = await prisma.table.findUnique({
            where: { qrCode: id },
        })

        if (!table) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 })
        }

        return NextResponse.json(table, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        })
    } catch (error) {
        console.error('Error fetching table:', error)
        return NextResponse.json({ error: 'Failed to fetch table' }, { status: 500 })
    }
}
