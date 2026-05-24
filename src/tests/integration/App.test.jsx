import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(),
  },
}))

// Mock ProtectedRoute to bypass AuthContext entirely
vi.mock('../../components/Auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }) => children,
}))

vi.mock('../../pages/TeacherDashboard', () => ({ default: () => <div>Teacher Dashboard</div> }))
vi.mock('../../pages/NewSession',        () => ({ default: () => <div>New Session</div> }))
vi.mock('../../pages/EditSession',       () => ({ default: () => <div>Edit Session</div> }))
vi.mock('../../pages/LiveSession',       () => ({ default: () => <div>Live Session</div> }))
vi.mock('../../pages/StudentIsland',     () => ({ default: () => <div>Student Island</div> }))

// ─── Supabase from() chain helper ────────────────────────────────────────────

import { supabase } from '../../services/supabaseClient'

const buildChain = ({ singleData = null, singleError = null, updateError = null } = {}) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: singleData, error: singleError }),
    update: vi.fn().mockReturnThis(),
  }
  // update().eq() → resolves with updateError
  chain.update.mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: updateError }),
  })
  supabase.from.mockReturnValue(chain)
  return chain
}

// ─── Render helper ────────────────────────────────────────────────────────────

const renderApp = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>
  )

const waitForLogin = () =>
  waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument())

// ─── Submits the login form ───────────────────────────────────────────────────

const submitLoginForm = async (user, email = 'test@test.com', password = 'Password1') => {
  const emailInput    = document.querySelector('input[type="email"]')
  const passwordInput = document.querySelector('input[type="password"]')
  await user.type(emailInput, email)
  await user.type(passwordInput, password)
  await user.click(screen.getByRole('button', { name: /Zarpar a la isla/i }))
}

// ─── Submits the register form ────────────────────────────────────────────────

const goToRegister = async (user) => {
  await user.click(screen.getByText(/Crea tu pasaporte/i))
  await waitFor(() => screen.getByText(/Diseña tu pasaporte/i))
}

const submitRegisterForm = async (user, { nombre = 'Ana', email = 'ana@test.com', pw = 'Password1!' } = {}) => {
  const textInputs  = screen.getAllByRole('textbox')
  const nombreInput = textInputs.find((i) => i.placeholder === 'Marina')
  await user.type(nombreInput, nombre)
  await user.type(document.querySelector('input[type="email"]'), email)
  const pwInputs = document.querySelectorAll('input[type="password"]')
  await user.type(pwInputs[0], pw)
  await user.type(pwInputs[1], pw)
  await user.click(screen.getByRole('checkbox'))
  await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))
}

// ─────────────────────────────────────────────────────────────────────────────

