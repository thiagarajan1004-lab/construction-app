const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    const projects = await prisma.project.findMany({
        include: { customer: true }
    });
    fs.writeFileSync('projects.json', JSON.stringify(projects, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
