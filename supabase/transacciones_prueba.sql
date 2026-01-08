-- Script para crear transacciones de prueba (ventas, movimientos, pagos)
-- IMPORTANTE: Ejecuta este script DESPUÉS de:
-- 1. Ejecutar schema.sql
-- 2. Ejecutar seed_data_complete.sql
-- 3. Crear los usuarios en Supabase Auth
-- 4. Insertar los usuarios en la tabla usuarios con sus IDs reales

-- ============================================
-- MOVIMIENTOS DE BODEGA DE PRUEBA
-- ============================================
-- Nota: Reemplaza 'UUID_BODEGA' y 'UUID_BODEGA2' con los IDs reales de tus usuarios de bodega

/*
-- Movimientos de entrada (compras a proveedores)
INSERT INTO public.movimientos_bodega (producto_id, tipo, cantidad, motivo, usuario_id)
SELECT 
  p.id,
  'entrada',
  (p.stock_minimo + 50)::integer,
  'Compra a proveedor - Reposición de inventario',
  'UUID_BODEGA'
FROM public.productos p
WHERE p.activo = true
LIMIT 30;

-- Movimientos de salida (ventas)
INSERT INTO public.movimientos_bodega (producto_id, tipo, cantidad, motivo, usuario_id)
SELECT 
  p.id,
  'salida',
  (FLOOR(RANDOM() * 10 + 1))::integer,
  'Venta - Salida por venta',
  'UUID_BODEGA'
FROM public.productos p
WHERE p.activo = true AND p.stock > 10
LIMIT 20;

-- Ajustes de inventario
INSERT INTO public.movimientos_bodega (producto_id, tipo, cantidad, motivo, usuario_id)
SELECT 
  p.id,
  'ajuste',
  (FLOOR(RANDOM() * 5 + 1))::integer,
  'Ajuste de inventario físico',
  'UUID_BODEGA2'
FROM public.productos p
WHERE p.activo = true
LIMIT 15;
*/

-- ============================================
-- VENTAS DE PRUEBA
-- ============================================
-- Nota: Reemplaza 'UUID_CAJA', 'UUID_CAJA2' con los IDs reales de tus usuarios de caja
-- Reemplaza 'EMPRESA_ID_X' con los IDs reales de las empresas creadas

