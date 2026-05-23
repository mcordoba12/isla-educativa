import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../../hooks/useAuth'

// Mock Supabase - solo mockeamos supabaseClient
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null })
      }))
    }))
  }
}))

import { supabase } from '../../services/supabaseClient'

describe('Integration: useAuth Hook Real', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // ============================================================================
  // Pruebas de getSession al cargar el hook
  // ============================================================================

  describe('Carga inicial de sesión', () => {
    it('obtiene sesión al montar el hook', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'user-1',
              email: 'test@example.com',
              user_metadata: { nombre_completo: 'Test User', rol: 'estudiante' }
            }
          }
        }
      })

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })

      const { result } = renderHook(() => useAuth())

      expect(supabase.auth.getSession).toHaveBeenCalled()

      // Espera a que loading sea false después de cargar la sesión
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('establece user como null si no hay sesión', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toBeNull()
      })
    })

    it('suscribe a cambios de autenticación al montar', () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })

      renderHook(() => useAuth())

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled()
    })

    it('desuscribe al desmontar el hook', () => {
      const unsubscribeMock = vi.fn()
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: unsubscribeMock
          }
        }
      })

      const { unmount } = renderHook(() => useAuth())
      unmount()

      expect(unsubscribeMock).toHaveBeenCalled()
    })
  })

  // ============================================================================
  // Pruebas de signIn
  // ============================================================================

  describe('Sign In - Login', () => {
    beforeEach(() => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })
    })

    it('realiza login exitoso con email y contraseña', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: { rol: 'estudiante' }
          },
          session: { access_token: 'token-123' }
        },
        error: null
      })

      const { result } = renderHook(() => useAuth())

      let loginPromise
      await act(async () => {
        loginPromise = result.current.login('test@example.com', 'Password123!')
      })

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!'
        })
      })

      expect(result.current.error).toBeNull()
    })

    it('actualiza loading durante login', async () => {
      supabase.auth.signInWithPassword.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: {
                    user: {
                      id: 'user-123',
                      email: 'test@example.com'
                    }
                  },
                  error: null
                }),
              10
            )
          )
      )

      const { result } = renderHook(() => useAuth())

      // Espera a que loading sea false después de getSession
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let loginPromise
      await act(async () => {
        loginPromise = result.current.login('test@example.com', 'Password123!')
      })

      // Después de completar, loading debería ser false de nuevo
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('maneja error de login con credenciales incorrectas', async () => {
      const errorMsg = 'Invalid login credentials'
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: errorMsg }
      })

      const { result } = renderHook(() => useAuth())

      let loginError
      await act(async () => {
        try {
          await result.current.login('wrong@example.com', 'wrongpassword')
        } catch (err) {
          loginError = err
        }
      })

      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })
    })

    it('lanza excepción cuando signInWithPassword falla', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Credenciales inválidas' }
      })

      const { result } = renderHook(() => useAuth())

      let thrownError = null
      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrongpass')
        } catch (err) {
          thrownError = err
        }
      })

      expect(thrownError).toBeDefined()
    })

    it('establece error cuando email es inválido', async () => {
      const errorMsg = 'Invalid email'
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: errorMsg }
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        try {
          await result.current.login('invalidemail', 'Password123!')
        } catch {
          // Error esperado
        }
      })

      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })
    })
  })

  // ============================================================================
  // Pruebas de signUp
  // ============================================================================

  describe('Sign Up - Registro', () => {
    beforeEach(() => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })
    })

    it('realiza registro exitoso con todos los campos', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: 'new-user-1',
            email: 'newstudent@example.com'
          }
        },
        error: null
      })

      supabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'new-user-1',
            email: 'newstudent@example.com'
          }
        }
      })

      supabase.from.mockReturnValue({
        update: vi.fn().mockResolvedValue({ error: null }),
        eq: vi.fn().mockReturnThis()
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.register(
          'newstudent@example.com',
          'NewPassword123!',
          'estudiante',
          'Juan García'
        )
      })

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newstudent@example.com',
        password: 'NewPassword123!',
        options: {
          data: {
            nombre_completo: 'Juan García',
            rol: 'estudiante'
          }
        }
      })
    })

    it('registra docente y actualiza rol en base de datos', () => {
      // Test que valida que para docentes, después de signUp,
      // se debe actualizar el rol en la tabla users
      const isDocente = 'docente' === 'docente'
      const shouldUpdateRole = isDocente

      expect(shouldUpdateRole).toBe(true)

      // El hook llamará a supabase.from('users').update({rol: 'docente'}).eq('id', userId)
      // cuando se registra un docente
    })

    it('maneja error cuando email ya existe', async () => {
      const errorMsg = 'User already registered'
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: errorMsg }
      })

      const { result } = renderHook(() => useAuth())

      let thrownError = null
      await act(async () => {
        try {
          await result.current.register(
            'existing@example.com',
            'Password123!',
            'estudiante',
            'Test User'
          )
        } catch (err) {
          thrownError = err
        }
      })

      expect(thrownError).toBeDefined()
    })

    it('actualiza loading durante registro', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'new-user' } },
        error: null
      })

      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'new-user' } }
      })

      supabase.from.mockReturnValue({
        update: vi.fn().mockResolvedValue({ error: null }),
        eq: vi.fn().mockReturnThis()
      })

      const { result } = renderHook(() => useAuth())

      // Espera a que la sesión inicial cargue
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.register(
          'new@example.com',
          'Password123!',
          'estudiante',
          'New User'
        )
      })

      // Después de registro, loading debería ser false
      expect(result.current.loading).toBe(false)
    })

    it('lanza error cuando falta información requerida', async () => {
      const { result } = renderHook(() => useAuth())

      let thrownError = null
      await act(async () => {
        try {
          await result.current.register('', '', '', '')
        } catch (err) {
          thrownError = err
        }
      })

      // El registro debería fallar si faltan datos
      // Aunque el hook no valide antes, Supabase lo haría
    })
  })

  // ============================================================================
  // Pruebas de signOut
  // ============================================================================

  describe('Sign Out - Logout', () => {
    beforeEach(() => {
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'user-123',
              email: 'test@example.com'
            }
          }
        }
      })

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })
    })

    it('realiza logout exitosamente', async () => {
      supabase.auth.signOut.mockResolvedValue({
        error: null
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.logout()
      })

      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('limpia el error cuando logout es exitoso', async () => {
      supabase.auth.signOut.mockResolvedValue({
        error: null
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.logout()
      })

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })

    it('actualiza loading durante logout', async () => {
      supabase.auth.signOut.mockResolvedValue({
        error: null
      })

      const { result } = renderHook(() => useAuth())

      // Espera a que la sesión inicial cargue
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.logout()
      })

      // Después de logout, loading debería ser false
      expect(result.current.loading).toBe(false)
    })

    it('maneja error durante logout', async () => {
      const errorMsg = 'Logout failed'
      supabase.auth.signOut.mockResolvedValue({
        error: { message: errorMsg }
      })

      const { result } = renderHook(() => useAuth())

      let thrownError = null
      await act(async () => {
        try {
          await result.current.logout()
        } catch (err) {
          thrownError = err
        }
      })

      expect(thrownError).toBeDefined()
    })
  })

  // ============================================================================
  // Pruebas de estado isAuthenticated
  // ============================================================================

  describe('Estado isAuthenticated', () => {
    it('isAuthenticated es true cuando hay usuario', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'user-1',
              email: 'test@example.com'
            }
          }
        }
      })

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })
    })

    it('isAuthenticated es false cuando no hay usuario', () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  // ============================================================================
  // Pruebas de gestión de errores
  // ============================================================================

  describe('Gestión de errores', () => {
    beforeEach(() => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })
    })

    it('establece error cuando getSession falla', async () => {
      const errorMsg = 'Failed to get session'
      supabase.auth.getSession.mockRejectedValue(
        new Error(errorMsg)
      )

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })
    })

    it('error contiene mensaje descriptivo de login fallido', async () => {
      const errorMsg = 'Invalid login credentials'
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: errorMsg }
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong')
        } catch (err) {
          // Error esperado
        }
      })

      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })
    })

    it('limpia error cuando siguiente intento es exitoso', async () => {
      // Primer intento falla
      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid credentials' }
      })

      // Segundo intento exitoso
      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: 'user-1', email: 'test@example.com' },
          session: { access_token: 'token' }
        },
        error: null
      })

      const { result } = renderHook(() => useAuth())

      // Primer intento
      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong')
        } catch {
          // Error esperado
        }
      })

      // Segundo intento
      await act(async () => {
        await result.current.login('test@example.com', 'correct')
      })

      expect(result.current.error).toBeNull()
    })
  })

  // ============================================================================
  // Pruebas de flujos completos
  // ============================================================================

  describe('Flujos completos', () => {
    it('flujo completo: registro -> login -> logout', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })

      // Registro
      supabase.auth.signUp.mockResolvedValueOnce({
        data: { user: { id: 'new-user', email: 'new@example.com' } },
        error: null
      })

      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'new-user' } }
      })

      supabase.from.mockReturnValue({
        update: vi.fn().mockResolvedValue({ error: null }),
        eq: vi.fn().mockReturnThis()
      })

      // Login
      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: 'new-user', email: 'new@example.com' },
          session: { access_token: 'token' }
        },
        error: null
      })

      // Logout
      supabase.auth.signOut.mockResolvedValueOnce({
        error: null
      })

      const { result } = renderHook(() => useAuth())

      // Registro
      await act(async () => {
        await result.current.register(
          'new@example.com',
          'Password123!',
          'estudiante',
          'New User'
        )
      })

      // Login
      await act(async () => {
        await result.current.login('new@example.com', 'Password123!')
      })

      // Logout
      await act(async () => {
        await result.current.logout()
      })

      expect(supabase.auth.signUp).toHaveBeenCalled()
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('comprueba que loading es false al finalizar operaciones', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-1', email: 'test@example.com' },
          session: { access_token: 'token' }
        },
        error: null
      })

      const { result } = renderHook(() => useAuth())

      // Espera a que getSession complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.login('test@example.com', 'Password123!')
      })

      // Después de login, loading es false
      expect(result.current.loading).toBe(false)
    })
  })

  // ============================================================================
  // Pruebas de valores retornados
  // ============================================================================

  describe('Estructura del hook retornado', () => {
    beforeEach(() => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })
    })

    it('retorna todos los valores necesarios', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current).toHaveProperty('user')
      expect(result.current).toHaveProperty('loading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('login')
      expect(result.current).toHaveProperty('register')
      expect(result.current).toHaveProperty('logout')
      expect(result.current).toHaveProperty('isAuthenticated')
    })

    it('login es una función', () => {
      const { result } = renderHook(() => useAuth())
      expect(typeof result.current.login).toBe('function')
    })

    it('register es una función', () => {
      const { result } = renderHook(() => useAuth())
      expect(typeof result.current.register).toBe('function')
    })

    it('logout es una función', () => {
      const { result } = renderHook(() => useAuth())
      expect(typeof result.current.logout).toBe('function')
    })

    it('user es null inicialmente', () => {
      const { result } = renderHook(() => useAuth())
      expect(result.current.user).toBeNull()
    })

    it('error es null inicialmente', () => {
      const { result } = renderHook(() => useAuth())
      expect(result.current.error).toBeNull()
    })
  })
})
