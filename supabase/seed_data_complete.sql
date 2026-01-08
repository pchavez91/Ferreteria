-- Script completo de datos de prueba para la ferretería
-- Ejecuta este script DESPUÉS de ejecutar schema.sql
-- Este script crea usuarios, categorías, proveedores, productos, empresas y transacciones

-- ============================================
-- USUARIOS DE PRUEBA (TRABAJADORES)
-- ============================================
-- Nota: Primero debes crear estos usuarios en Authentication > Users de Supabase
-- Luego actualiza los IDs en las siguientes inserciones

-- Usuario 1: Administrador
-- Email: admin@ferreteria.com
-- Password: Admin123!
-- ID: Reemplaza con el ID real del usuario creado en Supabase Auth

-- Usuario 2: Bodega
-- Email: bodega@ferreteria.com  
-- Password: Bodega123!
-- ID: Reemplaza con el ID real del usuario creado en Supabase Auth

-- Usuario 3: Caja
-- Email: caja@ferreteria.com
-- Password: Caja123!
-- ID: Reemplaza con el ID real del usuario creado en Supabase Auth

-- Usuario 4: Contabilidad
-- Email: contabilidad@ferreteria.com
-- Password: Conta123!
-- ID: Reemplaza con el ID real del usuario creado en Supabase Auth

-- Usuario 5: Bodega 2
-- Email: bodega2@ferreteria.com
-- Password: Bodega2123!
-- ID: Reemplaza con el ID real del usuario creado en Supabase Auth

-- Usuario 6: Caja 2
-- Email: caja2@ferreteria.com
-- Password: Caja2123!
-- ID: Reemplaza con el ID real del usuario creado en Supabase Auth

-- IMPORTANTE: Después de crear los usuarios en Supabase Auth, ejecuta esto:
-- Reemplaza los UUIDs con los IDs reales de tus usuarios

/*
INSERT INTO public.usuarios (id, email, nombre, rol, activo) VALUES
('UUID_ADMIN', 'admin@ferreteria.com', 'Carlos Administrador', 'admin', true),
('UUID_BODEGA', 'bodega@ferreteria.com', 'María González - Bodega', 'bodega', true),
('UUID_CAJA', 'caja@ferreteria.com', 'Juan Pérez - Caja', 'caja', true),
('UUID_CONTABILIDAD', 'contabilidad@ferreteria.com', 'Ana Martínez - Contabilidad', 'contabilidad', true),
('UUID_BODEGA2', 'bodega2@ferreteria.com', 'Pedro Ramírez - Bodega', 'bodega', true),
('UUID_CAJA2', 'caja2@ferreteria.com', 'Laura Sánchez - Caja', 'caja', true);
*/

-- ============================================
-- CATEGORÍAS
-- ============================================
INSERT INTO public.categorias (nombre, descripcion, activa) VALUES
('Herramientas Manuales', 'Martillos, destornilladores, alicates, etc.', true),
('Herramientas Eléctricas', 'Taladros, sierras eléctricas, pulidoras', true),
('Materiales de Construcción', 'Cemento, ladrillos, arena, grava', true),
('Pinturas y Barnices', 'Pinturas, barnices, disolventes', true),
('Fontanería', 'Tuberías, grifos, válvulas, accesorios', true),
('Electricidad', 'Cables, interruptores, enchufes, lámparas', true),
('Ferretería General', 'Tornillos, clavos, bisagras, cerraduras', true),
('Jardinería', 'Herramientas de jardín, mangueras, semillas', true),
('Seguridad', 'Candados, alarmas, extintores', true),
('Limpieza', 'Productos de limpieza y mantenimiento', true);

-- ============================================
-- PROVEEDORES
-- ============================================
INSERT INTO public.proveedores (nombre, contacto, telefono, email, direccion, activo) VALUES
('Distribuidora de Herramientas S.A.', 'Roberto Mendoza', '555-0101', 'ventas@herramientas-sa.com', 'Av. Industrial 123', true),
('Materiales Constructores Ltda.', 'Sofía Herrera', '555-0102', 'contacto@materiales-constructores.com', 'Calle Principal 456', true),
('Pinturas del Norte', 'Miguel Torres', '555-0103', 'info@pinturas-norte.com', 'Boulevard Norte 789', true),
('Fontanería y Más', 'Carmen López', '555-0104', 'ventas@fontaneria-ymas.com', 'Av. Sur 321', true),
('Electricidad Total', 'Diego Fernández', '555-0105', 'pedidos@electricidad-total.com', 'Calle Central 654', true),
('Ferretería Mayorista', 'Patricia Ruiz', '555-0106', 'compras@ferreteria-mayorista.com', 'Zona Industrial 987', true),
('Jardín y Hogar', 'Ricardo Morales', '555-0107', 'info@jardin-hogar.com', 'Av. Verde 147', true),
('Seguridad Industrial', 'Elena Vargas', '555-0108', 'ventas@seguridad-industrial.com', 'Polígono Industrial 258', true);

