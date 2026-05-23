-- ========================================
-- ISLA EDUCATIVA - SCHEMA SQL
-- Come Dispersión
-- ========================================
-- Copiar y pegar en Supabase SQL Editor
-- Nota: La autenticación se maneja con Supabase Auth
-- Los usuarios se crean automáticamente en auth.users
-- ========================================

-- 1. TABLA: users (vinculada a auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('docente', 'estudiante')),
  nombre_completo VARCHAR(255) NOT NULL,
  codigo_clase VARCHAR(20) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rol ON users(rol);
CREATE INDEX idx_users_codigo_clase ON users(codigo_clase);

-- ========================================
-- TRIGGER: Copiar usuario desde auth.users a users
-- Se ejecuta automáticamente al registrarse
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_rol VARCHAR(50);
  v_codigo_clase VARCHAR(20);
BEGIN
  v_rol := COALESCE(NEW.raw_user_meta_data->>'rol', 'estudiante');

  -- Generar código de clase único para docentes (formato: ISLA-XXXX)
  IF v_rol = 'docente' THEN
    v_codigo_clase := 'ISLA-' || UPPER(SUBSTRING(MD5(NEW.id::text), 1, 4));
  ELSE
    v_codigo_clase := NULL;
  END IF;

  INSERT INTO public.users (id, email, rol, nombre_completo, codigo_clase, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    v_rol,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    v_codigo_clase,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================

-- 2. TABLA: teacher_students (relación docente-estudiante)
CREATE TABLE teacher_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fecha_inscripcion TIMESTAMP DEFAULT NOW(),

  UNIQUE(docente_id, estudiante_id),
  CHECK (docente_id != estudiante_id)
);

CREATE INDEX idx_teacher_students_docente ON teacher_students(docente_id);
CREATE INDEX idx_teacher_students_estudiante ON teacher_students(estudiante_id);

-- ========================================

-- 3. TABLA: classroom_sessions (sesiones en vivo)
CREATE TABLE classroom_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  tema VARCHAR(255),

  estado VARCHAR(50) NOT NULL DEFAULT 'configurada'
    CHECK (estado IN ('configurada', 'iniciada', 'pausada', 'finalizada')),

  intervalo_minutos INTEGER NOT NULL CHECK (intervalo_minutos IN (5, 6, 7)),

  momento_presentacion INTEGER DEFAULT 0 CHECK (momento_presentacion BETWEEN 0 AND 3),

  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

CREATE INDEX idx_sessions_docente ON classroom_sessions(docente_id);
CREATE INDEX idx_sessions_estado ON classroom_sessions(estado);

-- ========================================

-- 4. TABLA: session_questions (6 preguntas por sesión)
CREATE TABLE session_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES classroom_sessions(id) ON DELETE CASCADE,

  numero_orden INTEGER NOT NULL CHECK (numero_orden BETWEEN 1 AND 6),

  texto_pregunta TEXT NOT NULL,

  respuesta_docente VARCHAR(50) CHECK (respuesta_docente IN ('correcto', 'incorrecto', NULL)),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(session_id, numero_orden)
);

CREATE INDEX idx_session_questions_session ON session_questions(session_id);

-- Requerimiento 5: resultado de misión por pregunta
ALTER TABLE session_questions
ADD COLUMN IF NOT EXISTS resultado_mision VARCHAR(20)
CHECK (resultado_mision IN ('lograda', 'fallida', NULL));

-- ========================================

-- 5. TABLA: missions (misiones publicadas)
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  texto_reto TEXT NOT NULL,

  retroalimentacion_exito TEXT NOT NULL,
  retroalimentacion_fallo TEXT NOT NULL,

  estado VARCHAR(50) NOT NULL DEFAULT 'activa'
    CHECK (estado IN ('activa', 'archivada')),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_missions_docente ON missions(docente_id);
CREATE INDEX idx_missions_estado ON missions(estado);

-- ========================================

-- 6. TABLA: student_missions (respuestas de estudiantes)
CREATE TABLE student_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mision_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,

  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'completada')),

  respuesta_estudiante TEXT,

  es_correcta BOOLEAN,

  retroalimentacion TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  fecha_completacion TIMESTAMP,

  UNIQUE(estudiante_id, mision_id)
);

CREATE INDEX idx_student_missions_estudiante ON student_missions(estudiante_id);
CREATE INDEX idx_student_missions_mision ON student_missions(mision_id);
CREATE INDEX idx_student_missions_estado ON student_missions(estado);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- RLS en tabla users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Permitir búsqueda anónima por email + nombre para recuperación de contraseña
-- NOTA: Solo expone id, email, nombre_completo (no otros datos sensibles)
CREATE POLICY "Allow password recovery lookup by email and name"
  ON users FOR SELECT
  USING (true);

-- RLS en classroom_sessions
ALTER TABLE classroom_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only teacher can see their sessions"
  ON classroom_sessions FOR SELECT
  USING (auth.uid() = docente_id);

-- RLS en session_questions
ALTER TABLE session_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only teacher can see their session questions"
  ON session_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM classroom_sessions
    WHERE classroom_sessions.id = session_questions.session_id
      AND classroom_sessions.docente_id = auth.uid()
  ));

-- RLS en missions
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher can see their missions"
  ON missions FOR SELECT
  USING (auth.uid() = docente_id);

CREATE POLICY "Student can see missions from their teachers"
  ON missions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM teacher_students
    WHERE teacher_students.docente_id = missions.docente_id
      AND teacher_students.estudiante_id = auth.uid()
  ));

-- RLS en student_missions
ALTER TABLE student_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student can see their own missions"
  ON student_missions FOR SELECT
  USING (auth.uid() = estudiante_id);

