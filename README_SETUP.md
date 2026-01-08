# Guía de Configuración Detallada

## Paso 1: Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta (gratuita)
2. Crea un nuevo proyecto
3. Espera a que se complete la configuración (puede tomar unos minutos)

## Paso 2: Configurar la Base de Datos

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase/schema.sql` de este proyecto
3. Copia todo el contenido y pégalo en el SQL Editor
4. Haz clic en **Run** para ejecutar el script
5. Verifica que todas las tablas se hayan creado correctamente

## Paso 3: Configurar Autenticación

1. Ve a **Authentication > Settings** en Supabase
2. Asegúrate de que **Email** esté habilitado como método de autenticación
3. Opcionalmente, configura otros métodos si los necesitas

## Paso 4: Crear el Primer Usuario Administrador

### Opción A: Desde la interfaz de Supabase

1. Ve a **Authentication > Users**
2. Haz clic en **Add user** > **Create new user**
3. Ingresa un email y contraseña
4. Copia el **User UID** que se genera
5. Ve a **SQL Editor** y ejecuta:

```sql
INSERT INTO public.usuarios (id, email, nombre, rol, activo)
VALUES (
  'PEGA_AQUI_EL_USER_UID',
  'tu-email@ejemplo.com',
  'Administrador',
  'admin',
  true
);
```

### Opción B: Desde la aplicación (después del primer deploy)

1. Crea un usuario desde la interfaz de Supabase (Authentication > Users)
2. Luego actualiza su rol manualmente desde SQL Editor

## Paso 5: Configurar Variables de Entorno

1. En tu proyecto de Supabase, ve a **Settings > API**
2. Copia:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

3. Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## Paso 6: Configurar Políticas RLS (Row Level Security)

Las políticas básicas están en el schema.sql, pero puedes ajustarlas según tus necesidades:

1. Ve a **Authentication > Policies** en Supabase
2. Revisa y ajusta las políticas según tus necesidades de seguridad

### Políticas Recomendadas para Producción:

```sql
-- Permitir a usuarios autenticados leer productos activos
CREATE POLICY "Authenticated users can read products" ON public.productos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admin puede modificar productos
CREATE POLICY "Only admin can modify products" ON public.productos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
```

## Paso 7: Deployment en Vercel

1. **Preparar el código:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Subir a GitHub:**
   - Crea un repositorio en GitHub
   - Conecta tu repositorio local:
   ```bash
   git remote add origin https://github.com/tu-usuario/tu-repo.git
   git push -u origin main
   ```

3. **Conectar con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub
   - Haz clic en **Add New Project**
   - Selecciona tu repositorio
   - Vercel detectará automáticamente Next.js

4. **Configurar Variables de Entorno en Vercel:**
   - En la configuración del proyecto, ve a **Environment Variables**
   - Agrega:
     - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key de Supabase
   - Selecciona **Production, Preview, Development** para ambas

5. **Deploy:**
   - Haz clic en **Deploy**
   - Espera a que se complete el build
   - Tu aplicación estará disponible en `tu-proyecto.vercel.app`

## Paso 8: Configurar Dominio Personalizado (Opcional)

1. En Vercel, ve a **Settings > Domains**
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar los DNS

## Verificación Post-Deployment

1. Accede a tu aplicación en Vercel
2. Intenta iniciar sesión con el usuario administrador creado
3. Verifica que puedas:
   - Ver el dashboard
   - Crear productos
   - Realizar ventas
   - Gestionar usuarios

## Solución de Problemas Comunes

### Error: "Missing Supabase environment variables"
- Verifica que las variables estén configuradas en Vercel
- Asegúrate de que los nombres sean exactos (case-sensitive)

### Error: "relation does not exist"
- Verifica que hayas ejecutado el schema.sql completo
- Revisa que todas las tablas se hayan creado

### Error: "new row violates row-level security policy"
- Revisa las políticas RLS en Supabase
- Asegúrate de que el usuario tenga los permisos necesarios

### No puedo iniciar sesión
- Verifica que el usuario exista en la tabla `usuarios`
- Asegúrate de que el email y contraseña sean correctos
- Revisa los logs de Supabase para ver errores de autenticación

## Próximos Pasos

1. Personaliza los colores y estilos según tu marca
2. Agrega más validaciones según tus necesidades
3. Configura backups automáticos en Supabase
4. Agrega más funcionalidades según requieras
