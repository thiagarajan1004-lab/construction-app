
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const worker = await prisma.worker.findFirst({
        orderBy: { createdAt: 'desc' },
    });
    console.log('Latest Worker:', JSON.stringify(worker, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
