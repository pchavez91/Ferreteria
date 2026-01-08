# Usuarios de Prueba - Sistema de Ferretería

Este documento contiene las credenciales de los usuarios de prueba para el sistema.

## 📋 Instrucciones para Crear Usuarios

1. Ve a **Authentication > Users** en tu proyecto de Supabase
2. Crea cada usuario con el email y contraseña indicados
3. Copia el **User UID** de cada usuario creado
4. Ejecuta el script SQL al final de este documento reemplazando los UUIDs con los IDs reales

## 👥 Usuarios de Prueba

### 1. Administrador
- **Email:** `admin@ferreteria.com`
- **Contraseña:** `admin123`
- **Nombre:** Carlos Administrador
- **Rol:** admin
- **Acceso:** Completo a todas las funcionalidades

### 2. Bodega 1
- **Email:** `bodega@ferreteria.com`
- **Contraseña:** `Bodega123!`
- **Nombre:** María González - Bodega
- **Rol:** bodega
- **Acceso:** Dashboard, Productos, Bodega

### 3. Caja 1
- **Email:** `caja@ferreteria.com`
- **Contraseña:** `Caja123!`
- **Nombre:** Juan Pérez - Caja
- **Rol:** caja
- **Acceso:** Dashboard, Productos, Caja, Ventas

### 4. Contabilidad
- **Email:** `contabilidad@ferreteria.com`
- **Contraseña:** `Conta123!`
- **Nombre:** Ana Martínez - Contabilidad
- **Rol:** contabilidad
- **Acceso:** Dashboard, Ventas, Empresas, Facturas

### 5. Bodega 2
- **Email:** `bodega2@ferreteria.com`
- **Contraseña:** `Bodega2123!`
- **Nombre:** Pedro Ramírez - Bodega
- **Rol:** bodega
- **Acceso:** Dashboard, Productos, Bodega

### 6. Caja 2
- **Email:** `caja2@ferreteria.com`
- **Contraseña:** `Caja2123!`
- **Nombre:** Laura Sánchez - Caja
- **Rol:** caja
- **Acceso:** Dashboard, Productos, Caja, Ventas

## 🔧 Script SQL para Insertar Usuarios

Después de crear los usuarios en Supabase Auth, ejecuta este SQL reemplazando los UUIDs:

```sql
-- Reemplaza UUID_ADMIN con el ID real del usuario admin@ferreteria.com
-- Reemplaza UUID_BODEGA con el ID real del usuario bodega@ferreteria.com
-- Y así sucesivamente...

INSERT INTO public.usuarios (id, email, nombre, rol, activo) VALUES
('bba32ec1-e4e8-47b0-b1cd-2634cb1cff0f', 'admin@ferreteria.com', 'Carlos Administrador', 'admin', true),
('4cdcb357-0763-4fa7-8cee-7b5cac2ac078', 'bodega@ferreteria.com', 'María González - Bodega', 'bodega', true),
('8cd17a43-496e-40f6-8328-3075eb226f32', 'caja@ferreteria.com', 'Juan Pérez - Caja', 'caja', true),
('18d7a14d-8266-431a-846a-0caceb121d33', 'contabilidad@ferreteria.com', 'Ana Martínez - Contabilidad', 'contabilidad', true),
('d394a15e-6288-41a5-ac76-5eb90fd1fb68', 'bodega2@ferreteria.com', 'Pedro Ramírez - Bodega', 'bodega', true),
('dc2e73c4-5849-4d8c-94d2-5a46bbb21e09', 'caja2@ferreteria.com', 'Laura Sánchez - Caja', 'caja', true);
```

## 📝 Notas

- Todos los usuarios tienen la contraseña con formato: `[Rol][123!]`
- Puedes cambiar las contraseñas después de crear los usuarios
- Los usuarios están activos por defecto
- Puedes crear más usuarios desde la sección de Usuarios si tienes rol de admin

## 🔐 Seguridad

- Estas credenciales son solo para desarrollo y pruebas
- **NO uses estas contraseñas en producción**
- Cambia todas las contraseñas antes de desplegar a producción
- Considera usar contraseñas más seguras en producción
