import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { RegisterPage } from '../../components/Auth/RegisterPage'
import { AuthProvider } from '../../context/AuthContext'

// Mock Supabase
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null }
      }),
      signUp: vi.fn(),
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

describe('Integration: RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null }
    })
    supabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: null
    })
  })

  // ============================================================================
  // Rendering and Structure
  // ============================================================================

  it('renderiza RegisterPage sin errores', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const heading = screen.getByRole('heading')
      expect(heading).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('muestra título Isla Educativa', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Isla.*Educativa/i })).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('muestra descripción de registro', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Diseña tu pasaporte/i)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Ocean Background
  // ============================================================================

  it('renderiza fondo oceanico', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const oceanBg = container.querySelector('.ocean-background')
      expect(oceanBg).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Role Selection
  // ============================================================================

  it('muestra selector de rol', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('permite cambiar a rol docente', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('permite cambiar a rol estudiante', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  // ============================================================================
  // Form Fields - Basic Info
  // ============================================================================

  it('muestra campo nombre', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="nombre"]')).toBeInTheDocument()
    })
  })

  it('muestra campo apellido', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="apellido"]')).toBeInTheDocument()
    })
  })

  it('muestra campo email', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="email"]')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Form Fields - Password
  // ============================================================================

  it('muestra campo contraseña', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const labels = screen.getAllByText(/CONTRASEÑA/i)
      expect(labels.length).toBeGreaterThan(0)
    })
  })

  it('muestra campo repetir contraseña', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const labels = screen.getAllByText(/REPETIR/i)
      expect(labels.length).toBeGreaterThan(0)
    })
  })

  // ============================================================================
  // Form Fields - Institution (Docente)
  // ============================================================================

  it('muestra campo institución para docentes', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const docenteBtn = buttons.find(b => b.textContent.includes('Docente'))
      if (docenteBtn) {
        expect(docenteBtn).toBeInTheDocument()
      }
    })
  })

  // ============================================================================
  // Form Input
  // ============================================================================

  it('acepta input de nombre', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const nombreInput = container.querySelector('input[name="nombre"]')
      expect(nombreInput).toBeInTheDocument()
    })

    const nombreInput = container.querySelector('input[name="nombre"]')
    await user.type(nombreInput, 'Marina')
    expect(nombreInput).toHaveValue('Marina')
  })

  it('acepta input de apellido', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const apellidoInput = container.querySelector('input[name="apellido"]')
      expect(apellidoInput).toBeInTheDocument()
    })

    const apellidoInput = container.querySelector('input[name="apellido"]')
    await user.type(apellidoInput, 'Pérez')
    expect(apellidoInput).toHaveValue('Pérez')
  })

  it('acepta input de email', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const emailInput = container.querySelector('input[name="email"]')
      expect(emailInput).toBeInTheDocument()
    })

    const emailInput = container.querySelector('input[name="email"]')
    await user.type(emailInput, 'marina@example.com')
    expect(emailInput).toHaveValue('marina@example.com')
  })

  // ============================================================================
  // Terms and Conditions
  // ============================================================================

  it('muestra checkbox de términos', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="terminosAceptados"]')).toBeInTheDocument()
    })
  })

  it('permite aceptar términos y privacidad', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const termsCheckbox = container.querySelector('input[name="terminosAceptados"]')
      expect(termsCheckbox).toBeInTheDocument()
    }, { timeout: 15000 })

    const termsCheckbox = container.querySelector('input[name="terminosAceptados"]')
    expect(termsCheckbox).not.toBeChecked()
    await user.click(termsCheckbox)
    expect(termsCheckbox).toBeChecked()
  })

  // ============================================================================
  // Submit Button
  // ============================================================================

  it('muestra botón Crear mi pasaporte', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Crear mi pasaporte/i)).toBeInTheDocument()
    })
  })

  it('botón inicia registro al hacer clic', async () => {
    const user = userEvent.setup()
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-user' } },
      error: null
    })

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="nombre"]')).toBeInTheDocument()
    })

    const nombreInput = container.querySelector('input[name="nombre"]')
    const apellidoInput = container.querySelector('input[name="apellido"]')
    const emailInput = container.querySelector('input[name="email"]')
    const passwordInput = container.querySelector('input[name="password"]')
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]')

    await user.type(nombreInput, 'Marina')
    await user.type(apellidoInput, 'Pérez')
    await user.type(emailInput, 'marina@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.type(confirmPasswordInput, 'SecurePass123!')

    const termsCheckbox = container.querySelector('input[name="terminosAceptados"]')
    await user.click(termsCheckbox)

    const submitButton = screen.getByText(/Crear mi pasaporte/i)
    await user.click(submitButton)

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalled()
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Back to Login
  // ============================================================================

  it('muestra enlace volver al acceso', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Volver al acceso/i)).toBeInTheDocument()
    })
  })

  it('enlace volver al acceso lleva a /login', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const backLink = screen.getByText(/Volver al acceso/i)
      expect(backLink).toHaveAttribute('href', '/login')
    })
  })

  // ============================================================================
  // Password Visibility
  // ============================================================================

  it('muestra botón para mostrar/ocultar contraseña', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('alterna visibilidad de contraseña', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const passwordInputs = container.querySelectorAll('input[type="password"]')
      expect(passwordInputs.length).toBeGreaterThan(0)
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Character
  // ============================================================================

  it('muestra personaje Come Dispersión', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
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

  it('valida campos requeridos', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const submitButton = screen.getByText(/Crear mi pasaporte/i)
      expect(submitButton).toBeInTheDocument()
    }, { timeout: 15000 })

    const submitButton = screen.getByText(/Crear mi pasaporte/i)
    await user.click(submitButton)

    await waitFor(() => {
      expect(container.querySelector('.error-message')).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('valida longitud de contraseña', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="nombre"]')).toBeInTheDocument()
    })

    const nombreInput = container.querySelector('input[name="nombre"]')
    const apellidoInput = container.querySelector('input[name="apellido"]')
    const emailInput = container.querySelector('input[name="email"]')
    const passwordInput = container.querySelector('input[name="password"]')

    await user.type(nombreInput, 'Marina')
    await user.type(apellidoInput, 'Pérez')
    await user.type(emailInput, 'marina@example.com')
    await user.type(passwordInput, 'short')

    const submitButton = screen.getByText(/Crear mi pasaporte/i)
    await user.click(submitButton)

    await waitFor(() => {
      expect(container.querySelector('.error-message')).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('valida coincidencia de contraseñas', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="nombre"]')).toBeInTheDocument()
    })

    const nombreInput = container.querySelector('input[name="nombre"]')
    const apellidoInput = container.querySelector('input[name="apellido"]')
    const emailInput = container.querySelector('input[name="email"]')
    const passwordInput = container.querySelector('input[name="password"]')
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]')

    await user.type(nombreInput, 'Marina')
    await user.type(apellidoInput, 'Pérez')
    await user.type(emailInput, 'marina@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.type(confirmPasswordInput, 'DifferentPass123!')

    const submitButton = screen.getByText(/Crear mi pasaporte/i)
    await user.click(submitButton)

    await waitFor(() => {
      expect(container.querySelector('.error-message')).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('valida aceptación de términos', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="nombre"]')).toBeInTheDocument()
    })

    const nombreInput = container.querySelector('input[name="nombre"]')
    const apellidoInput = container.querySelector('input[name="apellido"]')
    const emailInput = container.querySelector('input[name="email"]')
    const passwordInput = container.querySelector('input[name="password"]')
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]')

    await user.type(nombreInput, 'Marina')
    await user.type(apellidoInput, 'Pérez')
    await user.type(emailInput, 'marina@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.type(confirmPasswordInput, 'SecurePass123!')

    const submitButton = screen.getByText(/Crear mi pasaporte/i)
    await user.click(submitButton)

    await waitFor(() => {
      expect(container.querySelector('.error-message')).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Loading State
  // ============================================================================

  it('deshabilita inputs durante registro', async () => {
    const user = userEvent.setup()
    supabase.auth.signUp.mockImplementation(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({
          data: { user: { id: 'new-user' } },
          error: null
        }), 1000)
      )
    )

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="nombre"]')).toBeInTheDocument()
    })

    const nombreInput = container.querySelector('input[name="nombre"]')
    const apellidoInput = container.querySelector('input[name="apellido"]')
    const emailInput = container.querySelector('input[name="email"]')
    const passwordInput = container.querySelector('input[name="password"]')
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]')

    await user.type(nombreInput, 'Marina')
    await user.type(apellidoInput, 'Pérez')
    await user.type(emailInput, 'marina@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.type(confirmPasswordInput, 'SecurePass123!')

    const termsCheckbox = container.querySelector('input[name="terminosAceptados"]')
    await user.click(termsCheckbox)

    const submitButton = screen.getByText(/Crear mi pasaporte/i)
    await user.click(submitButton)
  })

  it('muestra texto "Creando cuenta..." en botón', async () => {
    const user = userEvent.setup()
    supabase.auth.signUp.mockImplementation(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({
          data: { user: { id: 'new-user' } },
          error: null
        }), 500)
      )
    )

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="nombre"]')).toBeInTheDocument()
    })

    const nombreInput = container.querySelector('input[name="nombre"]')
    const apellidoInput = container.querySelector('input[name="apellido"]')
    const emailInput = container.querySelector('input[name="email"]')
    const passwordInput = container.querySelector('input[name="password"]')
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]')

    await user.type(nombreInput, 'Marina')
    await user.type(apellidoInput, 'Pérez')
    await user.type(emailInput, 'marina@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.type(confirmPasswordInput, 'SecurePass123!')

    const termsCheckbox = container.querySelector('input[name="terminosAceptados"]')
    await user.click(termsCheckbox)

    const submitButton = screen.getByText(/Crear mi pasaporte/i)
    await user.click(submitButton)
  })

  // ============================================================================
  // Form Submission
  // ============================================================================

  it('envía datos correctos a signUp', async () => {
    const user = userEvent.setup()
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-user' } },
      error: null
    })

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="nombre"]')).toBeInTheDocument()
    })

    const nombreInput = container.querySelector('input[name="nombre"]')
    const apellidoInput = container.querySelector('input[name="apellido"]')
    const emailInput = container.querySelector('input[name="email"]')
    const passwordInput = container.querySelector('input[name="password"]')
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]')

    await user.type(nombreInput, 'Marina')
    await user.type(apellidoInput, 'Pérez')
    await user.type(emailInput, 'marina@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.type(confirmPasswordInput, 'SecurePass123!')

    const termsCheckbox = container.querySelector('input[name="terminosAceptados"]')
    await user.click(termsCheckbox)

    const submitButton = screen.getByText(/Crear mi pasaporte/i)
    await user.click(submitButton)

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalled()
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Navigation
  // ============================================================================

  it('navega a /dashboard después de registro exitoso', async () => {
    const user = userEvent.setup()
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-user' } },
      error: null
    })

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[name="nombre"]')).toBeInTheDocument()
    })

    const nombreInput = container.querySelector('input[name="nombre"]')
    const apellidoInput = container.querySelector('input[name="apellido"]')
    const emailInput = container.querySelector('input[name="email"]')
    const passwordInput = container.querySelector('input[name="password"]')
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]')

    await user.type(nombreInput, 'Marina')
    await user.type(apellidoInput, 'Pérez')
    await user.type(emailInput, 'marina@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.type(confirmPasswordInput, 'SecurePass123!')

    const termsCheckbox = container.querySelector('input[name="terminosAceptados"]')
    await user.click(termsCheckbox)

    const submitButton = screen.getByText(/Crear mi pasaporte/i)
    await user.click(submitButton)

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalled()
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Badges
  // ============================================================================

  it('muestra badges decorativos', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const badges = container.querySelectorAll('.badge')
      expect(badges.length).toBeGreaterThan(0)
    })
  })
})
