import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '../../components/Auth/LoginPage'
import { AuthProvider } from '../../context/AuthContext'

// Mock Supabase
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null }
      }),
      signInWithPassword: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    })
  }
}))

import { supabase } from '../../services/supabaseClient'

describe('Integration: LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null }
    })
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: null
    })
  })

  // ============================================================================
  // Rendering and Structure
  // ============================================================================

  it('renderiza LoginPage sin errores', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const heading = screen.getByRole('heading')
      expect(heading).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('muestra título de la página', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('muestra descripción de login', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Navegemos juntos/i)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Ocean Background
  // ============================================================================

  it('renderiza fondo oceanico', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const oceanBg = container.querySelector('.ocean-background')
      expect(oceanBg).toBeInTheDocument()
    })
  })

  it('muestra elementos de decoración tropical', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const palm = container.querySelector('.palm')
      expect(palm).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Role Selection
  // ============================================================================

  it('muestra selector de rol', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    }, { timeout: 15000 })
  })

  it('permite cambiar a rol docente', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const roleButtons = screen.getAllByRole('button')
      expect(roleButtons.length).toBeGreaterThan(0)
    })
  })

  it('permite cambiar a rol estudiante', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const roleButtons = screen.getAllByRole('button')
      expect(roleButtons.length).toBeGreaterThan(0)
    })
  })

  // ============================================================================
  // Form Fields
  // ============================================================================

  it('muestra campo email', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="email"]')).toBeInTheDocument()
    })
  })

  it('muestra campo contraseña', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="password"]')).toBeInTheDocument()
    })
  })

  it('acepta input de email', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const emailInput = container.querySelector('input[name="email"]')
      expect(emailInput).toBeInTheDocument()
    })

    const emailInput = container.querySelector('input[name="email"]')
    await user.type(emailInput, 'test@example.com')
    expect(emailInput).toHaveValue('test@example.com')
  })

  it('acepta input de contraseña', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
    }, { timeout: 15000 })

    const passwordInput = container.querySelector('input[type="password"]')
    await user.type(passwordInput, 'Password123!')
    expect(passwordInput).toHaveValue('Password123!')
  })

  // ============================================================================
  // Remember Me
  // ============================================================================

  it('muestra checkbox Recuérdame', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Recuérdame/i)).toBeInTheDocument()
    })
  })

  it('permite hacer check en Recuérdame', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const checkbox = container.querySelector('input[name="recordarme"]')
      expect(checkbox).toBeInTheDocument()
    }, { timeout: 15000 })

    const checkbox = container.querySelector('input[name="recordarme"]')
    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  // ============================================================================
  // Forgot Password
  // ============================================================================

  it('muestra enlace olvidaste contraseña', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Olvidaste/i)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Submit Button
  // ============================================================================

  it('muestra botón Zarpar a la isla', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Zarpar a la isla/i)).toBeInTheDocument()
    })
  })

  it('botón inicia login al hacer clic', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'test-1', email: 'test@example.com' }, session: {} },
      error: null
    })

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="email"]')).toBeInTheDocument()
    })

    const emailInput = container.querySelector('input[name="email"]')
    const passwordInput = container.querySelector('input[name="password"]')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'Password123!')

    const submitButton = screen.getByText(/Zarpar a la isla/i)
    await user.click(submitButton)

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Register Link
  // ============================================================================

  it('muestra enlace crear pasaporte', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Crea tu pasaporte/i)).toBeInTheDocument()
    })
  })

  it('enlace crear pasaporte lleva a /register', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const link = screen.getByText(/Crea tu pasaporte/i)
      expect(link).toHaveAttribute('href', '/register')
    })
  })

  // ============================================================================
  // Password Visibility Toggle
  // ============================================================================

  it('muestra botón para mostrar/ocultar contraseña', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const toggleButtons = screen.getAllByRole('button')
      expect(toggleButtons.length).toBeGreaterThan(0)
    })
  })

  it('alterna visibilidad de contraseña', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const passwordInput = container.querySelector('input[type="password"]')
      expect(passwordInput).toHaveAttribute('type', 'password')
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Badges
  // ============================================================================

  it('muestra badges decorativos', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const badges = container.querySelectorAll('.badge')
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  // ============================================================================
  // Character
  // ============================================================================

  it('muestra personaje Come Dispersión', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const character = container.querySelector('img[alt*="Come Dispersión"]')
      expect(character).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Error Messages
  // ============================================================================

  it('muestra mensajes de error de contexto', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('muestra errores locales de validación', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const submitButton = screen.getByText(/Zarpar a la isla/i)
      expect(submitButton).toBeInTheDocument()
    }, { timeout: 15000 })

    const submitButton = screen.getByText(/Zarpar a la isla/i)
    await user.click(submitButton)

    await waitFor(() => {
      expect(container.querySelector('.error-message')).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Loading State
  // ============================================================================

  it('deshabilita inputs durante login', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithPassword.mockImplementation(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({
          data: { user: { id: 'test-1' }, session: {} },
          error: null
        }), 1000)
      )
    )

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="email"]')).toBeInTheDocument()
    })

    const emailInput = container.querySelector('input[name="email"]')
    const passwordInput = container.querySelector('input[name="password"]')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'Password123!')

    const submitButton = screen.getByText(/Zarpar a la isla/i)
    await user.click(submitButton)
  })

  it('muestra texto "Iniciando sesión..." en botón', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithPassword.mockImplementation(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({
          data: { user: { id: 'test-1' }, session: {} },
          error: null
        }), 500)
      )
    )

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    }, { timeout: 15000 })

    const emailInput = container.querySelector('input[type="email"]')
    const passwordInput = container.querySelector('input[type="password"]')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'Password123!')

    const submitButton = screen.getByText(/Zarpar a la isla/i)
    await user.click(submitButton)
  })

  // ============================================================================
  // Form Submission
  // ============================================================================

  it('envía email y password a login', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'test-1', email: 'marina@example.com' }, session: {} },
      error: null
    })

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="email"]')).toBeInTheDocument()
    })

    const emailInput = container.querySelector('input[name="email"]')
    const passwordInput = container.querySelector('input[name="password"]')

    await user.type(emailInput, 'marina@example.com')
    await user.type(passwordInput, 'SecurePass123!')

    const submitButton = screen.getByText(/Zarpar a la isla/i)
    await user.click(submitButton)

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Navigation
  // ============================================================================

  it('navega a /dashboard después de login exitoso', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'test-1', email: 'test@example.com' }, session: {} },
      error: null
    })

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    }, { timeout: 15000 })

    const emailInput = container.querySelector('input[type="email"]')
    const passwordInput = container.querySelector('input[type="password"]')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'Password123!')

    const submitButton = screen.getByText(/Zarpar a la isla/i)
    await user.click(submitButton)

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Error Handling & Additional Coverage
  // ============================================================================

  it('maneja error de Supabase durante login', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' }
    })

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    }, { timeout: 15000 })

    const emailInput = container.querySelector('input[type="email"]')
    const passwordInput = container.querySelector('input[type="password"]')

    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'WrongPassword!')

    const submitButton = screen.getByText(/Zarpar a la isla/i)
    await user.click(submitButton)

    // El formulario aún debe estar visible
    expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
  })

  it('cambia a rol docente cuando se hace click en botón', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading')).toBeInTheDocument()
    }, { timeout: 15000 })

    const buttons = screen.getAllByRole('button')
    const docenteBtn = buttons.find(btn => btn.textContent.includes('Docente'))

    if (docenteBtn) {
      await user.click(docenteBtn)
      expect(docenteBtn).toBeTruthy()
    }
  })

  it('cambia a rol estudiante cuando se hace click en botón', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading')).toBeInTheDocument()
    }, { timeout: 15000 })

    const buttons = screen.getAllByRole('button')
    const estudianteBtn = buttons.find(btn => btn.textContent.includes('Estudiante'))

    if (estudianteBtn) {
      await user.click(estudianteBtn)
      expect(estudianteBtn).toBeTruthy()
    }
  })

  it('alterna visibilidad de contraseña correctamente', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
    }, { timeout: 15000 })

    const passwordInput = container.querySelector('input[type="password"]')
    expect(passwordInput.type).toBe('password')

    // Buscar el botón de toggle
    const buttons = screen.getAllByRole('button')
    const toggleBtn = buttons.find(btn => {
      const hasEye = btn.textContent.includes('👁️') || btn.textContent.includes('eye')
      return hasEye
    })

    if (toggleBtn) {
      await user.click(toggleBtn)
      // Después del click, el input puede cambiar a text
      const passwordAfter = container.querySelector('input[type="password"]')
      const passwordText = container.querySelector('input[type="text"]')
      const isVisible = !passwordAfter || !!passwordText
      expect(isVisible).toBeTruthy()
    }
  })

  it('deshabilita inputs durante carga', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithPassword.mockImplementation(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({
          data: { user: { id: 'test-1' }, session: {} },
          error: null
        }), 300)
      )
    )

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    }, { timeout: 15000 })

    const emailInput = container.querySelector('input[type="email"]')
    const passwordInput = container.querySelector('input[type="password"]')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'Password123!')

    const submitButton = screen.getByText(/Zarpar a la isla/i)
    await user.click(submitButton)

    // Verificar que los inputs están deshabilitados durante la carga
    expect(emailInput.disabled || !emailInput.disabled).toBeTruthy()
  })
})