/*
-- Ventas en efectivo
DO $$
DECLARE
  v_producto RECORD;
  v_venta_id UUID;
  v_numero_factura TEXT;
  v_subtotal DECIMAL;
  v_total DECIMAL;
  v_cantidad INTEGER;
  v_precio DECIMAL;
  v_usuario_id UUID := 'UUID_CAJA';
  i INTEGER;
BEGIN
  FOR i IN 1..50 LOOP
    -- Crear venta
    v_numero_factura := 'FAC-' || LPAD(i::TEXT, 8, '0');
    v_subtotal := 0;
    
    -- Seleccionar 1-5 productos aleatorios
    FOR v_producto IN 
      SELECT * FROM public.productos 
      WHERE activo = true AND stock > 0 
      ORDER BY RANDOM() 
      LIMIT (FLOOR(RANDOM() * 5 + 1)::INTEGER)
    LOOP
      v_cantidad := FLOOR(RANDOM() * 5 + 1)::INTEGER;
      IF v_cantidad >= v_producto.cantidad_minima_mayor THEN
        v_precio := v_producto.precio_mayor;
      ELSE
        v_precio := v_producto.precio_unitario;
      END IF;
      v_subtotal := v_subtotal + (v_precio * v_cantidad);
    END LOOP;
    
    v_total := v_subtotal;
    
    -- Insertar venta
    INSERT INTO public.ventas (
      numero_factura, usuario_id, tipo_pago, 
      subtotal, descuento, impuesto, total, estado
    ) VALUES (
      v_numero_factura, v_usuario_id, 'efectivo',
      v_subtotal, 0, 0, v_total, 'completada'
    ) RETURNING id INTO v_venta_id;
    
    -- Insertar detalles
    FOR v_producto IN 
      SELECT * FROM public.productos 
      WHERE activo = true AND stock > 0 
      ORDER BY RANDOM() 
      LIMIT (FLOOR(RANDOM() * 5 + 1)::INTEGER)
    LOOP
      v_cantidad := FLOOR(RANDOM() * 5 + 1)::INTEGER;
      IF v_cantidad >= v_producto.cantidad_minima_mayor THEN
        v_precio := v_producto.precio_mayor;
      ELSE
        v_precio := v_producto.precio_unitario;
      END IF;
      
      INSERT INTO public.detalle_ventas (
        venta_id, producto_id, cantidad, 
        precio_unitario, descuento, subtotal
      ) VALUES (
        v_venta_id, v_producto.id, v_cantidad,
        v_precio, 0, (v_precio * v_cantidad)
      );
      
      -- Actualizar stock
      UPDATE public.productos 
      SET stock = stock - v_cantidad 
      WHERE id = v_producto.id;
    END LOOP;
  END LOOP;
END $$;

-- Ventas con tarjeta
DO $$
DECLARE
  v_producto RECORD;
  v_venta_id UUID;
  v_numero_factura TEXT;
  v_subtotal DECIMAL;
  v_total DECIMAL;
  v_cantidad INTEGER;
  v_precio DECIMAL;
  v_usuario_id UUID := 'UUID_CAJA2';
  i INTEGER;
BEGIN
  FOR i IN 51..80 LOOP
    v_numero_factura := 'FAC-' || LPAD(i::TEXT, 8, '0');
    v_subtotal := 0;
    
    FOR v_producto IN 
      SELECT * FROM public.productos 
      WHERE activo = true AND stock > 0 
      ORDER BY RANDOM() 
      LIMIT (FLOOR(RANDOM() * 5 + 1)::INTEGER)
    LOOP
      v_cantidad := FLOOR(RANDOM() * 5 + 1)::INTEGER;
      IF v_cantidad >= v_producto.cantidad_minima_mayor THEN
        v_precio := v_producto.precio_mayor;
      ELSE
        v_precio := v_producto.precio_unitario;
      END IF;
      v_subtotal := v_subtotal + (v_precio * v_cantidad);
    END LOOP;
    
    v_total := v_subtotal;
    
    INSERT INTO public.ventas (
      numero_factura, usuario_id, tipo_pago, 
      subtotal, descuento, impuesto, total, estado
    ) VALUES (
      v_numero_factura, v_usuario_id, 'tarjeta',
      v_subtotal, 0, 0, v_total, 'completada'
    ) RETURNING id INTO v_venta_id;
    
    FOR v_producto IN 
      SELECT * FROM public.productos 
      WHERE activo = true AND stock > 0 
      ORDER BY RANDOM() 
      LIMIT (FLOOR(RANDOM() * 5 + 1)::INTEGER)
    LOOP
      v_cantidad := FLOOR(RANDOM() * 5 + 1)::INTEGER;
      IF v_cantidad >= v_producto.cantidad_minima_mayor THEN
        v_precio := v_producto.precio_mayor;
      ELSE
        v_precio := v_producto.precio_unitario;
      END IF;
      
      INSERT INTO public.detalle_ventas (
        venta_id, producto_id, cantidad, 
        precio_unitario, descuento, subtotal
      ) VALUES (
        v_venta_id, v_producto.id, v_cantidad,
        v_precio, 0, (v_precio * v_cantidad)
      );
      
      UPDATE public.productos 
      SET stock = stock - v_cantidad 
      WHERE id = v_producto.id;
    END LOOP;
  END LOOP;
END $$;

-- Ventas a factura (empresas)
DO $$
DECLARE
  v_producto RECORD;
  v_venta_id UUID;
  v_numero_factura TEXT;
  v_subtotal DECIMAL;
  v_total DECIMAL;
  v_cantidad INTEGER;
  v_precio DECIMAL;
  v_usuario_id UUID := 'UUID_CAJA';
  v_empresa_id UUID;
  v_empresas UUID[];
  i INTEGER;
BEGIN
  -- Obtener IDs de empresas
  SELECT ARRAY_AGG(id) INTO v_empresas FROM public.empresas WHERE activa = true;
  
  FOR i IN 81..100 LOOP
    -- Seleccionar empresa aleatoria
    v_empresa_id := v_empresas[FLOOR(RANDOM() * array_length(v_empresas, 1) + 1)::INTEGER];
    
    v_numero_factura := 'FAC-' || LPAD(i::TEXT, 8, '0');
    v_subtotal := 0;
    
    FOR v_producto IN 
      SELECT * FROM public.productos 
      WHERE activo = true AND stock > 0 
      ORDER BY RANDOM() 
      LIMIT (FLOOR(RANDOM() * 8 + 3)::INTEGER)
    LOOP
      v_cantidad := FLOOR(RANDOM() * 10 + 5)::INTEGER;
      IF v_cantidad >= v_producto.cantidad_minima_mayor THEN
        v_precio := v_producto.precio_mayor;
      ELSE
        v_precio := v_producto.precio_unitario;
      END IF;
      v_subtotal := v_subtotal + (v_precio * v_cantidad);
    END LOOP;
    
    v_total := v_subtotal;
    
    INSERT INTO public.ventas (
      numero_factura, empresa_id, usuario_id, tipo_pago, 
      subtotal, descuento, impuesto, total, estado
    ) VALUES (
      v_numero_factura, v_empresa_id, v_usuario_id, 'factura',
      v_subtotal, 0, 0, v_total, 'completada'
    ) RETURNING id INTO v_venta_id;
    
    FOR v_producto IN 
      SELECT * FROM public.productos 
      WHERE activo = true AND stock > 0 
      ORDER BY RANDOM() 
      LIMIT (FLOOR(RANDOM() * 8 + 3)::INTEGER)
    LOOP
      v_cantidad := FLOOR(RANDOM() * 10 + 5)::INTEGER;
      IF v_cantidad >= v_producto.cantidad_minima_mayor THEN
        v_precio := v_producto.precio_mayor;
      ELSE
        v_precio := v_producto.precio_unitario;
      END IF;
      
      INSERT INTO public.detalle_ventas (
        venta_id, producto_id, cantidad, 
        precio_unitario, descuento, subtotal
      ) VALUES (
        v_venta_id, v_producto.id, v_cantidad,
        v_precio, 0, (v_precio * v_cantidad)
      );
      
      UPDATE public.productos 
      SET stock = stock - v_cantidad 
      WHERE id = v_producto.id;
    END LOOP;
  END LOOP;
END $$;
*/

