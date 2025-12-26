import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const menuItems = await prisma.menuItem.findMany({
            where: { isAvailable: true },
            orderBy: { category: 'asc' },
        })
        return NextResponse.json(menuItems)
    } catch (error: any) {
        console.error('Error fetching menu:', error)
        return NextResponse.json({
            error: 'Failed to fetch menu',
            details: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
