-- Actualizar tabla ventas para agregar vendedor_id (aunque ya tiene usuario_id, esto permite diferenciar)
-- Si usuario_id es el vendedor, podemos duplicar o mantener ambos campos
-- Por ahora, agregaremos un campo vendedor_id que referencie al usuario que realizó la venta
-- (esto puede ser el mismo que usuario_id, pero permite flexibilidad futura)

ALTER TABLE public.ventas 
ADD COLUMN IF NOT EXISTS vendedor_id UUID REFERENCES public.usuarios(id);

-- Si vendedor_id es NULL, copiamos usuario_id
UPDATE public.ventas 
SET vendedor_id = usuario_id 
WHERE vendedor_id IS NULL;

-- Agregar tabla para tracking de sesiones de usuarios
CREATE TABLE IF NOT EXISTS public.sesiones_usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL UNIQUE REFERENCES public.usuarios(id) ON DELETE CASCADE,
  ultima_conexion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hora_conexion TIMESTAMP WITH TIME ZONE, -- Hora en que inició la sesión actual
  esta_activo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_id ON public.sesiones_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_esta_activo ON public.sesiones_usuarios(esta_activo);
