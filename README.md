# Utap · Menú Digital

Menú digital para la hamburguesería **Utap**, pensado para escanear con QR desde el local (dine-in / para retirar). Se abre directo en el menú público, sin login del cliente, con carga ultra rápida en móviles.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- **Prisma 6** + **MongoDB Atlas**
- Autenticación propia: bcrypt + JWT firmado en cookie **httpOnly**
- Server Actions para todo el CRUD del panel
- Imágenes optimizadas a WebP por `next/image` (lazy loading)

## Estructura

```
src/
├── app/
│   ├── page.tsx              # Menú público (ISR 30s)
│   ├── loading.tsx           # Skeleton con shimmer
│   └── admin/
│       ├── actions.ts        # Server Actions (login, CRUD, config)
│       ├── (auth)/login/     # Login público del panel
│       └── (panel)/          # Panel protegido
│           ├── page.tsx      # Productos (dashboard)
│           ├── productos/    # Alta y edición
│           ├── categorias/   # Gestión de categorías
│           └── configuracion/# Link pedidos + horarios
├── components/
│   ├── menu/                 # Vista interactiva del menú
│   ├── admin/                # Formularios del panel
│   └── ui/                   # Componentes base (estilo shadcn)
├── lib/
│   ├── db.ts                 # Cliente Prisma (singleton)
│   ├── auth.ts               # Sesión server-side
│   ├── session.ts            # JWT (edge-safe)
│   ├── images.ts             # Subida de imágenes
│   └── availability.ts       # Estado Disponible/Cerrado
└── proxy.ts                  # Protege /admin (middleware de Next 16)
```

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
```

Editá `.env`:

```env
# Connection string de MongoDB Atlas (con el nombre de la base al final)
DATABASE_URL="mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/utap-menu?retryWrites=true&w=majority"

# Secreto para firmar sesiones (generá uno con el comando de abajo)
AUTH_SECRET="..."

# Credenciales del admin
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="una-clave-larga-y-segura"
```

> **Importante:** en Atlas → Network Access, permití la IP del servidor donde corra la app (o `0.0.0.0/0`).

Generar un `AUTH_SECRET` fuerte:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

```bash
# 3. Crear las colecciones y cargar los productos iniciales
npx prisma db push
npm run db:seed
```

El seed carga las 4 categorías (Papas Fritas, Hamburguesas Simples/Dobles/Triples), los 19 productos de las capturas, la configuración inicial y el usuario admin.

```bash
# 4. Desarrollo
npm run dev
```

- Menú público: http://localhost:3000
- Panel admin: http://localhost:3000/admin/login

## Crear o cambiar el usuario admin

El admin se crea desde variables de entorno (nunca en el código):

```bash
npm run admin:create
```

- Usa `ADMIN_USERNAME` y `ADMIN_PASSWORD` del `.env`
- La contraseña se guarda hasheada con **bcrypt** (12 rounds)
- Si ya existe, actualiza la contraseña
- Mínimo 8 caracteres

## Scripts

| Comando                | Qué hace                                  |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Servidor de desarrollo                    |
| `npm run build`        | Build de producción                       |
| `npm start`            | Servidor de producción                    |
| `npm run lint`         | ESLint                                    |
| `npm run db:push`      | Sincroniza el schema con la base          |
| `npm run db:seed`      | Carga productos/categorías/config inicial |
| `npm run admin:create` | Crea/actualiza el usuario admin           |

## Seguridad del panel

- `/admin/**` está protegida por `src/proxy.ts`: sin sesión válida redirige a `/admin/login`
- Doble verificación en el layout del panel (`requireSession`)
- Contraseña hasheada con bcrypt; nunca se guarda ni compara en texto plano
- Sesión = JWT HS256 firmado, en cookie **httpOnly** + `sameSite=lax` + `secure` en producción
- Sin ningún enlace visible al admin desde el menú público
- El QR de los clientes apunta siempre a la raíz (`/`), nunca a `/admin`
- Las credenciales viven solo en variables de entorno (`.env` está gitignoreado; en producción se cargan desde el panel del hosting)

## El botón "Pedir ahora"

En **Admin → Configuración** pegá el link del sistema de pedidos que ya usan (Ej: `https://...`). El botón sticky del menú lo abre en pestaña nueva. Si el campo queda vacío, el botón no se muestra.

## Código QR

Generá el QR apuntando a la URL pública del menú (la raíz del sitio). Ejemplo: si hospedás en Vercel, `https://utap.tu-dominio.com/`.

## Notas de producción

- Las imágenes subidas se guardan en `public/uploads/`. En hostings sin disco persistente (Vercel) conviene migrar a un storage externo (Cloudinary, S3) — la lógica está centralizada en `src/lib/images.ts`.
- El menú usa ISR (30s): los cambios del panel se reflejan al instante (`revalidatePath`) y cada visita sirve HTML cacheado → carga casi instantánea.
