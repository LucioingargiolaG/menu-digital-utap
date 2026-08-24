import { PrismaClient } from "@prisma/client";

// Instancia única de PrismaClient (MongoDB Atlas).
// En desarrollo se guarda en globalThis para evitar múltiples instancias por hot reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
