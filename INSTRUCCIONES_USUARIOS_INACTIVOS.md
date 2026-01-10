# Instrucciones para Crear Usuarios Inactivos

Para agregar usuarios que ya no trabajan en la tienda y probar el bloqueo de login, sigue estos pasos:

## Paso 1: Crear Usuarios en Supabase Auth

1. Ve a tu proyecto de Supabase
2. Navega a **Authentication > Users**
3. Haz click en **"Add user"** o **"Invite user"**
4. Crea los siguientes usuarios:

   | Email | Contraseña | Nombre Completo |
   |-------|------------|-----------------|
   | exempleado1@ferreteria.com | ExEmpleado123! | Roberto Martínez |
   | exempleado2@ferreteria.com | ExEmpleado123! | Carmen López |
   | exempleado3@ferreteria.com | ExEmpleado123! | Fernando Díaz |

5. **Copia el User UID** de cada usuario creado (aparece en la lista de usuarios)

## Paso 2: Actualizar Tabla de Usuarios

Ejecuta este SQL en Supabase SQL Editor, **reemplazando los UUIDs** con los User UIDs reales que copiaste:

```sql
-- Reemplaza UUID_EMPLEADO1, UUID_EMPLEADO2, UUID_EMPLEADO3 con los User UIDs reales

-- Usuario 1: Roberto Martínez
UPDATE public.usuarios 
SET nombre = 'Roberto Martínez - Ex Empleado',
    rol = 'caja',
    activo = false
WHERE id = '18d93fe9-e98a-4dfa-bf5d-f1b6e260fcc9';

-- Si no existe el registro, créalo:
INSERT INTO public.usuarios (id, email, nombre, rol, activo, created_at)
VALUES ('18d93fe9-e98a-4dfa-bf5d-f1b6e260fcc9', 'exempleado1@ferreteria.com', 'Roberto Martínez - Ex Empleado', 'caja', false, '2023-01-15'::timestamp)
ON CONFLICT (id) DO UPDATE 
SET nombre = 'Roberto Martínez - Ex Empleado',
    activo = false;

-- Usuario 2: Carmen López
UPDATE public.usuarios 
SET nombre = 'Carmen López - Ex Empleado',
    rol = 'bodega',
    activo = false
WHERE id = 'ff00c6f5-0d78-4e9e-b999-3e525191f696';

INSERT INTO public.usuarios (id, email, nombre, rol, activo, created_at)
VALUES ('ff00c6f5-0d78-4e9e-b999-3e525191f696', 'exempleado2@ferreteria.com', 'Carmen López - Ex Empleado', 'bodega', false, '2023-03-20'::timestamp)
ON CONFLICT (id) DO UPDATE 
SET nombre = 'Carmen López - Ex Empleado',
    activo = false;

-- Usuario 3: Fernando Díaz
UPDATE public.usuarios 
SET nombre = 'Fernando Díaz - Ex Empleado',
    rol = 'contabilidad',
    activo = false
WHERE id = '5ef8a0b4-56bd-47d6-99a4-5a0ae5af56f3';

INSERT INTO public.usuarios (id, email, nombre, rol, activo, created_at)
VALUES ('5ef8a0b4-56bd-47d6-99a4-5a0ae5af56f3', 'exempleado3@ferreteria.com', 'Fernando Díaz - Ex Empleado', 'contabilidad', false, '2023-06-10'::timestamp)
ON CONFLICT (id) DO UPDATE 
SET nombre = 'Fernando Díaz - Ex Empleado',
    activo = false;

-- Crear registros de sesión para estos usuarios (desconectados)
INSERT INTO public.sesiones_usuarios (usuario_id, ultima_conexion, esta_activo)
VALUES 
  ('18d93fe9-e98a-4dfa-bf5d-f1b6e260fcc9', '2023-12-31'::timestamp, false),
  ('ff00c6f5-0d78-4e9e-b999-3e525191f696', '2023-12-31'::timestamp, false),
  ('5ef8a0b4-56bd-47d6-99a4-5a0ae5af56f3', '2023-12-31'::timestamp, false)
ON CONFLICT (usuario_id) DO UPDATE 
SET esta_activo = false,
    updated_at = NOW();
```

## Paso 3: Probar el Bloqueo

1. Intenta iniciar sesión con alguno de estos usuarios inactivos
2. Deberías ver el mensaje: **"Tu cuenta ha sido desactivada. Ya no perteneces a esta tienda. Por favor, contacta al administrador."**
3. El usuario será redirigido automáticamente al login

## Alternativa: Usar Usuarios Existentes

Si ya tienes usuarios de prueba que quieres marcar como inactivos temporalmente:

```sql
-- Marcar un usuario existente como inactivo
UPDATE public.usuarios 
SET activo = false 
WHERE email = 'email-del-usuario@ferreteria.com';

-- Actualizar su sesión
UPDATE public.sesiones_usuarios
SET esta_activo = false,
    updated_at = NOW()
WHERE usuario_id = (SELECT id FROM public.usuarios WHERE email = 'email-del-usuario@ferreteria.com');

-- Para reactivarlo después:
UPDATE public.usuarios 
SET activo = true 
WHERE email = 'email-del-usuario@ferreteria.com';
```

## Verificar Usuarios Inactivos

Para ver todos los usuarios inactivos:

```sql
SELECT id, email, nombre, rol, activo, created_at
FROM public.usuarios
WHERE activo = false;
```