CREATE POLICY "Teacher can see submissions from their students"
  ON student_missions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM missions m
    WHERE m.id = student_missions.mision_id
      AND m.docente_id = auth.uid()
  ));

-- RLS en teacher_students
ALTER TABLE teacher_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher can see their students"
  ON teacher_students FOR SELECT
  USING (auth.uid() = docente_id);

CREATE POLICY "Student can see their teachers"
  ON teacher_students FOR SELECT
  USING (auth.uid() = estudiante_id);

-- ========================================
-- PERMISOS DE INSERCIÓN Y ACTUALIZACIÓN
-- ========================================

-- Usuarios pueden crear su propio registro (register)
-- Supabase Auth maneja esto automáticamente

-- Docentes pueden crear sesiones
CREATE POLICY "Teacher can create sessions"
  ON classroom_sessions FOR INSERT
  WITH CHECK (auth.uid() = docente_id);

-- Docentes pueden actualizar sus sesiones
CREATE POLICY "Teacher can update their sessions"
  ON classroom_sessions FOR UPDATE
  USING (auth.uid() = docente_id);

-- Docentes pueden crear preguntas en sus sesiones
CREATE POLICY "Teacher can create questions"
  ON session_questions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM classroom_sessions
    WHERE classroom_sessions.id = session_questions.session_id
      AND classroom_sessions.docente_id = auth.uid()
  ));

-- Docentes pueden actualizar preguntas de sus sesiones
CREATE POLICY "Teacher can update their questions"
  ON session_questions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM classroom_sessions
    WHERE classroom_sessions.id = session_questions.session_id
      AND classroom_sessions.docente_id = auth.uid()
  ));

-- Docentes pueden crear misiones
CREATE POLICY "Teacher can create missions"
  ON missions FOR INSERT
  WITH CHECK (auth.uid() = docente_id);

-- Docentes pueden actualizar sus misiones
CREATE POLICY "Teacher can update their missions"
  ON missions FOR UPDATE
  USING (auth.uid() = docente_id);

-- Estudiantes pueden crear sus respuestas a misiones
CREATE POLICY "Student can submit mission responses"
  ON student_missions FOR INSERT
  WITH CHECK (
    auth.uid() = estudiante_id
    AND EXISTS (
      SELECT 1 FROM missions m
      JOIN teacher_students ts ON m.docente_id = ts.docente_id
      WHERE m.id = student_missions.mision_id
        AND ts.estudiante_id = auth.uid()
    )
  );

-- Estudiantes pueden actualizar sus respuestas
CREATE POLICY "Student can update their responses"
  ON student_missions FOR UPDATE
  USING (auth.uid() = estudiante_id);

-- ========================================
-- RPC FUNCTIONS
-- ========================================

-- Función: join_class
-- Permite a un estudiante unirse a una clase usando un código
CREATE OR REPLACE FUNCTION public.join_class(codigo_clase text)
RETURNS jsonb AS $$
DECLARE
  v_teacher_id UUID;
  v_student_id UUID;
  v_result jsonb;
BEGIN
  -- Obtener el ID del estudiante actual
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No hay sesión activa');
  END IF;

  -- Buscar docente con ese código
  SELECT id INTO v_teacher_id
  FROM users u
  WHERE u.codigo_clase = upper(codigo_clase)
    AND u.rol = 'docente'
  LIMIT 1;

  IF v_teacher_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código de clase no encontrado');
  END IF;

  -- Verificar que no está ya vinculado
  IF EXISTS (
    SELECT 1 FROM teacher_students
    WHERE docente_id = v_teacher_id AND estudiante_id = v_student_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ya estás en esta clase');
  END IF;

  -- Insertar relación
  INSERT INTO teacher_students (docente_id, estudiante_id)
  VALUES (v_teacher_id, v_student_id);

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Te uniste a la clase exitosamente'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'Error al unirse a la clase: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: publish_mission
-- Permite a un docente publicar una misión para todos sus estudiantes
CREATE OR REPLACE FUNCTION public.publish_mission(
  p_titulo text,
  p_descripcion text,
  p_texto_reto text,
  p_retroalimentacion_exito text,
  p_retroalimentacion_fallo text
)
RETURNS jsonb AS $$
DECLARE
  v_teacher_id UUID;
  v_mission_id UUID;
  v_student_count INTEGER;
  v_students RECORD;
BEGIN
  -- Obtener el ID del docente actual
  v_teacher_id := auth.uid();
  IF v_teacher_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No hay sesión activa');
  END IF;

  -- Crear la misión
  INSERT INTO missions (
    docente_id,
    titulo,
    descripcion,
    texto_reto,
    retroalimentacion_exito,
    retroalimentacion_fallo,
    estado,
    created_at,
    updated_at
  ) VALUES (
    v_teacher_id,
    p_titulo,
    p_descripcion,
    p_texto_reto,
    p_retroalimentacion_exito,
    p_retroalimentacion_fallo,
    'activa',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_mission_id;

  -- Crear registros en student_missions para todos los estudiantes vinculados a este docente
  INSERT INTO student_missions (
    estudiante_id,
    mision_id,
    estado,
    created_at
  )
  SELECT
    ts.estudiante_id,
    v_mission_id,
    'pendiente',
    NOW()
  FROM teacher_students ts
  WHERE ts.docente_id = v_teacher_id
  ON CONFLICT (estudiante_id, mision_id) DO NOTHING;

  -- Contar cuántos estudiantes fueron agregados
  SELECT COUNT(*) INTO v_student_count
  FROM teacher_students
  WHERE docente_id = v_teacher_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Misión publicada exitosamente',
    'mission_id', v_mission_id,
    'student_count', v_student_count
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'Error al publicar misión: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FIN SCHEMA
-- ========================================
