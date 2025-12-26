import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const table = await prisma.table.findUnique({
        where: { qrCode: 'table-1' }
    })
    console.log('Table 1 Status:', table?.needsAssistance)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
