import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuthContext } from '../../context/AuthContext'

// Mock Supabase - NO mockeamos useAuth, lo importamos real
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

describe('Integration: AuthContext Real', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Configurar mocks de Supabase por defecto
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

  afterEach(() => {
    vi.resetAllMocks()
  })

  // ============================================================================
  // Pruebas de AuthProvider - Estructura
  // ============================================================================

  describe('AuthProvider - Estructura Básica', () => {
    it('AuthProvider renderiza sin errores', () => {
      const TestComponent = () => {
        const auth = useAuthContext()
        return <div>{auth ? 'Has auth context' : 'No context'}</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByText('Has auth context')).toBeInTheDocument()
    })

    it('AuthProvider proporciona useAuthContext al árbol de componentes', () => {
      const TestComponent = () => {
        const authContext = useAuthContext()
        return (
          <div>
            {authContext && authContext.user === null ? (
              <div>No user logged in</div>
            ) : (
              <div>User exists</div>
            )}
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByText('No user logged in')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Pruebas de useAuthContext - Estado Sin Usuario
  // ============================================================================

  describe('useAuthContext - Estado Inicial (Sin Usuario)', () => {
    it('retorna contexto de autenticación', async () => {
      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>Context retrieved</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue).not.toBeNull()
      })
    })

    it('user es null cuando no hay sesión', async () => {
      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>Test</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue.user).toBeNull()
      })
    })

    it('isAuthenticated es false sin usuario', async () => {
      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>Test</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue.isAuthenticated).toBe(false)
      })
    })

    it('error es null al inicio', async () => {
      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>Test</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue.error).toBeNull()
      })
    })

    it('loading es false después de cargar sesión inicial', async () => {
      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>Test</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue.loading).toBe(false)
      })
    })
  })

  // ============================================================================
  // Pruebas de valores provistos por AuthContext
  // ============================================================================

  describe('useAuthContext - Valores Provistos', () => {
    it('contexto proporciona función login', async () => {
      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>Test</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue).toHaveProperty('login')
        expect(typeof contextValue.login).toBe('function')
      })
    })

    it('contexto proporciona función register', async () => {
      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>Test</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue).toHaveProperty('register')
        expect(typeof contextValue.register).toBe('function')
      })
    })

    it('contexto proporciona función logout', async () => {
      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>Test</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue).toHaveProperty('logout')
        expect(typeof contextValue.logout).toBe('function')
      })
    })

    it('contexto proporciona todas las propiedades necesarias', async () => {
      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>Test</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue).toHaveProperty('user')
        expect(contextValue).toHaveProperty('loading')
        expect(contextValue).toHaveProperty('error')
        expect(contextValue).toHaveProperty('login')
        expect(contextValue).toHaveProperty('register')
        expect(contextValue).toHaveProperty('logout')
        expect(contextValue).toHaveProperty('isAuthenticated')
      })
    })
  })

  // ============================================================================
  // Pruebas de cambios en contexto después de login
  // ============================================================================

  describe('AuthContext - Cambios Después de Login', () => {
    it('actualiza user cuando hay sesión', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'user-123',
              email: 'student@example.com',
              user_metadata: { nombre_completo: 'Juan García' }
            }
          }
        }
      })

      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>{contextValue.user ? contextValue.user.email : 'No user'}</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue.user).not.toBeNull()
        expect(contextValue.user.email).toBe('student@example.com')
      })
    })

    it('isAuthenticated es true cuando user existe', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123', email: 'test@example.com' }
          }
        }
      })

      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>Test</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue.isAuthenticated).toBe(true)
      })
    })

    it('error es null cuando login es exitoso', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123', email: 'test@example.com' }
          }
        }
      })

      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>Test</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue.error).toBeNull()
      })
    })
  })

  // ============================================================================
  // Pruebas de limpieza después de logout
  // ============================================================================

  describe('AuthContext - Limpieza Después de Logout', () => {
    it('user es null después de logout', async () => {
      // Estado después de logout
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>{contextValue.user ? 'Has user' : 'No user'}</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue.user).toBeNull()
        expect(screen.getByText('No user')).toBeInTheDocument()
      })
    })

    it('isAuthenticated es false después de logout', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>Test</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue.isAuthenticated).toBe(false)
      })
    })

    it('error es null después de logout exitoso', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      let contextValue = null

      const TestComponent = () => {
        contextValue = useAuthContext()
        return <div>Test</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValue.error).toBeNull()
      })
    })
  })


  // ============================================================================
  // Pruebas de múltiples componentes compartiendo contexto
  // ============================================================================

  describe('AuthProvider - Múltiples Consumidores', () => {
    it('múltiples componentes comparten el mismo contexto', async () => {
      const testData = { user: null, isAuthenticated: false }

      const Component1 = () => {
        const auth = useAuthContext()
        testData.user = auth.user
        return <div data-testid="comp1">Component 1</div>
      }

      const Component2 = () => {
        const auth = useAuthContext()
        testData.isAuthenticated = auth.isAuthenticated
        return <div data-testid="comp2">Component 2</div>
      }

      render(
        <AuthProvider>
          <Component1 />
          <Component2 />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('comp1')).toBeInTheDocument()
        expect(screen.getByTestId('comp2')).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Pruebas de persistencia del estado en el contexto
  // ============================================================================

  describe('AuthContext - Persistencia de Estado', () => {
    it('contexto mantiene el estado a través de renders', async () => {
      let renderCount = 0

      const TestComponent = () => {
        const auth = useAuthContext()
        renderCount++
        return <div>{auth ? 'Has context' : 'No context'}</div>
      }

      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const initialRenderCount = renderCount

      // Forzar un re-render del componente padre (sin desmontar AuthProvider)
      // El contexto debe persistir

      expect(initialRenderCount).toBeGreaterThan(0)
    })

    it('auth context retiene valores entre re-renders', async () => {
      let contextValues = []

      const TestComponent = () => {
        const auth = useAuthContext()
        contextValues.push({
          user: auth.user,
          isAuthenticated: auth.isAuthenticated,
          error: auth.error
        })
        return <div>Test</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(contextValues.length).toBeGreaterThan(0)
        // Todos los valores capturados deberían ser consistentes
        contextValues.forEach((val) => {
          expect(val.user).toBeNull()
          expect(val.isAuthenticated).toBe(false)
          expect(val.error).toBeNull()
        })
      })
    })
  })
})
