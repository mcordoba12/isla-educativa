# 📋 Isla Educativa — Come Dispersión
## Análisis Simplificado + Plan de Construcción

---

## 1. BASE DE DATOS SIMPLIFICADA

### Cambios respecto al análisis inicial:
- ❌ Eliminado: `opciones_respuesta`, `tipo_pregunta`, `respuesta_correcta` de preguntas
- ❌ Eliminado: fecha de vencimiento en misiones
- ❌ Eliminado: tabla de configuración del personaje
- ✅ Agregado: `retroalimentacion_exito` y `retroalimentacion_fallo` en misiones
- ✅ Simplificado: estructura de sesiones y respuestas
- ✅ Agregado: relación docente-estudiante simplificada

### Diagrama de tablas:

```
users (docentes y estudiantes)
    ├─ teacher_students (relación docente-estudiante)
    ├─ classroom_sessions (sesiones en vivo del docente)
    │   └─ session_questions (6 preguntas por sesión)
    └─ missions (misiones publicadas por docente)
        └─ student_missions (respuestas de estudiantes)
```

---

## 2. ESQUEMA SQL FINAL (Listo para Supabase)

### 2.1 Tabla: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('docente', 'estudiante')),
  nombre_completo VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rol ON users(rol);
```

---

### 2.2 Tabla: `teacher_students` (relación docente-estudiante)
```sql
CREATE TABLE teacher_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fecha_inscripcion TIMESTAMP DEFAULT NOW(),

  -- Garantizar que no haya duplicados
  UNIQUE(docente_id, estudiante_id),

  -- Validar que docente es docente y estudiante es estudiante
  CHECK (docente_id != estudiante_id)
);

CREATE INDEX idx_teacher_students_docente ON teacher_students(docente_id);
CREATE INDEX idx_teacher_students_estudiante ON teacher_students(estudiante_id);
```

---

### 2.3 Tabla: `classroom_sessions` (sesiones en vivo)
```sql
CREATE TABLE classroom_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,

  -- Estado: 'configurada', 'iniciada', 'pausada', 'finalizada'
  estado VARCHAR(50) NOT NULL DEFAULT 'configurada'
    CHECK (estado IN ('configurada', 'iniciada', 'pausada', 'finalizada')),

  -- Intervalo en minutos (5, 6 o 7)
  intervalo_minutos INTEGER NOT NULL CHECK (intervalo_minutos IN (5, 6, 7)),

  -- Progreso de presentación inicial (0, 1, 2, 3)
  momento_presentacion INTEGER DEFAULT 0 CHECK (momento_presentacion BETWEEN 0 AND 3),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

CREATE INDEX idx_sessions_docente ON classroom_sessions(docente_id);
CREATE INDEX idx_sessions_estado ON classroom_sessions(estado);
```

---

### 2.4 Tabla: `session_questions` (preguntas de sesión)
```sql
CREATE TABLE session_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES classroom_sessions(id) ON DELETE CASCADE,

  -- Orden de aparición (1-6)
  numero_orden INTEGER NOT NULL CHECK (numero_orden BETWEEN 1 AND 6),

  -- Contenido de la pregunta
  texto_pregunta TEXT NOT NULL,

  -- Respuesta dada por docente (correcto/incorrecto/null si no respondida)
  respuesta_docente VARCHAR(50) CHECK (respuesta_docente IN ('correcto', 'incorrecto', NULL)),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Garantizar máximo 6 preguntas por sesión
  UNIQUE(session_id, numero_orden)
);

CREATE INDEX idx_session_questions_session ON session_questions(session_id);
```

---

### 2.5 Tabla: `missions` (misiones publicadas)
```sql
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Contenido de la misión
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  texto_reto TEXT NOT NULL,

  -- Retroalimentación automática (fija)
  retroalimentacion_exito TEXT NOT NULL,
  retroalimentacion_fallo TEXT NOT NULL,

  -- Estado: 'activa' o 'archivada'
  estado VARCHAR(50) NOT NULL DEFAULT 'activa'
    CHECK (estado IN ('activa', 'archivada')),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_missions_docente ON missions(docente_id);
