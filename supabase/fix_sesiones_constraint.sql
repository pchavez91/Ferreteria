-- Script para corregir el constraint único en sesiones_usuarios
-- Ejecuta este script en Supabase SQL Editor

-- Primero, eliminar la tabla si existe sin constraint único
DROP TABLE IF EXISTS public.sesiones_usuarios CASCADE;

-- Recrear la tabla con constraint UNIQUE en usuario_id
CREATE TABLE public.sesiones_usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL UNIQUE REFERENCES public.usuarios(id) ON DELETE CASCADE,
  ultima_conexion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hora_conexion TIMESTAMP WITH TIME ZONE, -- Hora en que inició la sesión actual
  esta_activo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar consultas
CREATE INDEX idx_sesiones_usuario_id ON public.sesiones_usuarios(usuario_id);
CREATE INDEX idx_sesiones_esta_activo ON public.sesiones_usuarios(esta_activo);

-- Trigger para updated_at
CREATE TRIGGER update_sesiones_updated_at BEFORE UPDATE ON public.sesiones_usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.sesiones_usuarios ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuarios autenticados pueden leer todas las sesiones (para admin)
CREATE POLICY "Authenticated users can read sessions" ON public.sesiones_usuarios
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política RLS: usuarios pueden actualizar solo su propia sesión
CREATE POLICY "Users can update own session" ON public.sesiones_usuarios
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Política RLS: usuarios pueden insertar/upsert su propia sesión
CREATE POLICY "Users can insert own session" ON public.sesiones_usuarios
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can upsert own session" ON public.sesiones_usuarios
  FOR ALL USING (auth.uid() = usuario_id);
