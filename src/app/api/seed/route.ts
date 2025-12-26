import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // 0. Create Tables (Raw SQL workaround for missing migrations)
        // We use implicit transactions or just sequential execution

        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Table" (
                "id" TEXT NOT NULL,
                "label" TEXT NOT NULL,
                "qrCode" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                "needsAssistance" BOOLEAN NOT NULL DEFAULT false,
                CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
            );
        `
        await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "Table_qrCode_key" ON "Table"("qrCode");`

        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "MenuItem" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "description" TEXT NOT NULL,
                "price" DOUBLE PRECISION NOT NULL,
                "category" TEXT NOT NULL,
                "imageUrl" TEXT,
                "isAvailable" BOOLEAN NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
            );
        `

        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Order" (
                "id" TEXT NOT NULL,
                "tableId" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "total" DOUBLE PRECISION NOT NULL,
                "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
            );
        `

        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "OrderItem" (
                "id" TEXT NOT NULL,
                "orderId" TEXT NOT NULL,
                "menuItemId" TEXT NOT NULL,
                "quantity" INTEGER NOT NULL,
                "notes" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
            );
        `

        // Add foreign keys if they don't exist (checking existence is hard in raw SQL easily, 
        // but we can try adding them and ignore errors, or just rely on app logic for this MVP)
        // For simplicity and robustness in this "emergency fix", we might skip strict FK constraints 
        // or wrap them in a try-catch block.

        try {
            await prisma.$executeRaw`ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`
        } catch (e) { } // Ignore if exists

        try {
            await prisma.$executeRaw`ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`
        } catch (e) { }

        try {
            await prisma.$executeRaw`ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`
        } catch (e) { }


        // 1. Seed Tables
        const tables = [
            { label: "Table 1", qrCode: "table-1" },
            { label: "Table 2", qrCode: "table-2" },
            { label: "Table 3", qrCode: "table-3" },
            { label: "Patio 1", qrCode: "patio-1" },
        ]

        for (const t of tables) {
            await prisma.table.upsert({
                where: { qrCode: t.qrCode },
                update: {},
                create: t
            })
        }

        // 2. Seed Menu Items
        const menuItems = [
            {
                name: "Bruschetta",
                description: "Toasted bread with tomatoes, garlic, basil, and olive oil.",
                price: 8.50,
                category: "Starters",
                imageUrl: "https://images.unsplash.com/photo-1572695157363-bc31c5d5316c?auto=format&fit=crop&w=800&q=80"
            },
            {
                name: "Calamari Fritti",
                description: "Crispy fried squid rings served with lemon and marinara sauce.",
                price: 12.00,
                category: "Starters",
                imageUrl: "https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=800&q=80"
            },
            {
                name: "Margherita Pizza",
                description: "Classic tomato sauce, fresh mozzarella, and basil.",
                price: 14.00,
                category: "Mains",
                imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80"
            },
            {
                name: "Carbonara Pasta",
                description: "Spaghetti with pancetta, egg, parmesan, and black pepper.",
                price: 16.50,
                category: "Mains",
                imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80"
            },
            {
                name: "Grilled Salmon",
                description: "Fresh salmon fillet with roasted vegetables and lemon butter.",
                price: 22.00,
                category: "Mains",
                imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=800&q=80"
            },
            {
                name: "Tiramisu",
                description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream.",
                price: 9.00,
                category: "Desserts",
                imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80"
            },
            {
                name: "Coca Cola",
                description: "Chilled 330ml can.",
                price: 3.50,
                category: "Drinks",
                imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80"
            },
            {
                name: "Aperol Spritz",
                description: "Prosecco, Aperol, and soda water.",
                price: 10.00,
                category: "Drinks",
                imageUrl: "https://images.unsplash.com/photo-1560512823-8db03e41604a?auto=format&fit=crop&w=800&q=80"
            }
        ]

        for (const item of menuItems) {
            const existing = await prisma.menuItem.findFirst({ where: { name: item.name } })
            if (!existing) {
                await prisma.menuItem.create({ data: item })
            }
        }

        return NextResponse.json({ message: "Database seeded successfully!" })
    } catch (error: any) {
        console.error("Seeding error:", error)
        return NextResponse.json({
            error: "Failed to seed database",
            details: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
