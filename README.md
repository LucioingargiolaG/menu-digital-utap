# Utap - Menú Digital

Menú digital para la hamburguesería **Utap**, diseñado para escanear con código QR desde el local. Los clientes acceden directamente al menú público sin necesidad de login, con carga ultra rápida en dispositivos móviles.

## Enlaces de acceso

| Sección | URL |
| --- | --- |
| Menú público (clientes) | https://menu-digital-utap.vercel.app |
| Panel de administración | https://menu-digital-utap.vercel.app/utap-gestion-admin |

**Nota de seguridad:** El panel de administración está protegido por autenticación. Las credenciales (usuario y contraseña) nunca se publican en el repositorio ni se muestran en esta documentación. Solo se almacenan en variables de entorno (`.env`) en el servidor de producción.

### Menú público

El enlace principal (`/`) muestra el menú completo de la hamburguesería con todas las categorías y productos activos. Incluye:

- Navegación por categorías con filtros horizontales
- Lista de productos con nombre, descripción, precio e imagen (opcional)
- Botón "Hacer pedido" que redirige al sistema de pedidos externo (configurable desde el panel admin)

### Panel de administración

El enlace `/utap-gestion-admin` lleva al panel de gestión donde el dueño puede:

- Crear, editar y eliminar productos
- Gestionar categorías y su orden de aparición
- Activar/desactivar productos sin borrarlos
- Configurar el link del sistema de pedidos
- Establecer horarios de apertura y cierre
- Cambiar la contraseña de administrador

**Ruta protegida:** Sin sesión válida, el sistema redirige automáticamente al formulario de login. El panel no tiene enlaces visibles desde el menú público.

## Tecnologías utilizadas

| Tecnología | Función |
| --- | --- |
| **Next.js 16** | Framework React con App Router. Maneja el enrutamiento, generación de HTML (ISR con revalidación cada 30s), Server Components y Server Actions para el CRUD del panel admin |
| **TypeScript** | Añade tipado estático a JavaScript. Detecta errores en tiempo de compilación, mejora la autocompletación del IDE y documenta los tipos de datos (categorías, productos, configuración) |
| **Tailwind CSS 4** | Framework de utilidades CSS. Permite diseñar la interfaz del menú y el panel admin con clases utilitarias直接 en el markup, sin crear archivos CSS separados |
| **Prisma 6** | ORM para MongoDB. Define el esquema de base de datos (usuarios, categorías, productos, configuración), genera el cliente tipado y ejecuta migraciones con `prisma db push` |
| **MongoDB Atlas** | Base de datos NoSQL en la nube. Almacena las categorías, productos, configuración y credenciales del administrador. Se conecta mediante el connection string en `DATABASE_URL` |
| **bcryptjs** | Librería de hashing de contraseñas. Encripta la contraseña del administrador con algoritmo bcrypt (12 rounds) antes de guardarla en la base de datos |
| **jose** | Librería para JWT (JSON Web Tokens). Genera y verifica tokens de sesión firmados con HS256, almacenados en cookies httpOnly para proteger el panel admin |
| **React 19** | Librería de interfaces de usuario. Next.js lo usa internamente para renderizar componentes de servidor y cliente (menú interactivo, formularios del admin) |
| **Lucide React** | Librería de íconos. Proporciona los íconos SVG utilizados en el panel de administración y elementos de la interfaz |
| **ESLint** | Herramienta de linting. Analiza el código en busca de errores potenciales y inconsistencias de estilo según las reglas configuradas en `eslint.config.mjs` |

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx              # Menú público (Server Component, ISR 30s)
│   ├── loading.tsx           # Skeleton con efecto shimmer mientras carga
│   └── utap-gestion-admin/
│       ├── actions.ts        # Server Actions (login, CRUD de productos/categorías, configuración)
│       ├── (auth)/login/     # Página de login del panel admin
│       └── (panel)/          # Secciones del panel protegido
│           ├── page.tsx      # Dashboard de productos
│           ├── productos/    # Alta y edición de productos
│           ├── categorias/   # Gestión de categorías
│           └── configuracion/# Link de pedidos y horarios
├── components/
│   ├── menu/                 # Componentes del menú público (vista interactiva, cards de productos)
│   ├── admin/                # Formularios del panel (CRUD de productos, categorías, configuración)
│   └── ui/                   # Componentes base reutilizables (estilo shadcn)
├── lib/
│   ├── db.ts                 # Cliente Prisma (singleton para conexión a MongoDB)
│   ├── auth.ts               # Lógica de autenticación server-side
│   ├── session.ts            # Manejo de JWT (edge-safe con jose)
│   ├── images.ts             # Lógica de subida y optimización de imágenes
│   └── availability.ts       # Verificación de horarios (abierto/cerrado)
├── proxy.ts                  # Middleware que protege la ruta secreta del panel admin
└── prisma/
    ├── schema.prisma         # Esquema de la base de datos (User, Category, Product, Settings)
    └── seed.ts               # Script para cargar datos iniciales (categorías, productos, admin)
```

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
```

Editá `.env` con tus valores:

```env
# MongoDB Atlas: connection string con nombre de base al final
DATABASE_URL="mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/utap-menu?retryWrites=true&w=majority"

# Secreto para firmar sesiones JWT
AUTH_SECRET="..."

# Credenciales del usuario admin
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="una-clave-larga-y-segura"
```

Generar un `AUTH_SECRET` fuerte:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

```bash
# 3. Crear las colecciones y cargar los productos iniciales
npx prisma db push
npm run db:seed

# 4. Desarrollo
npm run dev
```

- Menú público: http://localhost:3000
- Panel admin: http://localhost:3000/utap-gestion-admin/login

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run db:push` | Sincronizar esquema con la base de datos |
| `npm run db:seed` | Cargar productos, categorías y configuración inicial |
| `npm run admin:create` | Crear o actualizar el usuario administrador |

## Seguridad

- La ruta del panel admin (`/utap-gestion-admin`) está protegida por `src/proxy.ts`: sin sesión válida redirige al login
- Doble verificación en el layout del panel (`requireSession`)
- Contraseña hasheada con bcrypt; nunca se guarda ni compara en texto plano
- Sesión = JWT HS256 firmado en cookie httpOnly + sameSite=lax + secure en producción
- Sin enlaces visibles al panel desde el menú público
- El QR de los clientes apunta siempre a la raíz (`/`), nunca a la ruta del panel
- Las credenciales viven solo en variables de entorno (`.env` está gitignoreado)

## Producción

- Despliegue automático: cada `git push` a `master` activa el build en Vercel (~30 segundos)
- Las imágenes subidas se guardan en `public/uploads/` (para hostings con disco persistente)
- El menú usa ISR (30s): los cambios del panel se reflejan al instante mediante `revalidatePath`

---

*Desarrollado por Lucio Ingargiola*
