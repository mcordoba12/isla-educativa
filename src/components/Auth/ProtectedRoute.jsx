import { Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'

export function ProtectedRoute({ children, requiredRole = null }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
          navigate('/')
          return
        }

        // Obtener el rol del usuario desde la tabla users
        const { data: userData } = await supabase
          .from('users')
          .select('rol')
          .eq('id', authUser.id)
          .single()

        if (requiredRole && userData?.rol !== requiredRole) {
          navigate('/')
          return
        }

        setUser(authUser)
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [requiredRole, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#87D5EE] to-[#E4F6FB]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F8FCE] mb-4"></div>
          <p className="text-[#4E6B7E] font-semibold">Cargando...</p>
        </div>
      </div>
    )
  }

  return user ? children : null
}
