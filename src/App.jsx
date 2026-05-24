import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './services/supabaseClient'
import IslaEducativaLogin from './components/Auth/IslaEducativaLogin'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import TeacherDashboard from './pages/TeacherDashboard'
import NewSession from './pages/NewSession'
import EditSession from './pages/EditSession'
import LiveSession from './pages/LiveSession'
import StudentIslandPage from './pages/StudentIsland'

// Función auxiliar para generar código de clase único
function generateClassCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'ISLA-'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function LoginPage() {
  const navigate = useNavigate()

  const handleLogin = async (data) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.pw,
      })

      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('Por favor confirma tu email. Revisa tu bandeja de entrada o spam.')
        }
        throw authError
      }

      if (!authData.user) {
        throw new Error('No se pudo obtener información del usuario')
      }

      // Obtener el rol del usuario desde la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('rol')
        .eq('id', authData.user.id)
        .single()

      if (userError) {
        console.error('Error obteniendo rol del usuario:', userError)
        throw new Error('No se encontró el perfil de usuario. Intenta registrarte primero.')
      }

      if (!userData || !userData.rol) {
        throw new Error('El perfil de usuario no tiene un rol válido.')
      }

      console.log('Login exitoso. Rol:', userData.rol)

      // Redirigir según rol
      if (userData.rol === 'docente') {
        navigate('/teacher/dashboard')
      } else if (userData.rol === 'estudiante') {
        navigate('/student/island')
      } else {
        throw new Error(`Rol desconocido: ${userData.rol}`)
      }
    } catch (error) {
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  }

  const handleRegister = async (data) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.pw,
        options: {
          data: {
            nombre_completo: `${data.nombre} ${data.apellido}`,
            rol: data.role,
          },
        },
      })

      if (authError) throw authError

      console.log('Registro exitoso, usuario:', authData.user.id)

      // Pequeña pausa para asegurar que el trigger se ejecutó
      await new Promise(resolve => setTimeout(resolve, 500))

      // Hacemos login automático
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.pw,
      })

      if (signInError) {
        console.error('Error al hacer login:', signInError)
        throw signInError
      }

      console.log('Login exitoso:', signInData.user.id)

      // Obtener el rol desde la tabla users (igual que en login)
      const { data: userDataReg, error: userErrorReg } = await supabase
        .from('users')
        .select('rol')
        .eq('id', signInData.user.id)
        .single()

      if (userErrorReg) {
        console.error('Error obteniendo rol registrado:', userErrorReg)
        throw new Error('Error al verificar tu rol. Intenta hacer login nuevamente.')
      }

      if (!userDataReg || !userDataReg.rol) {
        console.error('Rol no encontrado en BD. Data:', userDataReg)
        console.error('Trigger probablemente falló. Rol del formulario:', data.role)
        throw new Error('El trigger de Supabase no guardó tu rol correctamente. Contacta soporte.')
      }

      console.log('Rol obtenido de BD:', userDataReg.rol)

      // Si es docente, generar código de clase
      if (userDataReg.rol === 'docente') {
        const classCode = generateClassCode()
        console.log('Código de clase generado:', classCode)

        const { error: updateError } = await supabase
          .from('users')
          .update({ codigo_clase: classCode })
          .eq('id', signInData.user.id)

        if (updateError) {
          console.error('Error guardando código de clase:', updateError)
          // No es fatal, continuar de todos modos
        }
        navigate('/teacher/dashboard')
      } else if (userDataReg.rol === 'estudiante') {
        // Estudiante se registra sin código - se unirá a clases desde la isla
        navigate('/student/island')
      } else {
        throw new Error(`Rol desconocido en BD: ${userDataReg.rol}`)
      }
    } catch (error) {
      console.error('Error en registro:', error)
      throw new Error(error.message || 'Error al registrarse')
    }
  }

  return (
    <IslaEducativaLogin
      mascotSrc="/src/assets/images/cookie-normal.png"
      defaultRole="estudiante"
      title="Isla Educativa"
      onLogin={handleLogin}
      onRegister={handleRegister}
      showFloatingChips={true}
      showMascot={true}
    />
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      {/* Rutas del docente */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute requiredRole="docente">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/new-session"
        element={
          <ProtectedRoute requiredRole="docente">
            <NewSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/edit-session/:id"
        element={
          <ProtectedRoute requiredRole="docente">
            <EditSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/live-session/:id"
        element={
          <ProtectedRoute requiredRole="docente">
            <LiveSession />
          </ProtectedRoute>
        }
      />

      {/* Rutas del estudiante */}
      <Route
        path="/student/island"
        element={
          <ProtectedRoute requiredRole="estudiante">
            <StudentIslandPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
