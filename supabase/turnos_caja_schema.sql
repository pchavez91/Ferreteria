-- Tabla de turnos de caja
CREATE TABLE IF NOT EXISTS public.turnos_caja (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_fin TIMESTAMP WITH TIME ZONE,
  monto_inicial DECIMAL(10, 2) NOT NULL DEFAULT 0,
  monto_final DECIMAL(10, 2),
  total_ventas_efectivo DECIMAL(10, 2) DEFAULT 0,
  total_ventas_tarjeta DECIMAL(10, 2) DEFAULT 0,
  total_ventas_factura DECIMAL(10, 2) DEFAULT 0,
  total_ventas DECIMAL(10, 2) DEFAULT 0,
  diferencia DECIMAL(10, 2),
  observaciones TEXT,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'finalizado', 'cancelado')),
  aprobado_por UUID REFERENCES public.usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de detalle de dinero en caja (inicio)
CREATE TABLE IF NOT EXISTS public.detalle_dinero_inicio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turno_id UUID NOT NULL REFERENCES public.turnos_caja(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('billete', 'moneda')),
  denominacion DECIMAL(10, 2) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de detalle de dinero en caja (fin)
CREATE TABLE IF NOT EXISTS public.detalle_dinero_fin (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turno_id UUID NOT NULL REFERENCES public.turnos_caja(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('billete', 'moneda')),
  denominacion DECIMAL(10, 2) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_turnos_caja_usuario ON public.turnos_caja(usuario_id);
CREATE INDEX IF NOT EXISTS idx_turnos_caja_estado ON public.turnos_caja(estado);
CREATE INDEX IF NOT EXISTS idx_turnos_caja_fecha ON public.turnos_caja(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_detalle_dinero_inicio_turno ON public.detalle_dinero_inicio(turno_id);
CREATE INDEX IF NOT EXISTS idx_detalle_dinero_fin_turno ON public.detalle_dinero_fin(turno_id);

-- Triggers para updated_at
CREATE TRIGGER update_turnos_caja_updated_at BEFORE UPDATE ON public.turnos_caja
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.turnos_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_dinero_inicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_dinero_fin ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own turnos" ON public.turnos_caja
  FOR SELECT USING (
    usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Users can insert own turnos" ON public.turnos_caja
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can update own turnos" ON public.turnos_caja
  FOR UPDATE USING (
    usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Users can view own detalle dinero inicio" ON public.detalle_dinero_inicio
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.turnos_caja 
      WHERE id = turno_id AND (
        usuario_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.usuarios 
          WHERE id = auth.uid() AND rol = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can insert own detalle dinero inicio" ON public.detalle_dinero_inicio
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.turnos_caja 
      WHERE id = turno_id AND usuario_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own detalle dinero fin" ON public.detalle_dinero_fin
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.turnos_caja 
      WHERE id = turno_id AND (
        usuario_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.usuarios 
          WHERE id = auth.uid() AND rol = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can insert own detalle dinero fin" ON public.detalle_dinero_fin
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.turnos_caja 
      WHERE id = turno_id AND usuario_id = auth.uid()
    )
  );
