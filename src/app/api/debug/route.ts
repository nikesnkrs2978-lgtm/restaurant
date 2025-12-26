import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Test 1: Raw SQL count
        const rawCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "MenuItem"`

        // Test 2: Prisma ORM count
        const ormCount = await prisma.menuItem.count()

        // Test 3: Prisma ORM findMany
        const items = await prisma.menuItem.findMany({ take: 1 })

        return NextResponse.json({
            message: "Debug successful",
            rawCount,
            ormCount,
            sampleItem: items[0] || null
        })
    } catch (error: any) {
        return NextResponse.json({
            error: "Debug failed",
            details: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        }, { status: 500 })
    }
}
