import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'dev@stellarremit.com' },
    update: {},
    create: {
      email: 'dev@stellarremit.com',
      password: passwordHash,
    },
  });

  const wallet = await prisma.wallet.upsert({
    where: { publicKey: 'GAAJGOXTBVD6FNOF2EJ2IWOXY4XWV5Q5JHQWQE2PTFS3N2F4K6OS4Q5X' },
    update: {},
    create: {
      userId: user.id,
      publicKey: 'GAAJGOXTBVD6FNOF2EJ2IWOXY4XWV5Q5JHQWQE2PTFS3N2F4K6OS4Q5X',
      label: 'Development Wallet',
      isDefault: true,
    },
  });

  await prisma.transaction.createMany({
    skipDuplicates: true,
    data: [
      {
        senderId: user.id,
        recipient: 'GAAJGOXTBVD6FNOF2EJ2IWOXY4XWV5Q5JHQWQE2PTFS3N2F4K6OS4Q5X',
        amount: 100.0,
        asset: 'XLM',
        status: 'completed',
      },
      {
        senderId: user.id,
        recipient: 'GAAJGOXTBVD6FNOF2EJ2IWOXY4XWV5Q5JHQWQE2PTFS3N2F4K6OS4Q5X',
        amount: 50.0,
        asset: 'XLM',
        status: 'pending',
      },
    ],
  });

  console.log('Seed data created successfully');
  console.log(`User: ${user.email}`);
  console.log(`Wallet: ${wallet.publicKey}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
