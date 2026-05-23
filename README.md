# 🏝️ Isla Educativa — Come Dispersión

Plataforma educativa gamificada con React + Supabase.

## 📋 Requisitos Previos

- Node.js 18.x o superior
- npm o yarn
- Cuenta en Supabase (https://supabase.com)

## 🚀 Instalación y Setup

### 1. Clonar/Descargar el repositorio

```bash
cd Comegalletas-ProyectoPedagogico
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

#### Paso A: Crear proyecto en Supabase
1. Ve a https://supabase.com
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Copia las credenciales:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `Anon Public Key` → `VITE_SUPABASE_ANON_KEY`

#### Paso B: Crear tablas en Supabase
1. En Supabase, ve a **SQL Editor**
2. Abre un nuevo query
3. Copia todo el contenido de `SCHEMA.sql`
4. Pega en el editor y ejecuta

#### Paso C: Configurar variables de entorno locales
1. Copia el archivo `.env.example` a `.env.local`
   ```bash
   cp .env.example .env.local
   ```
2. Edita `.env.local` con tus credenciales:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   VITE_ENV=development
   ```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La app estará disponible en: **http://localhost:3000**

## 🛠️ Comandos Disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Previsualizar build de producción
```

## 📦 Build para Producción

```bash
npm run build
```

Genera una carpeta `dist/` lista para desplegar en Render o cualquier servidor estático.

## 🌐 Despliegue en Render

### Opción A: Conectar con GitHub (Recomendado)

1. Pushea tu código a un repositorio GitHub
2. Ve a https://render.com
3. Crear nuevo sitio web estático
4. Selecciona tu repositorio
5. Configura las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy automático en cada push a main

### Opción B: Despliegue Manual

1. Compila localmente: `npm run build`
2. Carga la carpeta `dist/` en Render como sitio estático

## 🔑 Variables de Entorno (Render)

En la configuración del proyecto en Render, agrega estas variables:

```
VITE_SUPABASE_URL = https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY = tu-anon-key-aqui
```

⚠️ **Importante:** Nunca commitees `.env.local` a git (está en `.gitignore`)

## 📁 Estructura del Proyecto

```
src/
├── components/        # Componentes React
│   ├── Auth/         # Login, Register, ProtectedRoute
│   ├── Teacher/      # (FASE 2+) Dashboard docente
│   ├── Student/      # (FASE 7+) Dashboard estudiante
│   └── Character/    # (FASE 3+) Personaje Come Dispersión
├── context/          # Context API
│   └── AuthContext
├── hooks/            # Custom hooks
│   └── useAuth
├── services/         # Servicios (Supabase)
│   └── supabaseClient
├── styles/           # CSS y animaciones
│   ├── index.css
│   └── animations.css
├── App.jsx          # Routing principal
└── main.jsx         # Punto de entrada
```

## 🔐 Autenticación

El sistema usa **Supabase Auth** con email y contraseña:

- **Registro**: Estudiantes y docentes se pueden registrar
- **Login**: Email + contraseña
- **RLS (Row Level Security)**: Datos protegidos por rol

## 📱 Uso Básico

### Registrarse como Estudiante
1. Abre la app
2. Click en "Regístrate aquí"
3. Selecciona "Estudiante"
4. Elige tu docente de la lista
5. Completa el formulario

### Registrarse como Docente
1. Abre la app
2. Click en "Regístrate aquí"
3. Selecciona "Docente"
4. Completa el formulario
5. ¡Listo! Puedes crear sesiones y misiones

## ⚡ Fases de Desarrollo

- ✅ **FASE 0**: Setup inicial (React + Vite + Tailwind + Supabase)
- 🔄 **FASE 1**: Autenticación completa
- 🔄 **FASE 2**: Dashboard docente
- 🔄 **FASE 3**: Componente del personaje
- 🔄 **FASE 4-6**: Sesión en vivo
- 🔄 **FASE 7-9**: Dashboard estudiante
- 🔄 **FASE 10-11**: Pulido y realtime

## 📚 Documentación

- **PROYECTO_ANALISIS.md** - Análisis completo del proyecto
- **SCHEMA.sql** - Estructura de base de datos

## 🆘 Troubleshooting

### Error: "Faltan variables de entorno"
- Verifica que `.env.local` existe y tiene las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

### Error: "Table 'users' doesn't exist"
- El SQL en `SCHEMA.sql` no se ejecutó en Supabase
- Copia el contenido de `SCHEMA.sql` → SQL Editor de Supabase → Ejecuta

### El login no funciona
- Verifica que las credenciales en `.env.local` son correctas
- Comprueba que el trigger en BD está activo (ejecutó correctamente el SCHEMA.sql)

## 📞 Soporte

Para dudas o problemas, revisa:
- `PROYECTO_ANALISIS.md` para arquitectura
- Documentación de Supabase: https://supabase.com/docs
- Documentación de React: https://react.dev

---

**Hecho con ❤️ para la educación**
