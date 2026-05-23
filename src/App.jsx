import { useNavigate } from 'react-router-dom'
import { supabase } from './services/supabaseClient'
import IslaEducativaLogin from './components/Auth/IslaEducativaLogin'

function App() {
  const navigate = useNavigate()

  const handleLogin = async (data) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.pw,
      })

      if (authError) throw authError

      // Obtener el rol del usuario desde la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('rol')
        .eq('id', authData.user.id)
        .single()

      if (userError) throw userError

      // Redirigir según rol
      if (userData.rol === 'docente') {
        navigate('/teacher/dashboard')
      } else {
        navigate('/student/island')
      }
    } catch (error) {
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  }

  const handleRegister = async (data) => {
    try {
      // Registrar en auth
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

      // El trigger automático insertará el usuario en la tabla users
      // Mostrar mensaje de éxito
      alert(
        `¡Cuenta creada exitosamente, ${data.nombre}!\n\nVerifica tu email para confirmar tu cuenta.`
      )
    } catch (error) {
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

export default App
