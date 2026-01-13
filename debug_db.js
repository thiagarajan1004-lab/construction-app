
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const projects = await prisma.project.findMany({ include: { customer: true } });
    const payments = await prisma.payment.findMany({ include: { project: true } });
    const fs = require('fs');
    fs.writeFileSync('db_dump.json', JSON.stringify({ projects, payments }, null, 2));
    console.log("Dumped to db_dump.json");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