-- ============================================
-- PRODUCTOS (150 productos)
-- ============================================

-- Herramientas Manuales (20 productos)
INSERT INTO public.productos (codigo_barras, nombre, descripcion, categoria_id, precio_unitario, precio_mayor, cantidad_minima_mayor, stock, stock_minimo, unidad_medida, proveedor_id, activo) VALUES
('1000000000001', 'Martillo de Acero 500g', 'Martillo de acero forjado con mango de fibra de vidrio', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 25.00, 20.00, 10, 150, 20, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000002', 'Destornillador Phillips #2', 'Destornillador Phillips de acero cromado', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 8.50, 7.00, 12, 200, 30, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000003', 'Alicates Universales 8"', 'Alicates de corte y presión, 8 pulgadas', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 18.00, 15.00, 10, 120, 15, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000004', 'Llave Inglesa Ajustable 10"', 'Llave ajustable de acero inoxidable', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 22.00, 18.00, 8, 100, 15, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000005', 'Cinta Métrica 5m', 'Cinta métrica de acero, 5 metros', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 12.00, 10.00, 15, 180, 25, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000006', 'Nivel de Burbuja 60cm', 'Nivel de aluminio con 3 burbujas', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 35.00, 28.00, 6, 80, 10, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000007', 'Sierra de Mano 24"', 'Sierra de mano para madera, 24 pulgadas', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 28.00, 23.00, 8, 90, 12, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000008', 'Cincel de Acero 1"', 'Cincel de acero templado, 1 pulgada', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 15.00, 12.00, 10, 110, 15, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000009', 'Pala de Jardín', 'Pala de acero con mango de madera', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 45.00, 38.00, 5, 60, 8, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('1000000000010', 'Azadón de Acero', 'Azadón de acero forjado', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 38.00, 32.00, 6, 70, 10, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('1000000000011', 'Rastrillo de Jardín', 'Rastrillo de acero con 16 dientes', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 32.00, 27.00, 6, 75, 10, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('1000000000012', 'Mazo de Goma 2kg', 'Mazo de goma para trabajos delicados', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 42.00, 35.00, 5, 55, 8, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000013', 'Pinzas de Punta Fina', 'Pinzas de precisión para trabajos delicados', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 16.00, 13.00, 10, 130, 20, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000014', 'Llave Allen Set 9 Piezas', 'Juego de llaves allen métricas', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 30.00, 25.00, 8, 95, 12, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000015', 'Cuchillo de Albañil', 'Cuchillo de acero para albañilería', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 20.00, 16.00, 10, 105, 15, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000016', 'Espátula Flexible 4"', 'Espátula de acero flexible, 4 pulgadas', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 14.00, 11.00, 12, 140, 20, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000017', 'Formón de Carpintero 1/2"', 'Formón de acero templado', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 24.00, 20.00, 8, 85, 12, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000018', 'Tenazas de Carpintero', 'Tenazas para extraer clavos', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 26.00, 22.00, 8, 88, 12, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000019', 'Escuadra de Acero 30cm', 'Escuadra de acero inoxidable', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 19.00, 16.00, 10, 115, 15, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('1000000000020', 'Nivel Láser', 'Nivel láser de línea horizontal', (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1), 85.00, 72.00, 3, 40, 5, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true);

-- Herramientas Eléctricas (20 productos)
INSERT INTO public.productos (codigo_barras, nombre, descripcion, categoria_id, precio_unitario, precio_mayor, cantidad_minima_mayor, stock, stock_minimo, unidad_medida, proveedor_id, activo) VALUES
('2000000000001', 'Taladro Percutor 750W', 'Taladro percutor con cable, 750W', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 180.00, 150.00, 3, 45, 5, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000002', 'Taladro Inalámbrico 18V', 'Taladro inalámbrico con batería y cargador', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 250.00, 210.00, 2, 35, 4, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000003', 'Sierra Circular 1400W', 'Sierra circular de 7 1/4 pulgadas', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 320.00, 270.00, 2, 28, 3, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000004', 'Sierra Caladora 600W', 'Sierra caladora con velocidad variable', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 195.00, 165.00, 3, 38, 4, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000005', 'Pulidora Angular 4 1/2"', 'Pulidora angular de 4.5 pulgadas, 850W', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 220.00, 185.00, 3, 32, 4, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000006', 'Lijadora Orbital', 'Lijadora orbital de 5 pulgadas', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 175.00, 148.00, 3, 42, 5, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000007', 'Rotomartillo 1500W', 'Rotomartillo con función percutor', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 380.00, 320.00, 2, 25, 3, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000008', 'Atornillador Eléctrico', 'Atornillador eléctrico con regulador de torque', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 95.00, 80.00, 5, 60, 8, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000009', 'Soldadora Eléctrica 140A', 'Soldadora eléctrica para acero', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 450.00, 380.00, 2, 20, 3, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000010', 'Soplador de Hojas 600W', 'Soplador eléctrico para jardín', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 125.00, 105.00, 4, 50, 6, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('2000000000011', 'Cortadora de Césped Eléctrica', 'Cortadora de césped eléctrica 32cm', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 280.00, 235.00, 2, 30, 4, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('2000000000012', 'Multímetro Digital', 'Multímetro digital para electricistas', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 65.00, 55.00, 5, 55, 7, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('2000000000013', 'Detector de Tensión', 'Detector de tensión sin contacto', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 35.00, 30.00, 8, 75, 10, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('2000000000014', 'Fresadora 1200W', 'Fresadora de mano para madera', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 290.00, 245.00, 2, 26, 3, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000015', 'Cepillo Eléctrico', 'Cepillo eléctrico para madera', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 210.00, 178.00, 3, 34, 4, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000016', 'Grapadora Eléctrica', 'Grapadora eléctrica para construcción', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 155.00, 130.00, 4, 48, 6, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000017', 'Pistola de Calor 2000W', 'Pistola de calor para trabajos diversos', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 85.00, 72.00, 5, 58, 7, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000018', 'Dremel 3000', 'Herramienta rotativa multiuso', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 195.00, 165.00, 3, 40, 5, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000019', 'Compresor de Aire 50L', 'Compresor de aire portátil 50 litros', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 420.00, 355.00, 2, 22, 3, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true),
('2000000000020', 'Aspiradora Industrial 20L', 'Aspiradora industrial de 20 litros', (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1), 380.00, 320.00, 2, 24, 3, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Distribuidora de Herramientas S.A.' LIMIT 1), true);

-- Materiales de Construcción (25 productos)
INSERT INTO public.productos (codigo_barras, nombre, descripcion, categoria_id, precio_unitario, precio_mayor, cantidad_minima_mayor, stock, stock_minimo, unidad_medida, proveedor_id, activo) VALUES
('3000000000001', 'Cemento Portland 50kg', 'Bolsas de cemento Portland estándar', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 12.50, 10.50, 20, 500, 100, 'bolsa', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000002', 'Arena Fina m3', 'Arena fina para construcción, metro cúbico', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 45.00, 38.00, 5, 200, 30, 'm3', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000003', 'Grava 3/4" m3', 'Grava triturada 3/4 pulgada, metro cúbico', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 50.00, 42.00, 5, 180, 25, 'm3', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000004', 'Ladrillo Común', 'Ladrillo común de arcilla cocida', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 0.35, 0.28, 1000, 10000, 2000, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000005', 'Bloque de Concreto 15x20x40', 'Bloque de concreto estándar', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 1.20, 1.00, 500, 5000, 1000, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000006', 'Varilla #3 12m', 'Varilla de acero corrugado #3, 12 metros', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 8.50, 7.20, 50, 800, 150, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000007', 'Varilla #4 12m', 'Varilla de acero corrugado #4, 12 metros', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 13.00, 11.00, 50, 600, 100, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000008', 'Alambre de Amarre #16', 'Alambre de amarre para construcción, rollo 1kg', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 4.50, 3.80, 20, 300, 50, 'rollo', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000009', 'Malla Electrosoldada 6x6', 'Malla electrosoldada 6x6, 2.4x6m', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 85.00, 72.00, 5, 120, 20, 'plancha', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000010', 'Yeso para Construcción 25kg', 'Yeso en polvo para construcción', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 8.00, 6.80, 15, 400, 80, 'bolsa', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000011', 'Cal Hidratada 25kg', 'Cal hidratada para construcción', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 6.50, 5.50, 20, 350, 70, 'bolsa', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000012', 'Pegamento para Cerámica 20kg', 'Pegamento para cerámica y porcelanato', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 18.00, 15.30, 10, 250, 40, 'bolsa', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000013', 'Pegamento para Ladrillo 25kg', 'Pegamento para ladrillos y bloques', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 15.00, 12.75, 12, 280, 50, 'bolsa', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000014', 'Impermeabilizante 20L', 'Impermeabilizante acrílico, 20 litros', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 65.00, 55.25, 5, 150, 25, 'galon', (SELECT id FROM proveedores WHERE nombre = 'Pinturas del Norte' LIMIT 1), true),
('3000000000015', 'Pintura Base Agua 20L', 'Pintura base agua blanca, 20 litros', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 85.00, 72.25, 4, 180, 30, 'galon', (SELECT id FROM proveedores WHERE nombre = 'Pinturas del Norte' LIMIT 1), true),
('3000000000016', 'Pintura Base Agua 4L', 'Pintura base agua blanca, 4 litros', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 22.00, 18.70, 10, 320, 50, 'galon', (SELECT id FROM proveedores WHERE nombre = 'Pinturas del Norte' LIMIT 1), true),
('3000000000017', 'Pintura Esmalte 4L', 'Pintura esmalte sintético, 4 litros', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 35.00, 29.75, 8, 280, 40, 'galon', (SELECT id FROM proveedores WHERE nombre = 'Pinturas del Norte' LIMIT 1), true),
('3000000000018', 'Pintura Látex 4L', 'Pintura látex lavable, 4 litros', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 28.00, 23.80, 10, 300, 45, 'galon', (SELECT id FROM proveedores WHERE nombre = 'Pinturas del Norte' LIMIT 1), true),
('3000000000019', 'Barniz Poliuretano 4L', 'Barniz poliuretano transparente, 4 litros', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 42.00, 35.70, 6, 200, 30, 'galon', (SELECT id FROM proveedores WHERE nombre = 'Pinturas del Norte' LIMIT 1), true),
('3000000000020', 'Thinner 4L', 'Disolvente thinner, 4 litros', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 18.00, 15.30, 10, 350, 60, 'galon', (SELECT id FROM proveedores WHERE nombre = 'Pinturas del Norte' LIMIT 1), true),
('3000000000021', 'Aceite de Linaza 1L', 'Aceite de linaza para madera, 1 litro', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 12.00, 10.20, 12, 220, 35, 'litro', (SELECT id FROM proveedores WHERE nombre = 'Pinturas del Norte' LIMIT 1), true),
('3000000000022', 'Masilla para Madera 1kg', 'Masilla para rellenar madera, 1 kilogramo', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 8.50, 7.23, 15, 180, 30, 'kg', (SELECT id FROM proveedores WHERE nombre = 'Pinturas del Norte' LIMIT 1), true),
('3000000000023', 'Enduido 20kg', 'Enduido para paredes, 20 kilogramos', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 14.00, 11.90, 10, 260, 40, 'bolsa', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000024', 'Pegamento de Contacto 1L', 'Pegamento de contacto, 1 litro', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 15.00, 12.75, 12, 240, 40, 'litro', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true),
('3000000000025', 'Sellador Silicona Transparente', 'Sellador de silicona transparente', (SELECT id FROM categorias WHERE nombre = 'Materiales de Construcción' LIMIT 1), 6.00, 5.10, 20, 400, 60, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Materiales Constructores Ltda.' LIMIT 1), true);

-- Fontanería (20 productos)
INSERT INTO public.productos (codigo_barras, nombre, descripcion, categoria_id, precio_unitario, precio_mayor, cantidad_minima_mayor, stock, stock_minimo, unidad_medida, proveedor_id, activo) VALUES
('4000000000001', 'Tubería PVC 1/2" 6m', 'Tubería PVC presión, 1/2 pulgada, 6 metros', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 8.50, 7.23, 20, 300, 50, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000002', 'Tubería PVC 3/4" 6m', 'Tubería PVC presión, 3/4 pulgada, 6 metros', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 12.00, 10.20, 15, 250, 40, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000003', 'Tubería PVC 1" 6m', 'Tubería PVC presión, 1 pulgada, 6 metros', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 18.00, 15.30, 10, 200, 30, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000004', 'Codo PVC 1/2"', 'Codo PVC 90 grados, 1/2 pulgada', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 1.50, 1.28, 50, 500, 100, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000005', 'Tee PVC 1/2"', 'Tee PVC, 1/2 pulgada', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 2.00, 1.70, 40, 450, 80, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000006', 'Válvula de Compuerta 1/2"', 'Válvula de compuerta bronce, 1/2 pulgada', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 25.00, 21.25, 5, 120, 20, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000007', 'Válvula de Bola 1/2"', 'Válvula de bola bronce, 1/2 pulgada', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 18.00, 15.30, 8, 150, 25, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000008', 'Grifo Monomando Cocina', 'Grifo monomando para cocina', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 85.00, 72.25, 3, 60, 10, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000009', 'Grifo Monomando Baño', 'Grifo monomando para baño', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 75.00, 63.75, 3, 70, 12, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000010', 'Ducha Telefónica', 'Ducha telefónica con manguera', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 45.00, 38.25, 5, 90, 15, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000011', 'Inodoro Completo', 'Inodoro completo con tapa y asiento', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 280.00, 238.00, 2, 35, 5, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000012', 'Lavabo de Pared', 'Lavabo de pared cerámico', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 95.00, 80.75, 3, 55, 8, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000013', 'Sifón P 1 1/2"', 'Sifón P para lavabo, 1 1/2 pulgada', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 12.00, 10.20, 15, 180, 30, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000014', 'Manguera Flexible 1/2"', 'Manguera flexible para grifo, 1/2 pulgada', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 8.00, 6.80, 20, 250, 40, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000015', 'Cinta Teflón', 'Cinta de teflón para sellar roscas', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 2.50, 2.13, 30, 600, 100, 'rollo', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000016', 'Pegamento PVC 250ml', 'Pegamento para unir PVC, 250ml', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 6.00, 5.10, 20, 320, 50, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000017', 'Reducción PVC 1" a 1/2"', 'Reducción PVC, 1 pulgada a 1/2 pulgada', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 3.50, 2.98, 25, 380, 60, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000018', 'Tapón PVC 1/2"', 'Tapón roscado PVC, 1/2 pulgada', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 1.20, 1.02, 50, 500, 80, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000019', 'Unión PVC 1/2"', 'Unión roscada PVC, 1/2 pulgada', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 2.50, 2.13, 30, 420, 70, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true),
('4000000000020', 'Filtro de Agua', 'Filtro de agua para grifo', (SELECT id FROM categorias WHERE nombre = 'Fontanería' LIMIT 1), 35.00, 29.75, 8, 100, 15, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Fontanería y Más' LIMIT 1), true);

-- Electricidad (20 productos)
INSERT INTO public.productos (codigo_barras, nombre, descripcion, categoria_id, precio_unitario, precio_mayor, cantidad_minima_mayor, stock, stock_minimo, unidad_medida, proveedor_id, activo) VALUES
('5000000000001', 'Cable THWN #12 100m', 'Cable eléctrico THWN #12, 100 metros', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 85.00, 72.25, 5, 150, 25, 'rollo', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000002', 'Cable THWN #14 100m', 'Cable eléctrico THWN #14, 100 metros', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 65.00, 55.25, 6, 180, 30, 'rollo', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000003', 'Interruptor Simple', 'Interruptor simple de pared', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 8.50, 7.23, 20, 400, 60, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000004', 'Interruptor Doble', 'Interruptor doble de pared', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 12.00, 10.20, 15, 350, 50, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000005', 'Enchufe Simple', 'Enchufe simple de pared', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 6.00, 5.10, 25, 450, 70, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000006', 'Enchufe Doble', 'Enchufe doble de pared', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 9.50, 8.08, 20, 380, 60, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000007', 'Breaker 20A', 'Breaker termomagnético 20 amperios', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 15.00, 12.75, 10, 200, 30, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000008', 'Breaker 30A', 'Breaker termomagnético 30 amperios', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 18.00, 15.30, 8, 180, 25, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000009', 'Tablero Eléctrico 12 Circuitos', 'Tablero eléctrico para 12 circuitos', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 95.00, 80.75, 3, 80, 10, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000010', 'Lámpara LED 12W', 'Lámpara LED 12W equivalente a 60W', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 8.00, 6.80, 20, 500, 80, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000011', 'Lámpara LED 18W', 'Lámpara LED 18W equivalente a 100W', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 12.00, 10.20, 15, 450, 70, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000012', 'Tubo Conduit 1/2" 3m', 'Tubo conduit PVC, 1/2 pulgada, 3 metros', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 4.50, 3.83, 30, 600, 100, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000013', 'Caja Eléctrica 4x4', 'Caja eléctrica cuadrada 4x4 pulgadas', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 3.50, 2.98, 40, 700, 120, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000014', 'Caja Eléctrica Octagonal', 'Caja eléctrica octagonal', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 2.50, 2.13, 50, 800, 130, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000015', 'Cinta Aislante Negra', 'Cinta aislante negra, rollo', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 3.00, 2.55, 30, 500, 80, 'rollo', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000016', 'Portalámparas E27', 'Portalámparas roscado E27', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 4.00, 3.40, 25, 550, 90, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000017', 'Cable de Tierra #12 50m', 'Cable de tierra #12, 50 metros', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 45.00, 38.25, 8, 220, 35, 'rollo', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000018', 'Fusible 20A', 'Fusible de cartucho 20 amperios', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 2.50, 2.13, 40, 600, 100, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000019', 'Toma Corriente 20A', 'Toma de corriente 20 amperios', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 22.00, 18.70, 8, 150, 25, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true),
('5000000000020', 'Lámpara Fluorescente 36W', 'Lámpara fluorescente T8 36W', (SELECT id FROM categorias WHERE nombre = 'Electricidad' LIMIT 1), 15.00, 12.75, 10, 280, 45, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Electricidad Total' LIMIT 1), true);

-- Ferretería General (20 productos)
INSERT INTO public.productos (codigo_barras, nombre, descripcion, categoria_id, precio_unitario, precio_mayor, cantidad_minima_mayor, stock, stock_minimo, unidad_medida, proveedor_id, activo) VALUES
('6000000000001', 'Tornillo para Madera #8x2"', 'Tornillo para madera cabeza plana, caja 100 unidades', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 8.50, 7.23, 20, 400, 60, 'caja', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000002', 'Tornillo para Madera #10x3"', 'Tornillo para madera cabeza plana, caja 100 unidades', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 12.00, 10.20, 15, 350, 50, 'caja', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000003', 'Clavo Común 2" 1kg', 'Clavo común de acero, 2 pulgadas, 1 kilogramo', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 4.50, 3.83, 30, 600, 100, 'kg', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000004', 'Clavo Común 3" 1kg', 'Clavo común de acero, 3 pulgadas, 1 kilogramo', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 5.00, 4.25, 25, 550, 90, 'kg', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000005', 'Bisagra 3"', 'Bisagra de acero 3 pulgadas', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 3.50, 2.98, 40, 500, 80, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000006', 'Bisagra 4"', 'Bisagra de acero 4 pulgadas', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 4.50, 3.83, 30, 450, 70, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000007', 'Cerradura de Pomo', 'Cerradura de pomo para puerta interior', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 28.00, 23.80, 5, 180, 30, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000008', 'Cerradura de Llave', 'Cerradura de llave para puerta exterior', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 45.00, 38.25, 4, 150, 25, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000009', 'Candado de Seguridad', 'Candado de seguridad con llave', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 22.00, 18.70, 8, 200, 35, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Seguridad Industrial' LIMIT 1), true),
('6000000000010', 'Pernos Hexagonal 1/2"x4"', 'Perno hexagonal con tuerca, caja 20 unidades', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 15.00, 12.75, 10, 300, 50, 'caja', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000011', 'Tuerca Hexagonal 1/2"', 'Tuerca hexagonal, caja 50 unidades', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 8.00, 6.80, 20, 500, 80, 'caja', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000012', 'Arandela Plana 1/2"', 'Arandela plana, caja 100 unidades', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 6.00, 5.10, 25, 600, 100, 'caja', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000013', 'Gancho S para Colgar', 'Gancho S para colgar herramientas', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 1.50, 1.28, 50, 800, 130, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000014', 'Cable de Acero 1/8" 10m', 'Cable de acero 1/8 pulgada, 10 metros', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 18.00, 15.30, 8, 250, 40, 'rollo', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000015', 'Cadena de Acero 1/4" 5m', 'Cadena de acero 1/4 pulgada, 5 metros', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 25.00, 21.25, 5, 180, 30, 'rollo', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000016', 'Polea Simple', 'Polea simple de acero', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 12.00, 10.20, 15, 320, 50, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000017', 'Escuadra de Acero L', 'Escuadra de acero en L para construcción', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 8.50, 7.23, 20, 400, 60, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000018', 'Platina de Acero 1/4"', 'Platina de acero 1/4 pulgada, 1 metro', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 15.00, 12.75, 10, 280, 45, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000019', 'Ángulo de Acero 1"x1"', 'Ángulo de acero 1x1 pulgada, 1 metro', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 22.00, 18.70, 8, 220, 35, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true),
('6000000000020', 'Grillete 1/4"', 'Grillete de acero 1/4 pulgada', (SELECT id FROM categorias WHERE nombre = 'Ferretería General' LIMIT 1), 6.00, 5.10, 25, 450, 70, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Ferretería Mayorista' LIMIT 1), true);

-- Jardinería (15 productos)
INSERT INTO public.productos (codigo_barras, nombre, descripcion, categoria_id, precio_unitario, precio_mayor, cantidad_minima_mayor, stock, stock_minimo, unidad_medida, proveedor_id, activo) VALUES
('7000000000001', 'Manguera de Jardín 15m', 'Manguera de jardín 15 metros', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 35.00, 29.75, 5, 120, 20, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('7000000000002', 'Manguera de Jardín 25m', 'Manguera de jardín 25 metros', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 48.00, 40.80, 4, 100, 15, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('7000000000003', 'Regadera de Plástico 10L', 'Regadera de plástico 10 litros', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 18.00, 15.30, 8, 150, 25, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('7000000000004', 'Pulverizador Manual 2L', 'Pulverizador manual 2 litros', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 22.00, 18.70, 8, 130, 20, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('7000000000005', 'Tijeras de Podar', 'Tijeras de podar de acero', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 28.00, 23.80, 6, 110, 18, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('7000000000006', 'Guantes de Jardinería', 'Guantes de jardinería resistentes', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 12.00, 10.20, 12, 200, 30, 'par', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('7000000000007', 'Carretilla de Jardín', 'Carretilla de jardín metálica', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 85.00, 72.25, 3, 60, 10, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('7000000000008', 'Maceta Plástica 20cm', 'Maceta de plástico 20 centímetros', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 4.50, 3.83, 30, 400, 60, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('7000000000009', 'Maceta Plástica 30cm', 'Maceta de plástico 30 centímetros', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 8.00, 6.80, 20, 350, 50, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('7000000000010', 'Tierra Negra 20L', 'Tierra negra para plantas, 20 litros', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 12.00, 10.20, 15, 300, 50, 'bolsa', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('7000000000011', 'Abono Orgánico 5kg', 'Abono orgánico para plantas, 5 kilogramos', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 15.00, 12.75, 10, 250, 40, 'bolsa', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('7000000000012', 'Semillas de Tomate', 'Semillas de tomate, sobre 50 semillas', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 3.50, 2.98, 40, 500, 80, 'sobre', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('7000000000013', 'Semillas de Lechuga', 'Semillas de lechuga, sobre 100 semillas', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 2.50, 2.13, 50, 600, 100, 'sobre', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('7000000000014', 'Fertilizante 10-10-10 1kg', 'Fertilizante balanceado 10-10-10, 1 kilogramo', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 8.00, 6.80, 20, 320, 50, 'bolsa', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true),
('7000000000015', 'Rociador de Césped', 'Rociador de césped oscilante', (SELECT id FROM categorias WHERE nombre = 'Jardinería' LIMIT 1), 45.00, 38.25, 5, 90, 15, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Jardín y Hogar' LIMIT 1), true);

-- Seguridad (10 productos)
INSERT INTO public.productos (codigo_barras, nombre, descripcion, categoria_id, precio_unitario, precio_mayor, cantidad_minima_mayor, stock, stock_minimo, unidad_medida, proveedor_id, activo) VALUES
('8000000000001', 'Extintor ABC 5kg', 'Extintor ABC 5 kilogramos', (SELECT id FROM categorias WHERE nombre = 'Seguridad' LIMIT 1), 85.00, 72.25, 3, 80, 10, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Seguridad Industrial' LIMIT 1), true),
('8000000000002', 'Extintor ABC 10kg', 'Extintor ABC 10 kilogramos', (SELECT id FROM categorias WHERE nombre = 'Seguridad' LIMIT 1), 145.00, 123.25, 2, 50, 8, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Seguridad Industrial' LIMIT 1), true),
('8000000000003', 'Alarma de Humo', 'Alarma de humo con batería', (SELECT id FROM categorias WHERE nombre = 'Seguridad' LIMIT 1), 35.00, 29.75, 8, 120, 20, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Seguridad Industrial' LIMIT 1), true),
('8000000000004', 'Candado de Seguridad Alta', 'Candado de seguridad de alta resistencia', (SELECT id FROM categorias WHERE nombre = 'Seguridad' LIMIT 1), 45.00, 38.25, 5, 100, 15, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Seguridad Industrial' LIMIT 1), true),
('8000000000005', 'Casco de Seguridad', 'Casco de seguridad industrial', (SELECT id FROM categorias WHERE nombre = 'Seguridad' LIMIT 1), 28.00, 23.80, 6, 150, 25, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Seguridad Industrial' LIMIT 1), true),
('8000000000006', 'Chaleco Reflectante', 'Chaleco reflectante de seguridad', (SELECT id FROM categorias WHERE nombre = 'Seguridad' LIMIT 1), 18.00, 15.30, 10, 200, 30, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Seguridad Industrial' LIMIT 1), true),
('8000000000007', 'Gafas de Seguridad', 'Gafas de seguridad anti-impacto', (SELECT id FROM categorias WHERE nombre = 'Seguridad' LIMIT 1), 12.00, 10.20, 15, 250, 40, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Seguridad Industrial' LIMIT 1), true),
('8000000000008', 'Guantes de Seguridad', 'Guantes de seguridad resistentes', (SELECT id FROM categorias WHERE nombre = 'Seguridad' LIMIT 1), 15.00, 12.75, 12, 220, 35, 'par', (SELECT id FROM proveedores WHERE nombre = 'Seguridad Industrial' LIMIT 1), true),
('8000000000009', 'Botas de Seguridad', 'Botas de seguridad con punta de acero', (SELECT id FROM categorias WHERE nombre = 'Seguridad' LIMIT 1), 65.00, 55.25, 5, 90, 15, 'par', (SELECT id FROM proveedores WHERE nombre = 'Seguridad Industrial' LIMIT 1), true),
('8000000000010', 'Señal de Advertencia', 'Señal de advertencia reflectante', (SELECT id FROM categorias WHERE nombre = 'Seguridad' LIMIT 1), 8.00, 6.80, 20, 300, 50, 'unidad', (SELECT id FROM proveedores WHERE nombre = 'Seguridad Industrial' LIMIT 1), true);

-- ============================================
-- EMPRESAS
-- ============================================
INSERT INTO public.empresas (nombre, nit, direccion, telefono, email, contacto, activa) VALUES
('Constructora ABC S.A.', '123456789-0', 'Av. Principal 123', '555-1001', 'contacto@constructora-abc.com', 'Roberto Martínez', true),
('Inmobiliaria XYZ Ltda.', '234567890-1', 'Calle Comercial 456', '555-1002', 'info@inmobiliaria-xyz.com', 'María González', true),
('Arquitectura y Diseño S.A.', '345678901-2', 'Boulevard Norte 789', '555-1003', 'ventas@arquitectura-diseno.com', 'Carlos Ramírez', true),
('Contratista General S.A.', '456789012-3', 'Zona Industrial 321', '555-1004', 'compras@contratista-general.com', 'Ana López', true),
('Desarrollos Urbanos S.A.', '567890123-4', 'Av. Sur 654', '555-1005', 'contacto@desarrollos-urbanos.com', 'Pedro Sánchez', true),
('Construcciones del Valle', '678901234-5', 'Calle Central 987', '555-1006', 'info@construcciones-valle.com', 'Laura Fernández', true),
('Proyectos Inmobiliarios S.A.', '789012345-6', 'Av. Este 147', '555-1007', 'ventas@proyectos-inmob.com', 'Diego Torres', true),
('Ingeniería y Construcción', '890123456-7', 'Polígono Industrial 258', '555-1008', 'compras@ingenieria-construccion.com', 'Sofía Herrera', true);

-- ============================================
-- NOTA: Las transacciones (ventas, movimientos de bodega, pagos)
-- se crearán después de que insertes los usuarios reales
-- porque necesitan los IDs de usuario de Supabase Auth
-- ============================================
