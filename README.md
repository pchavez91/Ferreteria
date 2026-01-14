# Sistema de Gestión para Ferretería

Sistema completo de gestión empresarial desarrollado para administrar una ferretería, incluyendo punto de venta, control de inventario, facturación, gestión de empleados, sistema de turnos para cajeros y reportes. Construido con tecnologías modernas y pensado para ser escalable y fácil de usar.

> **⚠️ Nota Importante:** Este sistema fue desarrollado específicamente para una ferretería. Si necesitas adaptarlo para tu negocio o implementarlo en otro tipo de comercio, por favor comunícate conmigo para discutir los requerimientos y costos de personalización. Puedes contactarme en **pchavez.dev@gmail.com** o a través de [GitHub](https://github.com/pchavez91).

## 🚀 Características Principales

### Punto de Venta (POS)
Sistema de ventas completo con múltiples métodos de pago (efectivo, tarjeta, factura), cálculo automático de IVA, descuentos y generación de boletas imprimibles. Interfaz intuitiva optimizada para uso en tablet o computadora.

### Sistema de Turnos para Cajeros
Sistema completo de gestión de turnos que permite a los cajeros:
- Iniciar turnos con conteo inicial de dinero en caja (billetes y monedas)
- Registrar ventas durante el turno
- Finalizar turnos con conteo final y cálculo de diferencias
- Registrar monto de tarjetas físicas recibidas
- Requiere clave de autorización (1234) para finalizar turno

### Gestión de Inventario
Control completo de productos con código de barras, categorías, precios unitarios y por mayor, seguimiento de stock en tiempo real y alertas de stock mínimo. Sistema de movimientos de bodega para registrar entradas, salidas y ajustes.

### Facturación
Sistema de facturación a empresas con control de pagos, seguimiento de facturas pendientes y múltiples métodos de pago. Gestión de empresas clientes con datos completos.

### Gestión de Personal
Sección para administradores que permite gestionar empleados y contratos:
- Registro completo de datos de empleados
- Gestión de contratos (indefinido, plazo fijo, por obra)
- Visualización y edición de información con registro de motivos de cambios
- Visualización de contratos en formato imprimible

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
- **Framer Motion** - Animaciones fluidas
- **Lucide React** - Iconos modernos

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
2. Ejecuta los siguientes archivos en orden:
   - `supabase/schema.sql` - Crea todas las tablas principales
   - `supabase/updates_schema.sql` - Agrega campos adicionales (vendedor_id, sesiones_usuarios)
   - `supabase/fix_sesiones_constraint.sql` - Necesario para el sistema de sesiones
   - `supabase/empleados_schema.sql` - Crea tablas de empleados y contratos
   - `supabase/turnos_caja_schema.sql` - Crea tablas del sistema de turnos
   - `supabase/rls_policies.sql` - Configura las políticas de seguridad (RLS)

#### Cargar Datos de Prueba (Opcional pero recomendado)

Para probar el sistema con datos realistas:

1. Ejecuta `supabase/seed_data_complete.sql` - Carga categorías, proveedores, productos y empresas
2. Ejecuta `supabase/empleados_seed.sql` - Carga empleados y contratos de prueba
3. Ejecuta `supabase/create_test_transactions.sql` - Genera transacciones de prueba con diferentes fechas para los gráficos

#### Configurar Autenticación

1. Ve a **Authentication > Settings** en Supabase
2. Asegúrate de que **Email** esté habilitado como método de autenticación

#### Crear Usuarios de Prueba

1. Ve a **Authentication > Users** en Supabase
2. Crea los siguientes usuarios haciendo clic en **Add user** > **Create new user**:

**Usuario Administrador:**
- Email: `admin@ferreteria.com`
- Contraseña: `admin123`
- Copia el **User UID** generado

**Usuario Cajero:**
- Email: `caja@ferreteria.com`
- Contraseña: `caja123`
- Copia el **User UID** generado

**Usuario Bodega:**
- Email: `bodega@ferreteria.com`
- Contraseña: `bodega123`
- Copia el **User UID** generado

**Usuario Contabilidad:**
- Email: `contabilidad@ferreteria.com`
- Contraseña: `contabilidad123`
- Copia el **User UID** generado

3. Ve a **SQL Editor** y ejecuta (reemplaza los UUIDs con los que copiaste):

```sql
-- Administrador
INSERT INTO public.usuarios (id, email, nombre, rol, activo)
VALUES (
  'UUID_DEL_ADMIN_AQUI',
  'admin@ferreteria.com',
  'Administrador Principal',
  'admin',
  true
);

-- Cajero
INSERT INTO public.usuarios (id, email, nombre, rol, activo)
VALUES (
  'UUID_DEL_CAJERO_AQUI',
  'caja@ferreteria.com',
  'Cajero Principal',
  'caja',
  true
);

-- Bodega
INSERT INTO public.usuarios (id, email, nombre, rol, activo)
VALUES (
  'UUID_DE_BODEGA_AQUI',
  'bodega@ferreteria.com',
  'Encargado de Bodega',
  'bodega',
  true
);

-- Contabilidad
INSERT INTO public.usuarios (id, email, nombre, rol, activo)
VALUES (
  'UUID_DE_CONTABILIDAD_AQUI',
  'contabilidad@ferreteria.com',
  'Contador',
  'contabilidad',
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

## 👥 Roles de Usuario y Flujos

El sistema incluye 4 roles diferentes con flujos específicos:

### 🔑 Contraseñas de Prueba

- **Administrador:** `admin@ferreteria.com` / `admin123`
- **Cajero:** `caja@ferreteria.com` / `caja123`
- **Bodega:** `bodega@ferreteria.com` / `bodega123`
- **Contabilidad:** `contabilidad@ferreteria.com` / `contabilidad123`

### 🔐 Clave de Autorización para Cajeros

- **Clave para terminar turno:** `1234`
  - Esta clave se solicita cuando un cajero intenta finalizar su turno
  - Es una clave fija de prueba (en producción debería manejarse de forma más segura)

### 👨‍💼 Administrador

**Acceso completo a todas las funcionalidades.**

**Flujo de trabajo:**
1. Inicia sesión con email y contraseña
2. Accede al Dashboard principal con estadísticas
3. Puede navegar a:
   - **Dashboard:** Estadísticas generales y gráficos
   - **Productos:** Gestión de productos y categorías (incluye botón "Gestionar Categorías" visible solo para admin)
   - **Ventas:** Visualización de todas las ventas realizadas
   - **Bodega:** Gestión de inventario y movimientos
   - **Facturas:** Gestión de facturas a empresas
   - **Empresas:** Gestión de empresas clientes
   - **Usuarios:** Gestión de usuarios del sistema
   - **Personal:** Gestión de empleados y contratos (solo admin)
   - **POS:** Puede acceder al punto de venta como administrador
4. Puede cerrar sesión desde el Header, mostrando un resumen de su sesión

**Funcionalidades exclusivas:**
- Ver y editar todos los usuarios
- Gestionar categorías de productos
- Gestionar empleados y contratos
- Acceder al POS sin restricciones
- Ver todos los reportes y estadísticas

### 💰 Cajero

**Sistema de turnos con control de dinero en caja.**

**Flujo de trabajo:**
1. Inicia sesión con email y contraseña
2. Es redirigido automáticamente a la página de **Inicio de Turno**
3. Debe completar el formulario de inicio de turno:
   - Ingresar dinero inicial en caja (billetes y monedas en pesos chilenos)
   - Sistema calcula automáticamente el total
4. Presiona "Iniciar Turno" → Redirige al **POS**
5. En el POS puede:
   - Buscar y agregar productos al carrito
   - Realizar ventas (efectivo, tarjeta, factura)
   - Ver resumen de ventas
6. Para terminar el turno:
   - Presiona "Terminar Turno" (botón superior derecho)
   - Completa el formulario de fin de turno:
     - Ve el resumen de ventas (efectivo, tarjeta, factura)
     - Ingresa el dinero final en caja (billetes y monedas)
     - Ingresa el monto de tarjetas físicas recibidas
     - Ve las diferencias calculadas (efectivo y tarjetas)
   - Ingresa la clave de autorización: **1234**
   - Al confirmar, el turno se finaliza y se actualiza su estado como inactivo
7. Vuelve a la página de **Inicio de Turno** donde puede:
   - Iniciar un nuevo turno
   - Cerrar sesión completamente

**Características:**
- Solo puede iniciar un turno a la vez
- El sistema controla que haya un turno activo antes de permitir ventas
- Todas las ventas quedan asociadas al turno
- Al finalizar el turno, se calculan las diferencias entre lo esperado y lo real

### 📦 Bodega

**Gestión de inventario y movimientos de bodega.**

**Flujo de trabajo:**
1. Inicia sesión con email y contraseña
2. Accede al Dashboard
3. Puede navegar a:
   - **Bodega:** Gestión de movimientos (entradas, salidas, ajustes)
   - **Productos:** Solo visualización de productos
4. En la sección de Bodega puede:
   - Crear movimientos de entrada (recibir mercancía)
   - Crear movimientos de salida (retirar productos)
   - Crear ajustes de inventario
   - Ver historial completo de movimientos
5. Puede cerrar sesión desde el Header

**Restricciones:**
- No puede acceder al POS
- No puede gestionar usuarios
- No puede gestionar empleados
- No puede crear ventas

### 📊 Contabilidad

**Visualización de ventas, facturas y reportes.**

**Flujo de trabajo:**
1. Inicia sesión con email y contraseña
2. Accede al Dashboard
3. Puede navegar a:
   - **Dashboard:** Estadísticas generales
   - **Ventas:** Visualización de todas las ventas
   - **Facturas:** Visualización de facturas y pagos
   - **Empresas:** Solo visualización de empresas
4. Puede ver reportes y estadísticas pero no modificar datos
5. Puede cerrar sesión desde el Header

**Restricciones:**
- No puede acceder al POS
- No puede gestionar productos
- No puede gestionar usuarios
- No puede crear ni modificar ventas o facturas
- Solo tiene acceso de lectura

## 📝 Notas Importantes

- El sistema usa **Row Level Security (RLS)** en Supabase para garantizar la seguridad de los datos
- Las ventas se registran como boletas (incluso las facturadas a empresas)
- El sistema está optimizado para funcionar en el plan gratuito de Vercel y Supabase
- La clave de autorización "1234" es solo para pruebas. En producción debería implementarse un método más seguro
- Los cajeros deben finalizar su turno correctamente para que su estado se marque como inactivo en el sistema

## 🎯 Funcionalidades Detalladas

### Gestión de Productos
- Código de barras único
- Categorías y proveedores
- Precios unitarios y por mayor (con cantidad mínima)
- Control de stock con alertas de stock mínimo
- Unidades de medida personalizables
- Gestión de categorías (solo administradores)

### Sistema de Ventas
- Carrito de compras dinámico
- Múltiples métodos de pago (efectivo con cálculo de vuelto, tarjeta, factura)
- Cálculo automático de descuentos e IVA (19%)
- Generación de boletas imprimibles
- Historial completo de ventas con filtros y ordenamiento

### Sistema de Turnos
- Inicio de turno con conteo inicial de dinero
- Registro de todas las ventas del turno
- Finalización con conteo final y cálculo de diferencias
- Registro de tarjetas físicas recibidas
- Control de diferencias entre efectivo esperado y real
- Control de diferencias entre tarjetas esperadas y físicas

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

### Gestión de Personal
- Registro completo de empleados (nombre, RUT, dirección, contacto, fechas)
- Gestión de contratos (tipo, fechas, sueldo, cláusulas)
- Visualización de contratos en formato imprimible
- Edición de datos con registro de motivos
- Historial de empleados activos e históricos

## 🐛 Solución de Problemas

**Error de autenticación:**
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que el usuario exista tanto en Authentication como en la tabla `usuarios`

**Error de permisos (RLS):**
- Verifica que hayas ejecutado todos los archivos de schema y `supabase/rls_policies.sql`
- Asegúrate de que el usuario tenga el rol correcto en la tabla `usuarios`

**Error al crear ventas:**
- Verifica que las políticas RLS estén correctamente configuradas
- Revisa la consola del navegador para ver errores específicos

**Cajero no puede iniciar turno:**
- Verifica que se haya ejecutado `supabase/turnos_caja_schema.sql`
- Asegúrate de que el cajero tenga un turno activo en la tabla `turnos_caja`

**Error al finalizar turno:**
- Verifica que hayas ingresado la clave correcta: **1234**
- Asegúrate de que el cajero tenga una sesión activa

## 📄 Licencia

Este proyecto fue desarrollado por **Patricio Chávez** ([@pchavez91](https://github.com/pchavez91)). 

Si necesitas adaptarlo para tu negocio o implementarlo en otro tipo de comercio, por favor comunícate conmigo para discutir los requerimientos. Puedes contactarme en **pchavez.dev@gmail.com**.
