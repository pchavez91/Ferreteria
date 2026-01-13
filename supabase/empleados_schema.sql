-- Tabla de empleados
CREATE TABLE IF NOT EXISTS public.empleados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_completo TEXT NOT NULL,
  rut TEXT NOT NULL UNIQUE,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  fecha_nacimiento DATE,
  fecha_ingreso DATE NOT NULL,
  fecha_termino DATE,
  activo BOOLEAN DEFAULT true,
  cargo TEXT,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de contratos
CREATE TABLE IF NOT EXISTS public.contratos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empleado_id UUID NOT NULL REFERENCES public.empleados(id) ON DELETE CASCADE,
  tipo_contrato TEXT NOT NULL CHECK (tipo_contrato IN ('indefinido', 'plazo_fijo', 'honorarios', 'temporal')),
  fecha_inicio DATE NOT NULL,
  fecha_termino DATE,
  sueldo_base DECIMAL(10, 2) NOT NULL,
  cargo TEXT NOT NULL,
  jornada TEXT CHECK (jornada IN ('completa', 'parcial', 'media')),
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'finalizado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_empleados_rut ON public.empleados(rut);
CREATE INDEX IF NOT EXISTS idx_empleados_activo ON public.empleados(activo);
CREATE INDEX IF NOT EXISTS idx_contratos_empleado ON public.contratos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_contratos_estado ON public.contratos(estado);

-- Triggers para updated_at
CREATE TRIGGER update_empleados_updated_at BEFORE UPDATE ON public.empleados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Solo administradores pueden ver y modificar
CREATE POLICY "Admin can view empleados" ON public.empleados
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Admin can insert empleados" ON public.empleados
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Admin can update empleados" ON public.empleados
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Admin can delete empleados" ON public.empleados
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Admin can view contratos" ON public.contratos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Admin can insert contratos" ON public.contratos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Admin can update contratos" ON public.contratos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Admin can delete contratos" ON public.contratos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
