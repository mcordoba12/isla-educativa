# 🔧 Guía de Setup de Supabase

Sigue estos pasos para configurar tu base de datos en Supabase.

## Paso 1: Crear Proyecto en Supabase

1. Ve a https://supabase.com
2. Haz clic en **"Start your project"**
3. Inicia sesión con Google, GitHub o email
4. Crea una nueva **Organization** (o usa una existente)
5. Crea un nuevo **Project**:
   - **Nombre**: `isla-educativa` (o el que prefieras)
   - **Database Password**: Crea una contraseña fuerte
   - **Region**: Elige la más cercana a tu ubicación
6. **Crea el proyecto** (tarda ~2 minutos)

## Paso 2: Obtener Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** (engranaje en la esquina inferior izquierda)
2. Click en **API**
3. Copia estos valores:
   - **Project URL** → Usaremos como `VITE_SUPABASE_URL`
   - **anon public** (bajo "Project API keys") → Usaremos como `VITE_SUPABASE_ANON_KEY`

Guarda estos valores en un lugar seguro.

## Paso 3: Crear Tablas y Schema

1. En Supabase, ve a **SQL Editor** (en el sidebar izquierdo)
2. Haz click en **"New Query"**
3. En el editor que se abre, **borra todo** que haya por defecto
4. **Abre el archivo `SCHEMA.sql`** que está en el proyecto
5. **Copia TODO el contenido**
6. **Pega en el editor SQL** de Supabase
7. Haz click en el botón **"Run"** (esquina superior derecha)

⏳ **Espera a que termine de ejecutarse** (verás un ✅ verde)

Si algo falla:
- Lee el mensaje de error
- Si hay un error de sintaxis, revisa que copiaste todo correctamente
- Si necesitas reintentar, puedes hacer click en **"Clear"** y pegar de nuevo

## Paso 4: Verificar Tablas Creadas

1. Ve a **Table Editor** (sidebar izquierdo)
2. Deberías ver estas tablas:
   - ✅ `users`
   - ✅ `teacher_students`
   - ✅ `classroom_sessions`
   - ✅ `session_questions`
   - ✅ `missions`
   - ✅ `student_missions`

Si ves todas, ¡el setup de BD está completo!

## Paso 5: Configurar Variables de Entorno Locales

1. En la carpeta del proyecto, crea un archivo `.env.local`
   ```bash
   # En terminal:
   cp .env.example .env.local
   ```

2. Abre `.env.local` y rellena con tus credenciales:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   VITE_ENV=development
   ```

   ⚠️ **Sustituye** `tu-proyecto` y `tu-anon-key-aqui` con tus valores reales

3. **Guarda el archivo**

## Paso 6: Instalar Dependencias

```bash
npm install
```

## Paso 7: Ejecutar Localmente

```bash
npm run dev
```

Abre http://localhost:3000 y deberías ver la app.

## Paso 8: Probar Registro

1. Haz clic en **"Regístrate aquí"**
2. Selecciona **"Docente"**
3. Completa el formulario:
   - Nombre: Tu nombre
   - Email: Un email de prueba
   - Contraseña: Al menos 6 caracteres
4. Haz clic en **"Crear cuenta"**

Si funciona, la tabla `users` en Supabase ahora debería tener tu registro. ✅

## Paso 9 (Futuro): Configurar en Render

Cuando quieras desplegar en Render:

1. Conecta tu repositorio GitHub a Render
2. En Render, agrega **Environment Variables**:
   ```
   VITE_SUPABASE_URL = <tu URL>
   VITE_SUPABASE_ANON_KEY = <tu anon key>
   ```
3. Render compilará automáticamente con `npm run build`

## 🔒 Seguridad

- ✅ **Anon Key**: Es PÚBLICA. Se envía al navegador. Solo acceso lectura a datos permitidos por RLS.
- ❌ **Service Role Key**: NUNCA la compartas ni la uses en frontend.
- ✅ El archivo `.env.local` está en `.gitignore` → No se sube a GitHub

## ✅ Checklist

- [ ] Proyecto creado en Supabase
- [ ] Credenciales copiadas
- [ ] SCHEMA.sql ejecutado en Supabase
- [ ] 6 tablas visibles en Table Editor
- [ ] `.env.local` creado con variables
- [ ] `npm install` completado
- [ ] `npm run dev` funciona
- [ ] Registro de prueba exitoso

Una vez completes todo esto, **FASE 1 está lista para comenzar**.

---

¿Necesitas ayuda? Revisa el README.md o contacta con soporte.
