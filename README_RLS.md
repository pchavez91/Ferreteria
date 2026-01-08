# Solución de Error RLS (Row Level Security)

Si recibes el error: **"new row violates row-level security policy for table 'ventas'"**

## Solución Rápida

Ejecuta el archivo `supabase/rls_policies.sql` en el SQL Editor de Supabase.

Este script agrega las políticas necesarias para que los usuarios autenticados puedan:
- Insertar y leer ventas
- Insertar y leer detalles de venta
- Insertar y leer movimientos de bodega
- Actualizar stock de productos
- Insertar y leer empresas
- Y otras operaciones necesarias

## Pasos

1. Ve a tu proyecto de Supabase
2. Abre **SQL Editor**
3. Copia y pega el contenido de `supabase/rls_policies.sql`
4. Haz clic en **Run**
5. Verifica que no haya errores

## Nota

Si ya ejecutaste el `schema.sql` anteriormente, estas políticas pueden estar duplicadas. En ese caso, puedes:
- Eliminar las políticas existentes primero, o
- Ejecutar solo las políticas que faltan

Las políticas están diseñadas para ser permisivas en desarrollo. Para producción, deberías ajustarlas según tus necesidades de seguridad.
