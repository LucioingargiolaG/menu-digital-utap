// Ruta secreta del panel de gestión.
//
// El panel no vive en /admin a propósito: al publicar el menú en redes,
// nadie que recorra el sitio tiene forma de encontrar el formulario de
// acceso. Si algún día hay que cambiarla, se actualiza solo esta constante
// (y el matcher de src/proxy.ts).
export const ADMIN_PATH = "/utap-gestion-admin";

// Cuenta de desarrollo: tiene acceso al panel pero no se lista en la
// sección Cuentas, así nadie desde adentro puede revocarla o resetearla.
// Siempre puede cambiarse su contraseña desde el formulario "Tu contraseña".
export const DEV_USERNAME = "lucio";
