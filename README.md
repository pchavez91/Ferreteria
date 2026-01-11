# Sistema de Gestión para Ferretería

Sistema completo de gestión empresarial desarrollado para administrar una ferretería, incluyendo punto de venta, control de inventario, facturación y reportes. Construido con tecnologías modernas y pensado para ser escalable y fácil de usar.

## 🚀 Características Principales

### Punto de Venta (POS)
Sistema de ventas completo con múltiples métodos de pago (efectivo, tarjeta, factura), cálculo automático de IVA, descuentos y generación de boletas imprimibles. Interfaz intuitiva optimizada para uso en tablet o computadora.

### Gestión de Inventario
Control completo de productos con código de barras, categorías, precios unitarios y por mayor, seguimiento de stock en tiempo real y alertas de stock mínimo. Sistema de movimientos de bodega para registrar entradas, salidas y ajustes.

### Facturación
Sistema de facturación a empresas con control de pagos, seguimiento de facturas pendientes y múltiples métodos de pago. Gestión de empresas clientes con datos completos.

### Dashboard y Reportes
Dashboard con estadísticas en tiempo real, gráficos comparativos de ventas anuales, visualización de ingresos y análisis de rendimiento. Todas las tablas incluyen ordenamiento por columnas.

### Gestión de Usuarios
Sistema de roles y permisos (Administrador, Bodega, Caja, Contabilidad) con control de acceso basado en roles. Seguimiento de sesiones de usuarios y estado de conexión.

## 🛠️ Stack Tecnológico

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático para mayor robustez
- **Supabase** - Base de datos PostgreSQL, autenticación y Row Level Security
- **Tailwind CSS** - Estilos modernos y responsivos
- **Recharts** - Gráficos y visualización de datos

## 📋 Requisitos

- Node.js 18 o superior
- Cuenta de Supabase (plan gratuito funciona perfectamente)
- Git

## ⚙️ Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd Ferreteria
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase

Crea un nuevo proyecto en [Supabase](https://supabase.com) y sigue estos pasos:

#### Configurar la Base de Datos

1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Ejecuta el archivo `supabase/schema.sql` - esto creará todas las tablas necesarias
3. Ejecuta `supabase/updates_schema.sql` - esto agrega campos adicionales (vendedor_id, sesiones_usuarios)
4. Ejecuta `supabase/fix_sesiones_constraint.sql` - necesario para el sistema de sesiones
5. Ejecuta `supabase/rls_policies.sql` - esto configurará las políticas de seguridad (RLS)

#### Cargar Datos de Prueba (Opcional pero recomendado)

Para probar el sistema con datos realistas:

1. Ejecuta `supabase/seed_data_complete.sql` - carga categorías, proveedores, productos y empresas
2. Ejecuta `supabase/create_test_transactions.sql` - genera transacciones de prueba con diferentes fechas para los gráficos

#### Configurar Autenticación

1. Ve a **Authentication > Settings** en Supabase
2. Asegúrate de que **Email** esté habilitado como método de autenticación

#### Crear Usuario Administrador

1. Ve a **Authentication > Users** en Supabase
2. Haz clic en **Add user** > **Create new user**
3. Ingresa un email y contraseña
4. Copia el **User UID** que se genera
5. Ve a **SQL Editor** y ejecuta (reemplaza el UUID y email con los tuyos):

```sql
INSERT INTO public.usuarios (id, email, nombre, rol, activo)
VALUES (
  'TU_USER_UID_AQUI',
  'tu-email@ejemplo.com',
  'Administrador',
  'admin',
  true
);
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

Para obtener estas credenciales:
1. Ve a **Settings > API** en tu proyecto de Supabase
2. Copia la **Project URL** como `NEXT_PUBLIC_SUPABASE_URL`
3. Copia la **anon public** key como `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🌐 Ejecutar en Red Local

Para acceder desde otros dispositivos en tu red local (útil para probar el POS en tablet):

1. Obtén tu IP local:
   - Windows: `ipconfig` en PowerShell, busca "IPv4 Address"
   - Mac/Linux: `ifconfig` o `ip addr`, busca 192.168.x.x

2. Ejecuta Next.js escuchando en todas las interfaces:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```

3. Accede desde otros dispositivos: `http://TU_IP_LOCAL:3000`

## 🚀 Despliegue en Vercel

El despliegue en Vercel es gratuito y muy sencillo:

1. Sube tu código a GitHub
2. Ve a [Vercel](https://vercel.com) y conecta tu repositorio
3. Agrega las variables de entorno en **Settings > Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Vercel desplegará automáticamente tu aplicación

## 👥 Roles de Usuario

El sistema incluye 4 roles diferentes:

- **Admin**: Acceso completo a todas las funcionalidades
- **Bodega**: Gestión de inventario y movimientos de bodega
- **Caja**: Punto de venta (POS) y procesamiento de ventas
- **Contabilidad**: Visualización de ventas, facturas y reportes

Para crear usuarios adicionales, primero créalos en **Authentication > Users** de Supabase, luego agrega su registro en la tabla `usuarios` con el rol correspondiente.

## 📝 Notas Importantes

- El sistema usa **Row Level Security (RLS)** en Supabase para garantizar la seguridad de los datos
- Todas las ventas se registran como boletas (incluso las facturadas a empresas)
- El sistema está optimizado para funcionar en el plan gratuito de Vercel y Supabase
- Para producción, considera agregar validaciones adicionales y manejo de errores más robusto

## 🎯 Funcionalidades Detalladas

### Gestión de Productos
- Código de barras único
- Categorías y proveedores
- Precios unitarios y por mayor (con cantidad mínima)
- Control de stock con alertas de stock mínimo
- Unidades de medida personalizables

### Sistema de Ventas
- Carrito de compras dinámico
- Múltiples métodos de pago (efectivo con cálculo de vuelto, tarjeta, factura)
- Cálculo automático de descuentos e IVA (19%)
- Generación de boletas imprimibles
- Historial completo de ventas con filtros y ordenamiento

### Control de Bodega
- Movimientos de entrada/salida/ajuste
- Historial completo de movimientos
- Tracking de quién realizó cada movimiento
- Integración automática con el sistema de ventas

### Facturación
- Registro de empresas clientes
- Facturación a empresas con seguimiento de pagos
- Control de facturas pendientes
- Múltiples métodos de pago para facturas

## 🐛 Solución de Problemas

**Error de autenticación:**
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que el usuario exista tanto en Authentication como en la tabla `usuarios`

**Error de permisos (RLS):**
- Verifica que hayas ejecutado `supabase/rls_policies.sql`
- Asegúrate de que el usuario tenga el rol correcto en la tabla `usuarios`

**Error al crear ventas:**
- Verifica que las políticas RLS estén correctamente configuradas
- Revisa la consola del navegador para ver errores específicos

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Siéntete libre de usarlo, hacerle fork y adaptarlo para tu propio portafolio.

---

**Desarrollado por [pchavez91](https://github.com/pchavez91)**

Para consultas o colaboraciones, puedes contactarme en: pchavez.dev@gmail.com

Desarrollado con ❤️ usando Next.js, TypeScript y Supabase