CREATE INDEX idx_missions_estado ON missions(estado);
```

---

### 2.6 Tabla: `student_missions` (respuestas de estudiantes)
```sql
CREATE TABLE student_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mision_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,

  -- Estado: 'pendiente' o 'completada'
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'completada')),

  -- Respuesta del estudiante
  respuesta_estudiante TEXT,

  -- Si fue correcta (NULL mientras esté pendiente, TRUE/FALSE cuando completada)
  es_correcta BOOLEAN,

  -- Mensaje de retroalimentación mostrado al estudiante
  retroalimentacion TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  fecha_completacion TIMESTAMP,

  -- Garantizar un solo intento por estudiante por misión
  UNIQUE(estudiante_id, mision_id)
);

CREATE INDEX idx_student_missions_estudiante ON student_missions(estudiante_id);
CREATE INDEX idx_student_missions_mision ON student_missions(mision_id);
CREATE INDEX idx_student_missions_estado ON student_missions(estado);
```

---

## 3. POLÍTICAS DE SEGURIDAD (RLS en Supabase)

```sql
-- RLS en tabla users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

-- RLS en classroom_sessions
ALTER TABLE classroom_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only teacher can see their sessions"
  ON classroom_sessions FOR SELECT
  USING (auth.uid()::text = docente_id::text);

-- RLS en missions
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher can see their missions"
  ON missions FOR SELECT
  USING (auth.uid()::text = docente_id::text);

CREATE POLICY "Student can see missions from their teachers"
  ON missions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM teacher_students
    WHERE teacher_students.docente_id = missions.docente_id
      AND teacher_students.estudiante_id = auth.uid()::uuid
  ));

-- RLS en student_missions
ALTER TABLE student_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student can see their own missions"
  ON student_missions FOR SELECT
  USING (auth.uid()::text = estudiante_id::text);
