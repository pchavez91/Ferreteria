-- Políticas RLS adicionales para permitir operaciones
-- Ejecuta este script después del schema.sql si tienes problemas de permisos
-- NOTA: Este script usa DROP POLICY IF EXISTS para evitar errores si las políticas ya existen

-- Permitir a usuarios autenticados insertar ventas
DROP POLICY IF EXISTS "Authenticated users can insert sales" ON public.ventas;
CREATE POLICY "Authenticated users can insert sales" ON public.ventas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados leer ventas
DROP POLICY IF EXISTS "Authenticated users can read sales" ON public.ventas;
CREATE POLICY "Authenticated users can read sales" ON public.ventas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados insertar detalles de venta
DROP POLICY IF EXISTS "Authenticated users can insert sale details" ON public.detalle_ventas;
CREATE POLICY "Authenticated users can insert sale details" ON public.detalle_ventas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados leer detalles de venta
DROP POLICY IF EXISTS "Authenticated users can read sale details" ON public.detalle_ventas;
CREATE POLICY "Authenticated users can read sale details" ON public.detalle_ventas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados insertar movimientos de bodega
DROP POLICY IF EXISTS "Authenticated users can insert warehouse movements" ON public.movimientos_bodega;
CREATE POLICY "Authenticated users can insert warehouse movements" ON public.movimientos_bodega
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados leer movimientos de bodega
DROP POLICY IF EXISTS "Authenticated users can read warehouse movements" ON public.movimientos_bodega;
CREATE POLICY "Authenticated users can read warehouse movements" ON public.movimientos_bodega
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados actualizar productos (para stock)
DROP POLICY IF EXISTS "Authenticated users can update product stock" ON public.productos;
CREATE POLICY "Authenticated users can update product stock" ON public.productos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados leer empresas
DROP POLICY IF EXISTS "Authenticated users can read companies" ON public.empresas;
CREATE POLICY "Authenticated users can read companies" ON public.empresas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados insertar empresas
DROP POLICY IF EXISTS "Authenticated users can insert companies" ON public.empresas;
CREATE POLICY "Authenticated users can insert companies" ON public.empresas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados leer categorías
DROP POLICY IF EXISTS "Authenticated users can read categories" ON public.categorias;
CREATE POLICY "Authenticated users can read categories" ON public.categorias
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados leer proveedores
DROP POLICY IF EXISTS "Authenticated users can read suppliers" ON public.proveedores;
CREATE POLICY "Authenticated users can read suppliers" ON public.proveedores
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados leer pagos de facturas
DROP POLICY IF EXISTS "Authenticated users can read invoice payments" ON public.pagos_facturas;
CREATE POLICY "Authenticated users can read invoice payments" ON public.pagos_facturas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados insertar pagos de facturas
DROP POLICY IF EXISTS "Authenticated users can insert invoice payments" ON public.pagos_facturas;
CREATE POLICY "Authenticated users can insert invoice payments" ON public.pagos_facturas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- IMPORTANTE: Eliminar política restrictiva de usuarios y crear una nueva que permita ver todos
-- Esta política reemplaza la política "Users can read own data" del schema.sql
DROP POLICY IF EXISTS "Users can read own data" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can read all users" ON public.usuarios;
DROP POLICY IF EXISTS "Authenticated users can read all users" ON public.usuarios;

-- Permitir a todos los usuarios autenticados leer todos los usuarios (para administradores ver lista completa)
CREATE POLICY "Authenticated users can read all users" ON public.usuarios
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir leer sesiones de usuarios a todos los autenticados
DROP POLICY IF EXISTS "Authenticated users can read sessions" ON public.sesiones_usuarios;
CREATE POLICY "Authenticated users can read sessions" ON public.sesiones_usuarios
  FOR SELECT USING (auth.role() = 'authenticated');
