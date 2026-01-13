-- Datos de prueba para empleados y contratos

-- Empleados activos
INSERT INTO public.empleados (nombre_completo, rut, direccion, telefono, email, fecha_nacimiento, fecha_ingreso, activo, cargo) VALUES
('María González Pérez', '12.345.678-9', 'Av. Principal 123, Santiago', '+56 9 1234 5678', 'maria.gonzalez@ferreteria.com', '1990-05-15', '2022-01-10', true, 'Encargada de Bodega'),
('Juan Pérez Martínez', '13.456.789-0', 'Calle Los Robles 456, Santiago', '+56 9 2345 6789', 'juan.perez@ferreteria.com', '1988-03-20', '2022-02-01', true, 'Cajero'),
('Ana Martínez López', '14.567.890-1', 'Pasaje Las Flores 789, Santiago', '+56 9 3456 7890', 'ana.martinez@ferreteria.com', '1992-07-10', '2021-11-15', true, 'Contadora'),
('Pedro Ramírez Silva', '15.678.901-2', 'Av. Libertador 321, Santiago', '+56 9 4567 8901', 'pedro.ramirez@ferreteria.com', '1985-09-25', '2023-03-01', true, 'Bodeguero');

-- Empleado inactivo (historial)
INSERT INTO public.empleados (nombre_completo, rut, direccion, telefono, email, fecha_nacimiento, fecha_ingreso, fecha_termino, activo, cargo, observaciones) VALUES
('Carlos Sánchez Torres', '16.789.012-3', 'Calle Los Pinos 654, Santiago', '+56 9 5678 9012', 'carlos.sanchez@example.com', '1987-12-05', '2021-06-01', '2023-12-31', false, 'Vendedor', 'Renuncia voluntaria');

-- Contratos para empleados activos
INSERT INTO public.contratos (empleado_id, tipo_contrato, fecha_inicio, fecha_termino, sueldo_base, cargo, jornada, descripcion, estado) 
SELECT 
  e.id,
  'indefinido',
  e.fecha_ingreso,
  NULL,
  850000,
  e.cargo,
  'completa',
  'Contrato indefinido',
  'activo'
FROM public.empleados e
WHERE e.nombre_completo = 'María González Pérez';

INSERT INTO public.contratos (empleado_id, tipo_contrato, fecha_inicio, fecha_termino, sueldo_base, cargo, jornada, descripcion, estado) 
SELECT 
  e.id,
  'indefinido',
  e.fecha_ingreso,
  NULL,
  750000,
  e.cargo,
  'completa',
  'Contrato indefinido',
  'activo'
FROM public.empleados e
WHERE e.nombre_completo = 'Juan Pérez Martínez';

INSERT INTO public.contratos (empleado_id, tipo_contrato, fecha_inicio, fecha_termino, sueldo_base, cargo, jornada, descripcion, estado) 
SELECT 
  e.id,
  'indefinido',
  e.fecha_ingreso,
  NULL,
  950000,
  e.cargo,
  'completa',
  'Contrato indefinido',
  'activo'
FROM public.empleados e
WHERE e.nombre_completo = 'Ana Martínez López';

INSERT INTO public.contratos (empleado_id, tipo_contrato, fecha_inicio, fecha_termino, sueldo_base, cargo, jornada, descripcion, estado) 
SELECT 
  e.id,
  'plazo_fijo',
  e.fecha_ingreso,
  e.fecha_ingreso + INTERVAL '1 year',
  700000,
  e.cargo,
  'completa',
  'Contrato a plazo fijo de 1 año',
  'activo'
FROM public.empleados e
WHERE e.nombre_completo = 'Pedro Ramírez Silva';

-- Contrato finalizado (historial)
INSERT INTO public.contratos (empleado_id, tipo_contrato, fecha_inicio, fecha_termino, sueldo_base, cargo, jornada, descripcion, estado) 
SELECT 
  e.id,
  'plazo_fijo',
  e.fecha_ingreso,
  e.fecha_termino,
  650000,
  e.cargo,
  'completa',
  'Contrato a plazo fijo finalizado',
  'finalizado'
FROM public.empleados e
WHERE e.nombre_completo = 'Carlos Sánchez Torres';
