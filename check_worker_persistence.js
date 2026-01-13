
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const worker = await prisma.worker.findFirst({
        where: { contact: '1122334455' },
        orderBy: { createdAt: 'desc' },
    });
    console.log('Worker Data:', JSON.stringify(worker, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
