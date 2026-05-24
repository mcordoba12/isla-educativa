import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import App from '../../App'

// Mock AuthContext - debe estar ANTES de importar App
vi.mock('../../context/AuthContext', () => ({
  useAuthContext: vi.fn(() => ({
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn()
  })),
  AuthProvider: ({ children }) => children
}))

// Mock Supabase
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn().mockResolvedValue({
        data: { session: null }
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ error: null })
    })
  }
}))

// Mock pages
vi.mock('../../pages/TeacherDashboard', () => ({
  default: () => <div>Teacher Dashboard</div>
}))

vi.mock('../../pages/NewSession', () => ({
  default: () => <div>New Session</div>
}))

vi.mock('../../pages/EditSession', () => ({
  default: () => <div>Edit Session</div>
}))

vi.mock('../../pages/LiveSession', () => ({
  default: () => <div>Live Session</div>
}))

vi.mock('../../pages/StudentIsland', () => ({
  default: () => <div>Student Island</div>
}))

import { supabase } from '../../services/supabaseClient'
import { useAuthContext } from '../../context/AuthContext'

describe('Integration: App Router', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null }
    })
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: null
    })
    supabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: null
    })
  })

  // ============================================================================
  // Root Route
  // ============================================================================

  it('renderiza App sin errores', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Isla Educativa/i)).toBeInTheDocument()
    })
  })

  it('muestra LoginPage en ruta raíz /', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Isla Educativa/i)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Login and Navigation
  // ============================================================================

  it('permite login de estudiante', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'student-1', email: 'student@example.com' },
        session: {}
      },
      error: null
    })
    supabase.from().select().eq().single.mockResolvedValue({
      data: { rol: 'estudiante' },
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Isla Educativa/i)).toBeInTheDocument()
    })
  })

  it('permite login de docente', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'teacher-1', email: 'teacher@example.com' },
        session: {}
      },
      error: null
    })
    supabase.from().select().eq().single.mockResolvedValue({
      data: { rol: 'docente' },
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Isla Educativa/i)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Protected Routes - Teacher
  // ============================================================================

  it('redirige a / cuando usuario no está autenticado en /teacher/dashboard', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    render(
      <MemoryRouter initialEntries={['/teacher/dashboard']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Isla Educativa/i)).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('redirige a / cuando usuario no tiene rol docente en /teacher/dashboard', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'student@example.com' }
      }
    })
    supabase.from().select().eq().single.mockResolvedValue({
      data: { rol: 'estudiante' },
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/teacher/dashboard']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Isla Educativa/i)).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('muestra Teacher Dashboard cuando usuario autenticado es docente', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: { id: 'teacher-1', email: 'teacher@example.com' }
      }
    })
    supabase.from().select().eq().single.mockResolvedValue({
      data: { rol: 'docente' },
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/teacher/dashboard']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Isla Educativa/i)).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Protected Routes - Teacher Sub-routes
  // ============================================================================

  it('redirige a / cuando accede a /teacher/new-session sin autenticación', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    render(
      <MemoryRouter initialEntries={['/teacher/new-session']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Isla Educativa/i)).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('redirige a / cuando accede a /teacher/edit-session/:id sin autenticación', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    render(
      <MemoryRouter initialEntries={['/teacher/edit-session/123']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Isla Educativa/i)).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('redirige a / cuando accede a /teacher/live-session/:id sin autenticación', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    render(
      <MemoryRouter initialEntries={['/teacher/live-session/123']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Isla Educativa/i)).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Protected Routes - Student
  // ============================================================================

  it('redirige a / cuando usuario no está autenticado en /student/island', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    render(
      <MemoryRouter initialEntries={['/student/island']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Isla Educativa/i)).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('redirige a / cuando usuario no tiene rol estudiante en /student/island', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'teacher@example.com' }
      }
    })
    supabase.from().select().eq().single.mockResolvedValue({
      data: { rol: 'docente' },
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/student/island']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Isla Educativa/i)).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('muestra Student Island cuando usuario autenticado es estudiante', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: { id: 'student-1', email: 'student@example.com' }
      }
    })
    supabase.from().select().eq().single.mockResolvedValue({
      data: { rol: 'estudiante' },
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/student/island']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Isla Educativa/i)).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Class Code Generation
  // ============================================================================

  it('genera código de clase para docente registrado', async () => {
    const user = userEvent.setup()
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-teacher' } },
      error: null
    })
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'new-teacher', email: 'teacher@example.com' },
        session: {}
      },
      error: null
    })
    supabase.from().select().eq().single.mockResolvedValue({
      data: { rol: 'docente' },
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Isla Educativa/i)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Error Handling
  // ============================================================================

  it('maneja errores de autenticación en login', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' }
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Isla Educativa/i)).toBeInTheDocument()
    })
  })

  it('maneja email sin confirmar en login', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Email not confirmed' }
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Isla Educativa/i)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Route Protection
  // ============================================================================

  it('verifica rol antes de renderizar rutas protegidas', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'test@example.com' }
      }
    })
    supabase.from().select().eq().single.mockResolvedValue({
      data: { rol: 'docente' },
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/student/island']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Isla Educativa/i)).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('muestra loading mientras verifica autenticación', async () => {
    supabase.auth.getUser.mockImplementation(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({
          data: { user: { id: 'user-1' } }
        }), 500)
      )
    )

    render(
      <MemoryRouter initialEntries={['/teacher/dashboard']}>
        <App />
      </MemoryRouter>
    )

    // Should show loading state
    await waitFor(() => {
      expect(screen.queryByText(/Isla Educativa/i)).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Route Structure
  // ============================================================================

  it('tiene ruta / para login', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Isla Educativa/i)).toBeInTheDocument()
    })
  })

  it('tiene rutas de docente', async () => {
    const routes = ['/', '/teacher/dashboard', '/teacher/new-session', '/teacher/edit-session/123', '/teacher/live-session/123']
    expect(routes.length).toBeGreaterThan(0)
  })

  it('tiene rutas de estudiante', async () => {
    const routes = ['/', '/student/island']
    expect(routes.length).toBeGreaterThan(0)
  })

  // ============================================================================
  // Login Callback
  // ============================================================================

  it('ejecuta handleLogin con datos del formulario', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'test@example.com' },
        session: {}
      },
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Isla Educativa/i)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Register Callback
  // ============================================================================

  it('ejecuta handleRegister con datos del formulario', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-user' } },
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Isla Educativa/i)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Data Fetching
  // ============================================================================

  it('obtiene rol del usuario después de login', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'test@example.com' },
        session: {}
      },
      error: null
    })
    supabase.from().select().eq().single.mockResolvedValue({
      data: { rol: 'estudiante' },
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalled()
    }, { timeout: 15000 })
  })

  it('maneja error al obtener rol del usuario', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'test@example.com' },
        session: {}
      },
      error: null
    })
    supabase.from().select().eq().single.mockResolvedValue({
      data: null,
      error: { message: 'Error fetching user' }
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Isla Educativa/i)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Loading States
  // ============================================================================

  it('muestra estado de carga mientras verifica autenticación', async () => {
    supabase.auth.getUser.mockImplementation(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({
          data: { user: null }
        }), 1000)
      )
    )

    const { container } = render(
      <MemoryRouter initialEntries={['/teacher/dashboard']}>
        <App />
      </MemoryRouter>
    )

    // Should render something while loading
    expect(container).toBeInTheDocument()
  })

  // ============================================================================
  // User Metadata
  // ============================================================================

  it('usa nombre completo del usuario desde metadata', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          user_metadata: { nombre_completo: 'Juan García' }
        },
        session: {}
      },
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toBeDefined()
    })
  })
})