-- ============================================
-- PAGOS DE FACTURAS DE PRUEBA
-- ============================================
-- Nota: Reemplaza 'UUID_CONTABILIDAD' con el ID real de tu usuario de contabilidad

/*
-- Pagos parciales y completos de facturas
DO $$
DECLARE
  v_factura RECORD;
  v_pago_id UUID;
  v_monto_pagado DECIMAL;
  v_total_pagado DECIMAL;
  v_metodo TEXT;
  v_fecha_pago DATE;
BEGIN
  FOR v_factura IN 
    SELECT v.*, e.id as empresa_id
    FROM public.ventas v
    JOIN public.empresas e ON v.empresa_id = e.id
    WHERE v.tipo_pago = 'factura' AND v.estado = 'completada'
    ORDER BY RANDOM()
    LIMIT 30
  LOOP
    -- Calcular monto ya pagado
    SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado
    FROM public.pagos_facturas
    WHERE factura_id = v_factura.id AND estado = 'pagado';
    
    -- Si ya está pagada completamente, saltar
    IF v_total_pagado >= v_factura.total THEN
      CONTINUE;
    END IF;
    
    -- Determinar método de pago aleatorio
    v_metodo := CASE FLOOR(RANDOM() * 3)::INTEGER
      WHEN 0 THEN 'transferencia'
      WHEN 1 THEN 'cheque'
      ELSE 'efectivo'
    END;
    
    -- Fecha de pago aleatoria (últimos 30 días)
    v_fecha_pago := CURRENT_DATE - (FLOOR(RANDOM() * 30)::INTEGER);
    
    -- Monto: pago completo o parcial
    IF RANDOM() > 0.5 THEN
      -- Pago completo
      v_monto_pagado := v_factura.total - v_total_pagado;
    ELSE
      -- Pago parcial (50-90% del restante)
      v_monto_pagado := (v_factura.total - v_total_pagado) * (0.5 + RANDOM() * 0.4);
    END IF;
    
    INSERT INTO public.pagos_facturas (
      factura_id, empresa_id, monto, fecha_pago,
      metodo_pago, referencia, estado
    ) VALUES (
      v_factura.id, v_factura.empresa_id, v_monto_pagado, v_fecha_pago,
      v_metodo, 
      CASE v_metodo
        WHEN 'transferencia' THEN 'TRF-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 8, '0')
        WHEN 'cheque' THEN 'CHQ-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 8, '0')
        ELSE NULL
      END,
      'pagado'
    );
  END LOOP;
END $$;
*/

-- ============================================
-- NOTAS FINALES
-- ============================================
-- 1. Este script crea aproximadamente:
--    - 65 movimientos de bodega
--    - 100 ventas (50 efectivo, 30 tarjeta, 20 factura)
--    - 30 pagos de facturas
--
-- 2. Los movimientos de bodega actualizan el stock automáticamente
-- 3. Las ventas también actualizan el stock
-- 4. Los pagos pueden ser parciales o completos
-- 5. Ajusta los números según tus necesidades de prueba
