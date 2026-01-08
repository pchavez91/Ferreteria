# Sistema de Gestión para Ferretería

Sistema completo de gestión para ferretería desarrollado con Next.js, TypeScript, Supabase y Tailwind CSS. Diseñado para ser desplegado gratuitamente en Vercel.

## 🚀 Características

- **Autenticación**: Sistema de login con diferentes roles de usuario
- **Gestión de Productos**: CRUD completo con código de barras, categorías, precios unitarios y por mayor
- **Bodega**: Control de inventario con movimientos de entrada, salida y ajustes
- **Punto de Venta (Caja)**: Sistema de ventas con diferentes métodos de pago (efectivo, tarjeta, factura)
- **Gestión de Empresas**: Registro y gestión de empresas para facturación
- **Facturación**: Control de pagos de facturas a empresas
- **Contabilidad**: Visualización de ventas y reportes
- **Usuarios**: Gestión de usuarios con diferentes roles (Admin, Bodega, Caja, Contabilidad)
- **Configuración**: Gestión de categorías y configuraciones del sistema

## 🛠️ Tecnologías

- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Supabase**: Base de datos y autenticación
- **Tailwind CSS**: Estilos
- **Vercel**: Hosting y deployment

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase (gratuita)
- Cuenta de Vercel (gratuita)
- Git

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd Ferreteria
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Supabase**
   - Crea un nuevo proyecto en [Supabase](https://supabase.com)
   - Ve a SQL Editor y ejecuta el contenido del archivo `supabase/schema.sql`
   - Ve a Settings > API y copia:
     - Project URL
     - anon/public key

4. **Configurar variables de entorno**
   - Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🗄️ Configuración de Base de Datos

1. Ejecuta el script SQL en Supabase:
   - Ve a SQL Editor en tu proyecto de Supabase
   - Copia y pega el contenido de `supabase/schema.sql`
   - Ejecuta el script

2. **Crear el primer usuario administrador**:
   - Ve a Authentication > Users en Supabase
   - Crea un nuevo usuario manualmente
   - Luego ejecuta este SQL para asignarle el rol de admin:
   ```sql
   INSERT INTO public.usuarios (id, email, nombre, rol, activo)
   VALUES (
     'id_del_usuario_creado',
     'admin@ferreteria.com',
     'Administrador',
     'admin',
     true
   );
   ```

## 🚀 Deployment en Vercel

1. **Preparar el repositorio**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Conectar con Vercel**
   - Ve a [Vercel](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Next.js

3. **Configurar variables de entorno en Vercel**
   - En el dashboard de Vercel, ve a Settings > Environment Variables
   - Agrega:
     - `NEXT_PUBLIC_SUPABASE_URL`: Tu URL de Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu anon key de Supabase

4. **Deploy**
   - Vercel desplegará automáticamente
   - Tu aplicación estará disponible en `tu-proyecto.vercel.app`

## 📱 Roles de Usuario

- **Admin**: Acceso completo a todas las funcionalidades
- **Bodega**: Gestión de inventario y movimientos de bodega
- **Caja**: Punto de venta y procesamiento de ventas
- **Contabilidad**: Visualización de ventas, facturas y reportes

## 🎯 Funcionalidades Principales

### Productos
- Código de barras
- Categorías
- Precios unitarios y por mayor
- Control de stock
- Unidades de medida
- Proveedores

### Ventas
- Carrito de compras
- Múltiples métodos de pago (efectivo, tarjeta, factura)
- Descuentos
- Facturación a empresas
- Generación automática de números de factura

### Bodega
- Movimientos de entrada/salida
- Ajustes de inventario
- Historial de movimientos
- Control de stock mínimo

### Empresas
- Registro de empresas
- NIT y datos de contacto
- Facturación a empresas
- Control de pagos

## 📝 Notas Importantes

- El sistema usa Row Level Security (RLS) en Supabase para seguridad
- Ajusta las políticas RLS según tus necesidades de seguridad
- Para producción, considera agregar más validaciones y manejo de errores
- El sistema está diseñado para ser completamente gratuito en el plan gratuito de Vercel y Supabase

## 🤝 Contribuciones

Este es un proyecto de portafolio. Siéntete libre de hacer fork y adaptarlo a tus necesidades.

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso en portafolios.

## 🐛 Solución de Problemas

### Error de autenticación
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que el usuario exista en la tabla `usuarios` de Supabase

### Error de permisos en Supabase
- Revisa las políticas RLS en Supabase
- Asegúrate de que el usuario tenga los permisos necesarios

### Error en deployment
- Verifica que todas las variables de entorno estén configuradas en Vercel
- Revisa los logs de build en Vercel

## 📧 Soporte

Para preguntas o problemas, abre un issue en el repositorio.
