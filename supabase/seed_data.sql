-- Datos de ejemplo para desarrollo y pruebas
-- Ejecuta este script después de crear el schema si quieres datos de prueba

-- Insertar categorías de ejemplo
INSERT INTO public.categorias (nombre, descripcion, activa) VALUES
('Herramientas', 'Herramientas manuales y eléctricas', true),
('Materiales de Construcción', 'Cemento, ladrillos, arena, etc.', true),
('Pinturas', 'Pinturas, barnices y accesorios', true),
('Fontanería', 'Tuberías, grifos y accesorios', true),
('Electricidad', 'Cables, interruptores y accesorios eléctricos', true),
('Ferretería General', 'Tornillos, clavos, bisagras, etc.', true);

-- Nota: Para insertar productos, usuarios y empresas de ejemplo,
-- necesitarás primero crear los registros relacionados (proveedores, usuarios, etc.)

-- Ejemplo de cómo insertar un proveedor:
-- INSERT INTO public.proveedores (nombre, contacto, telefono, email, activo) VALUES
-- ('Proveedor Ejemplo', 'Juan Pérez', '1234567890', 'proveedor@ejemplo.com', true);

-- Ejemplo de cómo insertar un producto (ajusta los IDs según tus datos):
-- INSERT INTO public.productos (
--   codigo_barras, nombre, descripcion, categoria_id, 
--   precio_unitario, precio_mayor, cantidad_minima_mayor,
--   stock, stock_minimo, unidad_medida, activo
-- ) VALUES (
--   '1234567890123', 'Martillo', 'Martillo de acero', 
--   (SELECT id FROM categorias WHERE nombre = 'Herramientas' LIMIT 1),
--   15.00, 12.00, 10, 50, 10, 'unidad', true
-- );

-- Ejemplo de cómo insertar una empresa:
-- INSERT INTO public.empresas (nombre, nit, contacto, telefono, email, activa) VALUES
-- ('Empresa Constructora S.A.', '123456789-0', 'María González', '0987654321', 'contacto@empresa.com', true);
