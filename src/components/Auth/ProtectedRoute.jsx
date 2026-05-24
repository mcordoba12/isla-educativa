import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'

export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuthContext()
  const [userRole, setUserRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(true)
  const [hasRequiredRole, setHasRequiredRole] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRoleLoading(false)
        return
      }

      try {
        if (requiredRole) {
          const { data: userData } = await supabase
            .from('users')
            .select('rol')
            .eq('id', user.id)
            .single()

          setUserRole(userData?.rol)
          setHasRequiredRole(userData?.rol === requiredRole)
        }
      } catch (error) {
        console.error('Error verificando rol:', error)
        setHasRequiredRole(false)
      } finally {
        setRoleLoading(false)
      }
    }

    fetchUserRole()
  }, [user, requiredRole])

  // Mientras se verifica la sesión
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

  // Si no hay usuario, redirige a login
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Mientras se verifica el rol
  if (requiredRole && roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#87D5EE] to-[#E4F6FB]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F8FCE] mb-4"></div>
          <p className="text-[#4E6B7E] font-semibold">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Si no tiene el rol requerido, redirige a login
  if (!hasRequiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}
