-- Script para agregar datos adicionales:
-- 1. Usuarios inactivos
-- 2. Empresas inactivas
-- 3. Facturas sin pagar
-- 4. Más transacciones con diferentes fechas
-- 5. Actualizar ventas con vendedor_id

-- Primero, asegurarse de que el campo vendedor_id existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ventas' 
    AND column_name = 'vendedor_id'
  ) THEN
    ALTER TABLE public.ventas ADD COLUMN vendedor_id UUID REFERENCES public.usuarios(id);
    UPDATE public.ventas SET vendedor_id = usuario_id WHERE vendedor_id IS NULL;
  END IF;
END $$;

-- NOTA: Para crear usuarios inactivos, primero debes crearlos en Supabase Auth (Authentication > Users)
-- Luego, actualiza su registro en la tabla usuarios para marcarlos como inactivos.
-- 
-- Pasos:
-- 1. Ve a Supabase Dashboard > Authentication > Users
-- 2. Crea los usuarios con estos emails y contraseñas:
--    - exempleado1@ferreteria.com / ExEmpleado123!
--    - exempleado2@ferreteria.com / ExEmpleado123!
--    - exempleado3@ferreteria.com / ExEmpleado123!
-- 3. Copia los User UIDs que se generan
-- 4. Ejecuta este script reemplazando los UUIDs con los IDs reales:
--
-- UPDATE public.usuarios 
-- SET activo = false, 
--     nombre = CASE 
--       WHEN email = 'exempleado1@ferreteria.com' THEN 'Roberto Martínez - Ex Empleado'
--       WHEN email = 'exempleado2@ferreteria.com' THEN 'Carmen López - Ex Empleado'
--       WHEN email = 'exempleado3@ferreteria.com' THEN 'Fernando Díaz - Ex Empleado'
--     END
-- WHERE email IN ('exempleado1@ferreteria.com', 'exempleado2@ferreteria.com', 'exempleado3@ferreteria.com');

-- Alternativamente, si ya tienes usuarios existentes que quieres marcar como inactivos, ejecuta:
-- UPDATE public.usuarios SET activo = false WHERE email LIKE '%exempleado%';

-- Crear sesiones para usuarios inactivos existentes (marcados como desconectados)
INSERT INTO public.sesiones_usuarios (usuario_id, ultima_conexion, esta_activo)
SELECT id, created_at, false
FROM public.usuarios
WHERE activo = false
ON CONFLICT (usuario_id) DO UPDATE SET esta_activo = false;

-- Agregar empresas inactivas
INSERT INTO public.empresas (id, nombre, nit, direccion, telefono, email, contacto, activa, created_at)
VALUES
  ('e1f2a3b4-c5d6-7890-efab-cdef12345678', 'Constructora ABC S.A.', '900123456-1', 'Calle 123 #45-67', '601-234-5678', 'contacto@abc-constructora.com', 'Juan Constructora', false, '2022-05-15'::timestamp),
  ('f2a3b4c5-d6e7-8901-fabc-def123456789', 'Herramientas XYZ Ltda.', '800987654-2', 'Av. Principal 789', '604-987-6543', 'info@herramientas-xyz.com', 'María Herramientas', false, '2022-08-20'::timestamp),
  ('a3b4c5d6-e7f8-9012-abcd-ef1234567890', 'Distribuidora DEF S.A.S.', '700555444-3', 'Carrera 50 #30-15', '602-555-4444', 'ventas@def-distribuidora.com', 'Pedro Distribución', false, '2022-11-10'::timestamp),
  ('b4c5d6e7-f8a9-0123-bcde-f12345678901', 'Materiales GHI S.A.', '600333222-4', 'Calle 80 #20-40', '601-333-2222', 'contacto@ghi-materiales.com', 'Laura Materiales', false, '2023-01-25'::timestamp)
ON CONFLICT (nit) DO NOTHING;

