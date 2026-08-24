// Actualiza el link de pedidos en la configuración global
import "dotenv/config";
import { prisma } from "../src/lib/db";

const ORDER_URL = process.argv[2];
if (!ORDER_URL) {
  console.error("Uso: tsx scripts/set-order-url.ts <url>");
  process.exit(1);
}

async function main() {
  const existing = await prisma.settings.findUnique({ where: { key: "global" } });
  if (existing) {
    await prisma.settings.update({
      where: { key: "global" },
      data: { orderUrl: ORDER_URL },
    });
  } else {
    await prisma.settings.create({ data: { key: "global", orderUrl: ORDER_URL } });
  }
  console.log("orderUrl actualizado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