```

---

## 4. PLAN DE CONSTRUCCIÓN PASO A PASO

### **FASE 0: Setup Inicial**
1. ✅ Crear proyecto React con Vite
2. ✅ Instalar dependencias: Tailwind CSS, Supabase client
3. ✅ Configurar Supabase (proyecto, API keys)
4. ✅ Crear el SQL en Supabase (copiar script arriba)
5. ✅ Configurar RLS y permisos

---

### **FASE 1: Autenticación (Semana 1)**
**Objetivo:** Que docentes y estudiantes puedan registrarse e inicia sesión

**Orden de construcción:**
1. Crear `src/services/supabaseClient.js` (configuración)
2. Crear hook `useAuth.js` (lógica login/registro)
3. Crear `AuthContext.jsx` (estado global de auth)
4. Crear componente `RegisterPage.jsx` (formulario registro)
   - Selector de rol (docente/estudiante)
   - Si es estudiante: dropdown para seleccionar docente
   - Validación de email
5. Crear componente `LoginPage.jsx` (formulario login)
6. Crear componente `ProtectedRoute.jsx` (rutas privadas)
7. Crear `App.jsx` con routing principal
8. **TESTEO:** Login como docente y estudiante

**Archivos generados:**
- `src/services/supabaseClient.js`
- `src/hooks/useAuth.js`
- `src/context/AuthContext.jsx`
- `src/components/Auth/RegisterPage.jsx`
- `src/components/Auth/LoginPage.jsx`
- `src/components/Auth/ProtectedRoute.jsx`
- `src/App.jsx`

---

### **FASE 2: Dashboard Docente (Semana 2)**
**Objetivo:** Docente puede crear y gestionar sesiones en vivo

**Orden de construcción:**
1. Crear `src/services/session.service.js` (CRUD de sesiones)
2. Crear hook `useSession.js` (lógica de sesiones)
3. Crear `SessionContext.jsx` (estado de sesión en vivo)
4. Crear componente `TeacherDashboard.jsx` (página principal)
5. Crear componente `SessionSetup.jsx`
   - Input: título de sesión
   - Selector: intervalo (5, 6, 7 minutos)
   - Contador: muestra que necesita 6 preguntas
6. Crear componente `QuestionManager.jsx`
   - 6 inputs de texto (preguntas abiertas)
   - Botón "Crear Sesión"
7. Crear componente `SessionList.jsx` (lista de sesiones recientes)
8. **TESTEO:** Crear una sesión con 6 preguntas

**Archivos generados:**
- `src/services/session.service.js`
- `src/hooks/useSession.js`
- `src/context/SessionContext.jsx`
- `src/pages/TeacherDashboard.jsx`
- `src/components/Teacher/SessionSetup.jsx`
- `src/components/Teacher/QuestionManager.jsx`
- `src/components/Teacher/SessionList.jsx`

---

### **FASE 3: Componente del Personaje (Semana 2-3)**
**Objetivo:** Renderizar el personaje "Come Dispersión" con animaciones

**Orden de construcción:**
1. Crear componente `ComesDispersion.jsx`
   - Renderizar como div con estilos (emoji o SVG simple)
   - Estados: visible/invisible
2. Crear `SpeechBubble.jsx` (diálogo del personaje)
   - Mostrar texto con animación de aparición
3. Crear `CharacterAnimation.jsx` (animaciones CSS)
   - Presentación inicial (4 momentos con clicks)
   - Celebración (correcto)
   - Desaparición (incorrecto)
4. Crear `src/styles/animations.css` (keyframes)
   - `@keyframes slideIn`, `fadeIn`, `bounce`, `slideOut`
5. **TESTEO:** Ver personaje aparecer y desaparecer

**Archivos generados:**
- `src/components/Character/ComesDispersion.jsx`
- `src/components/Character/SpeechBubble.jsx`
- `src/components/Character/CharacterAnimation.jsx`
- `src/styles/animations.css`

---

### **FASE 4: Sesión en Vivo - Presentación (Semana 3)**
**Objetivo:** Mostrar los 4 momentos de presentación del personaje

**Orden de construcción:**
1. Crear componente `LiveSession.jsx` (página de sesión en vivo)
   - Muestra sesión actual
   - Estado: presentación inicial
2. Crear componente `PresentationFlow.jsx`
   - Renderiza 4 diálogos diferentes
   - Cada click avanza al siguiente
   - Último click → pasa a esperar preguntas
3. Integrar `ComesDispersion` + `SpeechBubble` + animations
4. **TESTEO:** Ver los 4 momentos con clicks

**Archivos generados:**
- `src/pages/LiveSession.jsx`
- `src/components/Teacher/PresentationFlow.jsx`

---

### **FASE 5: Sesión en Vivo - Timer y Preguntas (Semana 4)**
**Objetivo:** Timer que dispara preguntas cada X minutos

**Orden de construcción:**
1. Crear `src/utils/timer.js` (lógica de conteo)
   - Función que dispara eventos cada X minutos
   - Sincronización con servidor
2. Crear hook `useSessionTimer.js` (integración con sesión)
3. Crear componente `TimerDisplay.jsx` (muestra el tiempo)
4. Crear componente `QuestionDisplay.jsx`
   - Muestra la pregunta actual
   - Renderiza el personaje hablando
5. Crear componente `ResponseHandler.jsx`
   - Dos botones: "✓ Correcto" y "✗ Incorrecto"
   - Docente hace click
   - Actualiza en BD
6. Integrar en `LiveSession.jsx`
   - Flujo: presentación → timer → pregunta → respuesta → siguiente
7. **TESTEO:** Timer dispara preguntas, docente responde

**Archivos generados:**
- `src/utils/timer.js`
- `src/hooks/useSessionTimer.js`
- `src/components/Teacher/TimerDisplay.jsx`
- `src/components/Teacher/QuestionDisplay.jsx`
- `src/components/Teacher/ResponseHandler.jsx`

---

### **FASE 6: Reacciones del Personaje (Semana 4)**
**Objetivo:** Personaje reacciona a correcto/incorrecto

**Orden de construcción:**
1. Crear componente `CharacterReaction.jsx`
   - Props: `reaction` ('correcto' | 'incorrecto')
   - Celebración con animación si es correcto
   - Desaparición con animación si es incorrecto
2. Agregar animaciones CSS:
   - `@keyframes celebrate` (saltos, rotaciones)
   - `@keyframes disappear` (fade out)
3. Integrar en `ResponseHandler.jsx`
   - Cuando docente elige opción → personalaje reacciona
   - Pausa 2 segundos → siguiente pregunta
4. **TESTEO:** Ver animaciones de reacción

**Archivos generados:**
- `src/components/Character/CharacterReaction.jsx`
- (Actualizar `src/styles/animations.css`)

---

### **FASE 7: Dashboard Estudiante - Visión General (Semana 5)**
**Objetivo:** Estudiante ve su lista de misiones

**Orden de construcción:**
1. Crear `src/services/mission.service.js` (CRUD de misiones)
2. Crear hook `useMissions.js` (obtener misiones)
3. Crear `StudentContext.jsx` (estado de misiones)
4. Crear componente `StudentIsland.jsx` (página principal)
   - Header con nombre estudiante
   - Lista de misiones del docente
5. Crear componente `IslandView.jsx`
   - Grid/lista visual de misiones
6. Crear componente `MissionCard.jsx`
   - Título, descripción, estado (pendiente/completada)
   - Click → ver detalles
7. **TESTEO:** Ver misiones publicadas por docente

**Archivos generados:**
- `src/services/mission.service.js`
- `src/hooks/useMissions.js`
- `src/context/StudentContext.jsx`
- `src/pages/StudentIsland.jsx`
- `src/components/Student/IslandView.jsx`
- `src/components/Student/MissionCard.jsx`

---

### **FASE 8: Dashboard Estudiante - Completar Misión (Semana 5-6)**
**Objetivo:** Estudiante responde el reto

**Orden de construcción:**
1. Crear componente `MissionDetail.jsx`
   - Muestra: descripción completa
   - Botón "Comenzar Reto"
2. Crear componente `ChallengeView.jsx`
   - Personaje presenta el reto
   - Input de texto libre (respuesta)
   - Botón "Enviar"
3. Crear componente `FeedbackModal.jsx`
   - Muestra: "✓ Misión lograda!" o "✗ Misión fallida"
   - Mensaje personalizado (del docente vía retroalimentacion_exito/fallo)
   - Personaje reacciona
   - Botón cerrar
4. Integrar flujo:
   - MissionCard → click → MissionDetail → click → ChallengeView → enviar → FeedbackModal
5. **TESTEO:** Responder una misión y ver retroalimentación

**Archivos generados:**
- `src/components/Student/MissionDetail.jsx`
- `src/components/Student/ChallengeView.jsx`
- `src/components/Student/FeedbackModal.jsx`

---

### **FASE 9: Publicar Misiones (Semana 6)**
**Objetivo:** Docente puede crear y publicar misiones

**Orden de construcción:**
1. Crear componente `MissionPublisher.jsx`
   - Input: título, descripción
   - Input: texto del reto
   - Input: retroalimentación si acierta
   - Input: retroalimentación si falla
   - Botón "Publicar"
2. Agregar en `TeacherDashboard.jsx`
   - Tab o sección para "Crear Misión"
3. Integrar `mission.service.js` para INSERT
4. **TESTEO:** Crear y publicar misión, verla en estudiante

**Archivos generados:**
- `src/components/Teacher/MissionPublisher.jsx`

---

### **FASE 10: Pulido y Testing (Semana 6-7)**
**Objetivo:** Mejorar UX, errores, edge cases

**Por hacer:**
1. Validación de formularios (campos requeridos, longitudes)
2. Manejo de errores (try/catch en servicios)
3. Loading states (spinners mientras carga)
4. Responsive design (móvil, tablet, desktop)
5. Accesibilidad (aria labels, alt text)
6. Performance (lazy loading, memoization)
7. **TESTEO E2E:** Flujos completos docente + estudiante

**Archivos por mejorar:**
- Todos los componentes (agregar validación, error handling)
- `src/components/Common/Loading.jsx` (crear)
- `src/utils/validators.js` (crear)
- `src/utils/formatters.js` (crear)

---

### **FASE 11 (Opcional): Realtime con Supabase (Semana 7+)**
**Objetivo:** Cambios en tiempo real (actualización de misiones, sesiones)

**Por hacer:**
1. Crear `useRealtimeSubscription.js` (escuchar cambios en BD)
2. Integrar WebSocket en `StudentContext`
3. Estudiante ve nueva misión en tiempo real cuando docente publica
4. **TESTEO:** Publicar misión en docente, verla aparecer en estudiante

**Archivos generados:**
- `src/hooks/useRealtimeSubscription.js`

---

## 5. ESTRUCTURA FINAL DE CARPETAS (Tras todas las fases)

```
src/
├── components/
│   ├── Common/
│   │   ├── Header.jsx
│   │   ├── Navigation.jsx
│   │   └── Loading.jsx
│   ├── Character/
│   │   ├── ComesDispersion.jsx
│   │   ├── SpeechBubble.jsx
│   │   ├── CharacterAnimation.jsx
│   │   └── CharacterReaction.jsx
│   ├── Auth/
│   │   ├── RegisterPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── ProtectedRoute.jsx
│   ├── Teacher/
│   │   ├── SessionSetup.jsx
│   │   ├── QuestionManager.jsx
│   │   ├── LiveSession.jsx
│   │   ├── PresentationFlow.jsx
│   │   ├── TimerDisplay.jsx
│   │   ├── QuestionDisplay.jsx
│   │   ├── ResponseHandler.jsx
│   │   ├── SessionList.jsx
│   │   └── MissionPublisher.jsx
│   └── Student/
│       ├── IslandView.jsx
│       ├── MissionCard.jsx
│       ├── MissionDetail.jsx
│       ├── ChallengeView.jsx
│       └── FeedbackModal.jsx
├── pages/
│   ├── TeacherDashboard.jsx
│   ├── StudentIsland.jsx
│   └── LiveSession.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useSession.js
│   ├── useMissions.js
│   ├── useSessionTimer.js
│   └── useRealtimeSubscription.js
├── context/
│   ├── AuthContext.jsx
│   ├── SessionContext.jsx
│   └── StudentContext.jsx
├── services/
│   ├── supabaseClient.js
│   ├── session.service.js
│   └── mission.service.js
├── styles/
│   ├── index.css
│   └── animations.css
├── utils/
│   ├── timer.js
│   ├── validators.js
│   └── formatters.js
├── assets/
│   └── (vacío por ahora - para Lottie/sonidos futuro)
├── App.jsx
└── main.jsx
```

---

## 6. CHECKLIST PRE-INICIO

Antes de comenzar con FASE 0:

- [ ] Crear proyecto Supabase en https://supabase.com
- [ ] Copiar el SQL (sección 2) en Supabase → SQL Editor
- [ ] Obtener `SUPABASE_URL` y `SUPABASE_ANON_KEY`
- [ ] Crear archivo `.env.local` con las keys
- [ ] Confirmar que estoy listo para empezar con FASE 0

---

## 7. RESUMEN EXECUTIVO

| Componente | Complejidad | Tiempo Est. | Crítico |
|-----------|------------|-----------|---------|
| Autenticación | ⭐ | 2-3 días | ✅ SÍ |
| Dashboard Docente | ⭐⭐ | 3-4 días | ✅ SÍ |
| Componente Personaje | ⭐ | 2 días | ✅ SÍ |
| Sesión en Vivo | ⭐⭐⭐ | 5-6 días | ✅ SÍ |
| Dashboard Estudiante | ⭐⭐ | 4-5 días | ✅ SÍ |
| Publicar Misiones | ⭐ | 2 días | ✅ SÍ |
| Pulido y Testing | ⭐⭐ | 3-4 días | ⭐ IMPORTANTE |
| Realtime (Opcional) | ⭐⭐ | 2-3 días | ❌ NO (v2) |

**Tiempo total MVP: 4-5 semanas**

---

## 8. PRÓXIMO PASO

**¿Empezamos con FASE 0?** Necesito que:

1. Confirmes que el SQL está claro
2. Me digas si prefieres que genere el SQL en un archivo `.sql` separado para copiar/pegar fácil
3. Confirmemos el stack: **React + Vite + Tailwind + Supabase**
4. ¿Quieres que empecemos a codificar la FASE 1 o necesitas aclaraciones?

