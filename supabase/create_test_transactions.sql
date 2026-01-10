-- Script simplificado para crear transacciones de prueba
-- Este script crea ventas distribuidas en los últimos 24 meses

-- Función para generar número de factura único
CREATE OR REPLACE FUNCTION generar_num_factura(prefix TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('factura_seq')::TEXT, 6, '0');
EXCEPTION
  WHEN undefined_table THEN
    CREATE SEQUENCE IF NOT EXISTS factura_seq;
    RETURN prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('factura_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Crear secuencia si no existe
CREATE SEQUENCE IF NOT EXISTS factura_seq;

-- Obtener IDs necesarios (ejecutar primero para verificar)
DO $$
DECLARE
  empresa_id UUID;
  usuario_id UUID;
  producto_id UUID;
  ano_actual INTEGER;
  mes_num INTEGER;
  dia_num INTEGER;
  fecha_venta TIMESTAMP;
  subtotal_val DECIMAL;
  total_val DECIMAL;
  tipo_pago_val TEXT;
  venta_id UUID;
BEGIN
  -- Obtener IDs existentes
  SELECT id INTO empresa_id FROM public.empresas WHERE activa = true LIMIT 1;
  SELECT id INTO usuario_id FROM public.usuarios WHERE activo = true AND rol IN ('admin', 'caja') LIMIT 1;
  SELECT id INTO producto_id FROM public.productos WHERE activo = true LIMIT 1;
  
  ano_actual := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

  -- Crear ventas para los últimos 12 meses (año actual)
  FOR mes_num IN 0..11 LOOP
    FOR dia_num IN 1..5 LOOP -- 5 ventas por mes
      fecha_venta := (CURRENT_DATE - (mes_num || ' months')::interval)::date + (dia_num * 5)::integer;
      subtotal_val := 50000 + (dia_num * 15000);
      total_val := subtotal_val * 1.19;
      
      -- Asignar tipo de pago aleatorio
      CASE (dia_num % 3)
        WHEN 0 THEN tipo_pago_val := 'efectivo';
        WHEN 1 THEN tipo_pago_val := 'tarjeta';
        ELSE tipo_pago_val := 'factura';
      END CASE;

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
        'FAC-' || ano_actual || '-' || LPAD((mes_num * 10 + dia_num)::TEXT, 6, '0'),
        CASE WHEN dia_num % 3 = 2 THEN empresa_id ELSE NULL END,
        usuario_id,
        usuario_id,
        tipo_pago_val,
        subtotal_val,
        0,
        subtotal_val * 0.19,
        total_val,
        'completada',
        fecha_venta
      )
      RETURNING id INTO venta_id;

      -- Crear detalle de venta
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
          5 + dia_num,
          10000,
          0,
          (5 + dia_num) * 10000
        );
      END IF;
    END LOOP;
  END LOOP;

  -- Crear ventas para el año pasado (12 meses anteriores)
  FOR mes_num IN 12..23 LOOP
    FOR dia_num IN 1..4 LOOP -- 4 ventas por mes (menos que el año actual)
      fecha_venta := (CURRENT_DATE - (mes_num || ' months')::interval)::date + (dia_num * 6)::integer;
      subtotal_val := 45000 + (dia_num * 12000); -- Montos un poco menores
      total_val := subtotal_val * 1.19;

      CASE (dia_num % 3)
        WHEN 0 THEN tipo_pago_val := 'efectivo';
        WHEN 1 THEN tipo_pago_val := 'tarjeta';
        ELSE tipo_pago_val := 'factura';
      END CASE;

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
        'FAC-' || (ano_actual - 1) || '-PAS-' || LPAD(((mes_num - 12) * 10 + dia_num)::TEXT, 6, '0'),
        CASE WHEN dia_num % 4 = 3 THEN empresa_id ELSE NULL END,
        usuario_id,
        usuario_id,
        tipo_pago_val,
        subtotal_val,
        0,
        subtotal_val * 0.19,
        total_val,
        'completada',
        fecha_venta
      )
      RETURNING id INTO venta_id;

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
          4 + dia_num,
          9000,
          0,
          (4 + dia_num) * 9000
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;
