/*
 * Sincroniza descripciones con el menú oficial de Fudo (menu.fu.do/utap).
 * Solo toca descripciones: no modifica precios ni nombres ni imágenes.
 */
import "dotenv/config";
import { prisma } from "../src/lib/db";

// Descripción por nombre de producto (se aplica a todas sus copias)
const descriptions: Record<string, string> = {
  "Porción de Papas": "Porción de papas fritas.",
  "Tipo Cuarto Simple": "Medallón de carne, cheddar, ketchup, mostaza y cebolla brunoise, acompañada de papas fritas.",
  "Tipo Cuarto Doble": "Medallón de carne, cheddar, ketchup, mostaza y cebolla brunoise, acompañada de papas fritas.",
  "Tipo Cuarto Triple": "Medallón de carne, cheddar, ketchup, mostaza y cebolla brunoise, acompañada de papas fritas.",
  "Cheeseburger Simple": "Medallón de carne y cheddar, acompañada de papas fritas.",
  "Cheeseburger Doble": "Medallón de carne y queso, acompañada de papas fritas.",
  "Cheeseburger Triple": "Medallón de carne y cheddar, acompañada de papas fritas.",
  "Baconness Simple": "Medallón de carne, cheddar, panceta y salsa Utap, acompañada de papas fritas.",
  "Baconness Doble": "Medallón de carne, queso, panceta y salsa Utap, acompañada de papas fritas.",
  "Baconness Triple": "Medallón de carne, cheddar, panceta y salsa Utap, acompañada de papas fritas.",
  "Classic Simple": "Medallón de carne, cheddar, lechuga, tomate y salsa Utap, acompañada de papas fritas.",
  "Classic Doble": "Medallón de carne, queso, salsa Utap, lechuga y tomate, acompañada de papas fritas.",
  "Classic Triple": "Medallón de carne, cheddar, lechuga, tomate y salsa Utap, acompañada de papas fritas.",
  "Smoked Tap Simple": "Queso ahumado, panceta, cebolla brunoise, ketchup, mostaza, acompañada de papas fritas.",
  "Smoked Tap Doble": "Queso ahumado, panceta, cebolla brunoise, ketchup, mostaza, acompañada de papas fritas.",
  "Smoked Tap Triple": "Queso ahumado, panceta, cebolla brunoise, ketchup, mostaza, acompañada de papas fritas.",
  "Big Tap Simple": "Medallón de carne, cheddar, salsa Utap, pepinillos, lechuga y cebolla, acompañada de papas fritas.",
  "Big Tap Doble": "Medallón de carne, cheddar, salsa Utap, pepinillos, cebolla brunoise y lechuga, acompañada de papas fritas.",
  "Big Tap Triple": "Medallón de carne, cheddar, salsa Utap, pepinillos, lechuga y cebolla brunoise, acompañada de papas fritas.",
};

async function main() {
  let actualizados = 0;
  for (const [name, description] of Object.entries(descriptions)) {
    const res = await prisma.product.updateMany({ where: { name }, data: { description } });
    actualizados += res.count;
  }
  console.log(`Descripciones actualizadas: ${actualizados}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