describe('App — cobertura completa', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockReset()
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    buildChain()
  })

  // ==========================================================================
  // 1. Estructura de rutas
  // ==========================================================================

  describe('Estructura de rutas', () => {
    it('renderiza LoginPage en ruta /', async () => {
      renderApp('/')
      await waitForLogin()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('renderiza /teacher/dashboard con ProtectedRoute', async () => {
      renderApp('/teacher/dashboard')
      await waitFor(() =>
        expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument()
      )
    })

    it('renderiza /teacher/new-session con ProtectedRoute', async () => {
      renderApp('/teacher/new-session')
      await waitFor(() =>
        expect(screen.getByText('New Session')).toBeInTheDocument()
      )
    })

    it('renderiza /teacher/edit-session/123 con ProtectedRoute', async () => {
      renderApp('/teacher/edit-session/123')
      await waitFor(() =>
        expect(screen.getByText('Edit Session')).toBeInTheDocument()
      )
    })

    it('renderiza /teacher/live-session/123 con ProtectedRoute', async () => {
      renderApp('/teacher/live-session/123')
      await waitFor(() =>
        expect(screen.getByText('Live Session')).toBeInTheDocument()
      )
    })

    it('renderiza /student/island con ProtectedRoute', async () => {
      renderApp('/student/island')
      await waitFor(() =>
        expect(screen.getByText('Student Island')).toBeInTheDocument()
      )
    })
  })

  // ==========================================================================
  // 2. handleLogin — flujos exitosos
  // ==========================================================================

  describe('handleLogin — flujos exitosos', () => {
    it('navega a /teacher/dashboard cuando el rol es docente', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'teacher-1', email: 'doc@test.com' }, session: {} },
        error: null,
      })
      buildChain({ singleData: { rol: 'docente' } })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await submitLoginForm(user, 'doc@test.com', 'Password1')

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/teacher/dashboard')
      )
    })

    it('navega a /student/island cuando el rol es estudiante', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'stu-1', email: 'stu@test.com' }, session: {} },
        error: null,
      })
      buildChain({ singleData: { rol: 'estudiante' } })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await submitLoginForm(user, 'stu@test.com', 'Password1')

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/student/island')
      )
    })
  })

  // ==========================================================================
  // 3. handleLogin — manejo de errores
  // ==========================================================================

  describe('handleLogin — manejo de errores', () => {
    it('lanza error amigable cuando email no está confirmado', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Email not confirmed' },
      })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await submitLoginForm(user)

      await waitFor(() =>
        expect(screen.getByText(/confirma tu email/i)).toBeInTheDocument()
      )
    })

    it('lanza el authError original cuando es otro tipo de error', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await submitLoginForm(user)

      await waitFor(() =>
        expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
      )
    })

    it('lanza error cuando authData.user es null', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await submitLoginForm(user)

      await waitFor(() =>
        expect(screen.getByText(/No se pudo obtener información del usuario/i)).toBeInTheDocument()
      )
    })

    it('lanza error cuando falla la consulta del rol (userError)', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'u1', email: 'x@test.com' }, session: {} },
        error: null,
      })
      buildChain({ singleData: null, singleError: { message: 'DB error' } })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await submitLoginForm(user)

      await waitFor(() =>
        expect(screen.getByText(/No se encontró el perfil de usuario/i)).toBeInTheDocument()
      )
    })

    it('lanza error cuando userData no tiene rol', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'u1', email: 'x@test.com' }, session: {} },
        error: null,
      })
      buildChain({ singleData: { rol: null } })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await submitLoginForm(user)

      await waitFor(() =>
        expect(screen.getByText(/no tiene un rol válido/i)).toBeInTheDocument()
      )
    })

    it('lanza error cuando el rol es desconocido', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'u1', email: 'x@test.com' }, session: {} },
        error: null,
      })
      buildChain({ singleData: { rol: 'admin' } })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await submitLoginForm(user)

      await waitFor(() =>
        expect(screen.getByText(/Rol desconocido: admin/i)).toBeInTheDocument()
      )
    })
  })

  // ==========================================================================
  // 4. handleRegister — flujos exitosos
  // ==========================================================================

  describe('handleRegister — flujos exitosos', () => {
    it('registra docente, genera código de clase y navega a /teacher/dashboard', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'new-teacher' } },
        error: null,
      })
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'new-teacher', email: 'doc@test.com' }, session: {} },
        error: null,
      })
      buildChain({ singleData: { rol: 'docente' } })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await goToRegister(user)

      // Cambiar tab a docente
      const tabs = screen.getAllByRole('tab')
      const tabDoc = tabs.find((t) => t.textContent.includes('Docente'))
      await user.click(tabDoc)

      await submitRegisterForm(user, { nombre: 'Carlos', email: 'doc@test.com' })

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/teacher/dashboard')
      )
      // Verifica que se intentó actualizar el código de clase
      expect(supabase.from).toHaveBeenCalledWith('users')
    })

    it('registra estudiante y navega a /student/island', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'new-student' } },
        error: null,
      })
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'new-student', email: 'stu@test.com' }, session: {} },
        error: null,
      })
      buildChain({ singleData: { rol: 'estudiante' } })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await goToRegister(user)
      await submitRegisterForm(user, { nombre: 'Sofía', email: 'stu@test.com' })

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/student/island')
      )
    })

    it('continúa aunque falle la actualización del código de clase (no fatal)', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'new-teacher' } },
        error: null,
      })
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'new-teacher', email: 'doc@test.com' }, session: {} },
        error: null,
      })
      // Falla el update pero singleData tiene rol docente
      buildChain({ singleData: { rol: 'docente' }, updateError: { message: 'update failed' } })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await goToRegister(user)

      const tabs = screen.getAllByRole('tab')
      const tabDoc = tabs.find((t) => t.textContent.includes('Docente'))
      await user.click(tabDoc)

      await submitRegisterForm(user, { nombre: 'Carlos', email: 'doc@test.com' })

      // A pesar del error de update, navega igual
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/teacher/dashboard')
      )
    })
  })

  // ==========================================================================
  // 5. handleRegister — manejo de errores
  // ==========================================================================

  describe('handleRegister — manejo de errores', () => {
    it('lanza error cuando supabase.auth.signUp falla', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already registered' },
      })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await goToRegister(user)
      await submitRegisterForm(user)

      await waitFor(() =>
        expect(screen.getByText('Email already registered')).toBeInTheDocument()
      )
    })

    it('lanza error cuando signInWithPassword falla tras signUp', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'new-user' } },
        error: null,
      })
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Login after register failed' },
      })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await goToRegister(user)
      await submitRegisterForm(user)

      await waitFor(() =>
        expect(screen.getByText('Login after register failed')).toBeInTheDocument()
      )
    })

    it('lanza error cuando falla la consulta del rol tras registro (userErrorReg)', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'new-user' } },
        error: null,
      })
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'new-user', email: 'x@test.com' }, session: {} },
        error: null,
      })
      buildChain({ singleData: null, singleError: { message: 'DB error on register' } })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await goToRegister(user)
      await submitRegisterForm(user)

      await waitFor(() =>
        expect(screen.getByText(/Error al verificar tu rol/i)).toBeInTheDocument()
      )
    })

    it('lanza error cuando userDataReg no tiene rol (trigger falló)', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'new-user' } },
        error: null,
      })
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'new-user', email: 'x@test.com' }, session: {} },
        error: null,
      })
      buildChain({ singleData: { rol: null } })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await goToRegister(user)
      await submitRegisterForm(user)

      await waitFor(() =>
        expect(screen.getByText(/trigger de Supabase/i)).toBeInTheDocument()
      )
    })

    it('lanza error cuando el rol en BD es desconocido tras registro', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'new-user' } },
        error: null,
      })
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'new-user', email: 'x@test.com' }, session: {} },
        error: null,
      })
      buildChain({ singleData: { rol: 'superadmin' } })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await goToRegister(user)
      await submitRegisterForm(user)

      await waitFor(() =>
        expect(screen.getByText(/Rol desconocido en BD: superadmin/i)).toBeInTheDocument()
      )
    })
  })

  // ==========================================================================
  // 6. generateClassCode — formato
  // ==========================================================================

  describe('generateClassCode — formato del código', () => {
    it('el código generado tiene formato ISLA-XXXX (4 chars alfanuméricos)', async () => {
      // Verificamos indirectamente: cuando un docente se registra,
      // se llama supabase.from('users').update({ codigo_clase: <code> })
      // Capturamos el argumento pasado a update()

      const capturedUpdates = []
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq:     vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { rol: 'docente' }, error: null }),
        update: vi.fn((data) => {
          capturedUpdates.push(data)
          return { eq: vi.fn().mockResolvedValue({ error: null }) }
        }),
      }
      supabase.from.mockReturnValue(chain)

      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'teacher-x' } }, error: null,
      })
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'teacher-x', email: 'doc@test.com' }, session: {} }, error: null,
      })

      const user = userEvent.setup()
      renderApp('/')
      await waitForLogin()
      await goToRegister(user)

      const tabs = screen.getAllByRole('tab')
      const tabDoc = tabs.find((t) => t.textContent.includes('Docente'))
      await user.click(tabDoc)

      await submitRegisterForm(user, { nombre: 'Prof', email: 'doc@test.com' })

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/teacher/dashboard'))

      const updateCall = capturedUpdates.find((d) => d?.codigo_clase)
      expect(updateCall).toBeDefined()
      expect(updateCall.codigo_clase).toMatch(/^ISLA-[A-Z0-9]{4}$/)
    })
  })

  // ==========================================================================
  // 7. Timeout en registro (setTimeout 500ms)
  // ==========================================================================

  describe('Pausa de 500ms entre signUp y signIn', () => {
    it('usa setTimeout 500ms antes del login automático tras registro', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })

      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'new-user' } }, error: null,
      })
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'new-user', email: 'x@test.com' }, session: {} }, error: null,
      })
      buildChain({ singleData: { rol: 'estudiante' } })

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderApp('/')
      await waitForLogin()
      await goToRegister(user)
      await submitRegisterForm(user)

      vi.advanceTimersByTime(600)

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/student/island')
      )

      vi.useRealTimers()
    })
  })
})
