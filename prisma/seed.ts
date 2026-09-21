import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const technicianPassword = await bcrypt.hash('technician123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@natimaintenance.com' },
    update: {},
    create: {
      email: 'admin@natimaintenance.com',
      name: 'Owner Admin',
      password: adminPassword,
      role: 'OWNER',
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@natimaintenance.com' },
    update: {},
    create: {
      email: 'cashier@natimaintenance.com',
      name: 'Cashier User',
      password: cashierPassword,
      role: 'CASHIER',
    },
  });

  const technician = await prisma.user.upsert({
    where: { email: 'technician@natimaintenance.com' },
    update: {},
    create: {
      email: 'technician@natimaintenance.com',
      name: 'Technician User',
      password: technicianPassword,
      role: 'TECHNICIAN',
    },
  });

  console.log('Users created');

  // Create Categories
  const categories = [
    'Phone Parts',
    'Computer Parts',
    'Accessories',
    'Cables',
    'Tools',
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat },
      update: {},
      create: { name: cat },
    });
  }

  console.log('Categories created');

  // Create Products
  const products = [
    { name: 'iPhone Screen', sku: 'SCR-IP-001', purchasePrice: 1500, sellingPrice: 2500, currentStock: 10 },
    { name: 'Samsung Screen', sku: 'SCR-SM-001', purchasePrice: 1200, sellingPrice: 2000, currentStock: 15 },
    { name: 'Charging Port', sku: 'PRT-CHG-001', purchasePrice: 200, sellingPrice: 500, currentStock: 50 },
    { name: 'Phone Battery', sku: 'BAT-PH-001', purchasePrice: 400, sellingPrice: 800, currentStock: 30 },
    { name: 'USB Cable', sku: 'CBL-USB-001', purchasePrice: 50, sellingPrice: 150, currentStock: 100 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  console.log('Products created');

  // Create Customers
  const customers = [
    { name: 'Abebe Kebede', phone: '0910111111' },
    { name: 'Sara Tesfaye', phone: '0910222222' },
    { name: 'Dawit Haile', phone: '0910333333' },
  ];

  for (const customer of customers) {
    await prisma.customer.create({
      data: customer,
    });
  }

  console.log('Customers created');
  console.log('---');
  console.log('Demo Accounts:');
  console.log('Admin: admin@natimaintenance.com / admin123');
  console.log('Cashier: cashier@natimaintenance.com / cashier123');
  console.log('Technician: technician@natimaintenance.com / technician123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });