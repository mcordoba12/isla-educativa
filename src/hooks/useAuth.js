import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Obtener sesión actual
    const getSession = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Escuchar cambios de autenticación
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password, rol, nombreCompleto) => {
    setLoading(true)
    setError(null)
    try {
      // Registrar en Auth
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
            rol: rol
          }
        }
      })
      if (authError) throw authError

      // El trigger en BD insertará el usuario automáticamente
      // Si es docente, actualizar el rol
      if (rol === 'docente') {
        const {
          data: { user }
        } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('users')
            .update({ rol: 'docente' })
            .eq('id', user.id)
        }
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }
}
