import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Tables
  const tables = await Promise.all([
    prisma.table.upsert({
      where: { qrCode: 'table-1' },
      update: {},
      create: {
        label: 'Table 1',
        qrCode: 'table-1',
      },
    }),
    prisma.table.upsert({
      where: { qrCode: 'table-2' },
      update: {},
      create: {
        label: 'Table 2',
        qrCode: 'table-2',
      },
    }),
  ])

  console.log('Created tables:', tables.map(t => t.label))

  // Create Menu Items
  const menuItems = await Promise.all([
    // Starters
    prisma.menuItem.create({
      data: {
        name: 'Bruschetta',
        description: 'Grilled bread rubbed with garlic and topped with olive oil and salt.',
        price: 8.50,
        category: 'Starters',
        imageUrl: 'https://images.unsplash.com/photo-1572695157363-bc31c5d53162?auto=format&fit=crop&w=800&q=80',
      },
    }),
    // Mains
    prisma.menuItem.create({
      data: {
        name: 'Margherita Pizza',
        description: 'Tomato sauce, mozzarella, and basil.',
        price: 12.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Carbonara Pasta',
        description: 'Spaghetti with cured pork, hard cheese, eggs, and black pepper.',
        price: 14.50,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
      },
    }),
    // Drinks
    prisma.menuItem.create({
      data: {
        name: 'Coca Cola',
        description: 'Chilled 330ml can.',
        price: 2.50,
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
      },
    }),
  ])

  console.log('Created menu items:', menuItems.map(i => i.name))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
