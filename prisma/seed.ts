// Seed inicial: categorías, productos de las capturas, configuración y usuario admin
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

type SeedProduct = {
  name: string;
  description: string;
  price: number;
  order: number;
};

// Productos según las capturas del menú de Utap
const categories: { name: string; order: number; products: SeedProduct[] }[] = [
  {
    name: "Papas Fritas",
    order: 1,
    products: [
      {
        name: "Porción de Papas",
        description: "Papas fritas doradas.",
        price: 9500,
        order: 1,
      },
    ],
  },
  {
    name: "Hamburguesas Dobles",
    order: 2,
    products: [
      {
        name: "Classic Simple",
        description:
          "Medallón de carne, cheddar, lechuga, tomate, cebolla y salsa clásica de la casa.",
        price: 13500,
        order: 1,
      },
      {
        name: "Cheeseburger Simple",
        description: "Medallón de carne, doble cheddar, cebolla y salsa cheese.",
        price: 13500,
        order: 2,
      },
      {
        name: "Smoked Tap Simple",
        description:
          "Medallón de carne, cheddar, panceta ahumada, cebolla crispy y salsa Utap.",
        price: 13500,
        order: 3,
      },
      {
        name: "Tipo Cuarto Simple",
        description: "Estilo cuarto de libra: medallón de carne, cheddar y cebolla.",
        price: 13500,
        order: 4,
      },
      {
        name: "Baconness Simple",
        description: "Medallón de carne, cheddar, panceta crocante y salsa bacon.",
        price: 14000,
        order: 5,
      },
      {
        name: "Big Tap Simple",
        description: "Medallón de carne, doble cheddar, pepinillos y salsa Big Tap.",
        price: 14000,
        order: 6,
      },
    ],
  },
  {
    name: "Hamburguesas Simples",
    order: 3,
    products: [
      {
        name: "Tipo Cuarto Doble",
        description: "Doble medallón de carne, cheddar y cebolla. Estilo cuarto de libra.",
        price: 14500,
        order: 1,
      },
      {
        name: "Cheeseburger Doble",
        description: "Doble medallón de carne, doble cheddar, cebolla y salsa cheese.",
        price: 15500,
        order: 2,
      },
      {
        name: "Classic Doble",
        description:
          "Doble medallón de carne, cheddar, lechuga, tomate, cebolla y salsa clásica.",
        price: 16000,
        order: 3,
      },
      {
        name: "Baconness Doble",
        description: "Doble medallón de carne, cheddar, panceta crocante y salsa bacon.",
        price: 16000,
        order: 4,
      },
      {
        name: "Big Tap Doble",
        description: "Doble medallón de carne, doble cheddar, pepinillos y salsa Big Tap.",
        price: 16500,
        order: 5,
      },
      {
        name: "Smoked Tap Doble",
        description:
          "Doble medallón de carne, cheddar, panceta ahumada, cebolla crispy y salsa Utap.",
        price: 16500,
        order: 6,
      },
    ],
  },
  {
    name: "Hamburguesas Triples",
    order: 4,
    products: [
      {
        name: "Baconness Triple",
        description: "Triple medallón de carne, cheddar, panceta crocante y salsa bacon.",
        price: 17000,
        order: 1,
      },
      {
        name: "Cheeseburger Triple",
        description: "Triple medallón de carne, doble cheddar, cebolla y salsa cheese.",
        price: 17000,
        order: 2,
      },
      {
        name: "Classic Triple",
        description:
          "Triple medallón de carne, cheddar, lechuga, tomate, cebolla y salsa clásica.",
        price: 17000,
        order: 3,
      },
      {
        name: "Tipo Cuarto Triple",
        description: "Triple medallón de carne, cheddar y cebolla. Estilo cuarto de libra.",
        price: 17000,
        order: 4,
      },
      {
        name: "Big Tap Triple",
        description: "Triple medallón de carne, doble cheddar, pepinillos y salsa Big Tap.",
        price: 17500,
        order: 5,
      },
      {
        name: "Smoked Tap Triple",
        description:
          "Triple medallón de carne, cheddar, panceta ahumada, cebolla crispy y salsa Utap.",
        price: 17500,
        order: 6,
      },
    ],
  },
];

async function main() {
  // Categorías y productos (idempotente: actualiza si ya existen)
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: { order: cat.order },
      create: { name: cat.name, order: cat.order },
    });

    for (const p of cat.products) {
      const existing = await prisma.product.findFirst({
        where: { name: p.name, categoryId: category.id },
      });
      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: { ...p, categoryId: category.id },
        });
      } else {
        await prisma.product.create({
          data: { ...p, categoryId: category.id },
        });
      }
    }
  }

  // Configuración inicial (fila única)
  await prisma.settings.upsert({
    where: { key: "global" },
    update: {},
    create: {
      key: "global",
      orderUrl: "https://menu.fu.do/utap?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZnRzaAT3WyNwZG9mAmZkaWQWUNDcrNMrACQ_zIj7OMtowXJoXXsVfmV4dG4DYWVtAjExAHNydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABp594cHLVsayj6ZwkOdq58PXm9CL7sP7AcaCWSsj83zSsf3J_ZyAnKFtwKii7_aem_6jNkXc67FM9Rx_INNWRBSw",
      scheduleEnabled: true,
      openTime: "11:00",
      closeTime: "23:30",
      forceClosed: false,
    },
  });

  // Usuario admin desde variables de entorno
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD;

  if (password && password.length >= 8) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.upsert({
      where: { username },
      update: { passwordHash },
      create: { username, passwordHash },
    });
    console.log(`Admin "${username}" listo.`);
  } else {
    console.log(
      'Sin ADMIN_PASSWORD válida en .env: no se creó el admin. Usá "npm run admin:create".'
    );
  }

  const total = await prisma.product.count();
  console.log(`Seed completado: ${total} productos cargados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
