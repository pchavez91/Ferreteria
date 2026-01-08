-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (extendiendo auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'bodega', 'caja', 'contabilidad')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS public.proveedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  contacto TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS public.productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_barras TEXT UNIQUE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria_id UUID REFERENCES public.categorias(id),
  precio_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0,
  precio_mayor DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cantidad_minima_mayor INTEGER DEFAULT 1,
  stock INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  unidad_medida TEXT DEFAULT 'unidad',
  proveedor_id UUID REFERENCES public.proveedores(id),
  activo BOOLEAN DEFAULT true,
  imagen_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de empresas
CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  nit TEXT NOT NULL UNIQUE,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  contacto TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS public.ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_factura TEXT NOT NULL UNIQUE,
  cliente_id UUID,
  empresa_id UUID REFERENCES public.empresas(id),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id),
  tipo_pago TEXT NOT NULL CHECK (tipo_pago IN ('efectivo', 'tarjeta', 'factura')),
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  descuento DECIMAL(10, 2) DEFAULT 0,
  impuesto DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada', 'cancelada')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de detalles de venta
CREATE TABLE IF NOT EXISTS public.detalle_ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venta_id UUID NOT NULL REFERENCES public.ventas(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES public.productos(id),
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  descuento DECIMAL(10, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de movimientos de bodega
CREATE TABLE IF NOT EXISTS public.movimientos_bodega (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID NOT NULL REFERENCES public.productos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
  cantidad INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pagos de facturas
CREATE TABLE IF NOT EXISTS public.pagos_facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factura_id UUID NOT NULL REFERENCES public.ventas(id),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  monto DECIMAL(10, 2) NOT NULL,
  fecha_pago DATE NOT NULL,
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('transferencia', 'cheque', 'efectivo')),
  referencia TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_codigo_barras ON public.productos(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_ventas_usuario ON public.ventas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ventas_empresa ON public.ventas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON public.ventas(created_at);
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_venta ON public.detalle_ventas(venta_id);
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_producto ON public.detalle_ventas(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON public.movimientos_bodega(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON public.movimientos_bodega(created_at);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON public.categorias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proveedores_updated_at BEFORE UPDATE ON public.proveedores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON public.productos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventas_updated_at BEFORE UPDATE ON public.ventas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_facturas_updated_at BEFORE UPDATE ON public.pagos_facturas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_bodega ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_facturas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidades)
-- Los usuarios autenticados pueden leer sus propios datos
CREATE POLICY "Users can read own data" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

-- Todos los usuarios autenticados pueden leer productos activos
CREATE POLICY "Authenticated users can read active products" ON public.productos
  FOR SELECT USING (auth.role() = 'authenticated' AND activo = true);

-- Solo admin puede modificar productos
CREATE POLICY "Only admin can modify products" ON public.productos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Similar para otras tablas según roles...
