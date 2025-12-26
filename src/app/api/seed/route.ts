import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
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
            // Check if exists by name to avoid duplicates on re-seed
            const existing = await prisma.menuItem.findFirst({ where: { name: item.name } })
            if (!existing) {
                await prisma.menuItem.create({ data: item })
            }
        }

        return NextResponse.json({ message: "Database seeded successfully!" })
    } catch (error) {
        console.error("Seeding error:", error)
        return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
    }
}
