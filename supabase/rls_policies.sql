-- Políticas RLS adicionales para permitir operaciones
-- Ejecuta este script después del schema.sql si tienes problemas de permisos

-- Permitir a usuarios autenticados insertar ventas
CREATE POLICY "Authenticated users can insert sales" ON public.ventas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados leer ventas
CREATE POLICY "Authenticated users can read sales" ON public.ventas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados insertar detalles de venta
CREATE POLICY "Authenticated users can insert sale details" ON public.detalle_ventas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados leer detalles de venta
CREATE POLICY "Authenticated users can read sale details" ON public.detalle_ventas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados insertar movimientos de bodega
CREATE POLICY "Authenticated users can insert warehouse movements" ON public.movimientos_bodega
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados leer movimientos de bodega
CREATE POLICY "Authenticated users can read warehouse movements" ON public.movimientos_bodega
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados actualizar productos (para stock)
CREATE POLICY "Authenticated users can update product stock" ON public.productos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados leer empresas
CREATE POLICY "Authenticated users can read companies" ON public.empresas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados insertar empresas
CREATE POLICY "Authenticated users can insert companies" ON public.empresas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados leer categorías
CREATE POLICY "Authenticated users can read categories" ON public.categorias
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados leer proveedores
CREATE POLICY "Authenticated users can read suppliers" ON public.proveedores
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados leer pagos de facturas
CREATE POLICY "Authenticated users can read invoice payments" ON public.pagos_facturas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir a usuarios autenticados insertar pagos de facturas
CREATE POLICY "Authenticated users can insert invoice payments" ON public.pagos_facturas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