-- Obtener IDs de empresas y usuarios existentes para crear facturas sin pagar
DO $$
DECLARE
  empresa_activa_id UUID;
  empresa_inactiva_id UUID;
  usuario_caja_id UUID;
  usuario_admin_id UUID;
  venta_id UUID;
  producto_id UUID;
  fecha_antigua DATE;
BEGIN
  -- Obtener IDs
  SELECT id INTO empresa_activa_id FROM public.empresas WHERE activa = true LIMIT 1;
  SELECT id INTO empresa_inactiva_id FROM public.empresas WHERE activa = false LIMIT 1;
  SELECT id INTO usuario_caja_id FROM public.usuarios WHERE rol = 'caja' AND activo = true LIMIT 1;
  SELECT id INTO usuario_admin_id FROM public.usuarios WHERE rol = 'admin' AND activo = true LIMIT 1;
  SELECT id INTO producto_id FROM public.productos WHERE activo = true LIMIT 1;

  -- Crear facturas sin pagar (pendientes) del mes pasado
  FOR i IN 1..5 LOOP
    fecha_antigua := CURRENT_DATE - (i * 7 + 30); -- Hace 30-65 días
    
    INSERT INTO public.ventas (
      numero_factura,
      empresa_id,
      usuario_id,
      vendedor_id,
      tipo_pago,
      subtotal,
      descuento,
      impuesto,
      total,
      estado,
      created_at
    )
    VALUES (
      'FAC-PEND-' || LPAD(i::text, 6, '0'),
      COALESCE(empresa_activa_id, empresa_inactiva_id),
      COALESCE(usuario_admin_id, usuario_caja_id),
      COALESCE(usuario_admin_id, usuario_caja_id),
      'factura',
      100000 + (i * 25000),
      0,
      (100000 + (i * 25000)) * 0.19,
      (100000 + (i * 25000)) * 1.19,
      'completada',
      fecha_antigua
    )
    RETURNING id INTO venta_id;

    -- Crear detalles de venta
    IF producto_id IS NOT NULL THEN
      INSERT INTO public.detalle_ventas (
        venta_id,
        producto_id,
        cantidad,
        precio_unitario,
        descuento,
        subtotal
      )
      VALUES (
        venta_id,
        producto_id,
        10 + i,
        10000 + (i * 2500),
        0,
        (10 + i) * (10000 + (i * 2500))
      );
    END IF;
  END LOOP;
END $$;

-- Agregar más transacciones (ventas) con diferentes fechas para gráficos
-- Nota: Este script crea ventas para los últimos 24 meses
-- Para ejecutar completamente, se recomienda usar una función o ejecutar en partes

-- Primero, crear una función auxiliar para generar fechas aleatorias
CREATE OR REPLACE FUNCTION generar_fecha_aleatoria(mes_offset INTEGER) RETURNS TIMESTAMP AS $$
BEGIN
  RETURN DATE_TRUNC('month', CURRENT_DATE - (mes_offset || ' months')::interval)::date 
    + (FLOOR(RANDOM() * 25) + 1)::integer
    + (FLOOR(RANDOM() * 8))::integer * interval '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Insertar ventas usando INSERT directo (más simple que loops complejos)
-- Esto se puede ejecutar varias veces o ajustar según necesidades
-- Las ventas del año actual y pasado se agregarán manualmente o mediante script Python/Node.js

-- Actualizar movimientos de bodega para incluir usuario
UPDATE public.movimientos_bodega
SET usuario_id = (SELECT id FROM public.usuarios WHERE rol = 'bodega' AND activo = true LIMIT 1)
WHERE usuario_id IS NULL;

-- IMPORTANTE: 
-- Para crear usuarios inactivos, consulta el archivo INSTRUCCIONES_USUARIOS_INACTIVOS.md
-- Los usuarios deben crearse primero en Supabase Auth antes de insertarlos en la tabla usuarios
