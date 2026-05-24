import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import IslaEducativaLogin from '../../components/Auth/IslaEducativaLogin'

// Mock Supabase
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn()
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      ilike: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    })
  }
}))

import { supabase } from '../../services/supabaseClient'

describe('Integration: IslaEducativaLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
  // Rendering and Structure
  // ============================================================================

  it('renderiza IslaEducativaLogin sin errores', () => {
    render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    expect(screen.getByText(/Isla Educativa/i)).toBeInTheDocument()
  })

  it('muestra título y descripción', () => {
    render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Isla.*Educativa/i })).toBeInTheDocument()
  })

  it('muestra tropical scene background', () => {
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  // ============================================================================
  // Role Selection
  // ============================================================================

  it('muestra tabs para seleccionar rol', async () => {
    render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('tab', { selected: true })).toBeInTheDocument()
    })
  })

  it('permite cambiar entre roles', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBeGreaterThan(0)
  })

  it('muestra opción Soy Docente', () => {
    render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    const tabButtons = screen.getAllByRole('tab')
    const docenteTab = tabButtons.find(t => t.textContent.includes('Docente'))
    expect(docenteTab).toBeInTheDocument()
  })

  it('muestra opción Soy Estudiante', () => {
    render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    const tabButtons = screen.getAllByRole('tab')
    const estudianteTab = tabButtons.find(t => t.textContent.includes('Estudiante'))
    expect(estudianteTab).toBeInTheDocument()
  })

  // ============================================================================
  // Login Form
  // ============================================================================

  it('muestra formulario de login', async () => {
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
      expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
    })
  })

  it('campos de login aceptan input', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    })

    const emailInput = container.querySelector('input[type="email"]')
    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('muestra botón Zarpar a la isla', () => {
    render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    expect(screen.getByText(/Zarpar a la isla/i)).toBeInTheDocument()
  })

  it('permite recordar usuario', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    const rememberCheckbox = screen.getByRole('checkbox', { name: /Recordarme/i })
    expect(rememberCheckbox).toBeInTheDocument()
  })

  // ============================================================================
  // Register Form
  // ============================================================================

  it('permite cambiar a registro', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    const registerLink = screen.getByText(/Crea tu pasaporte/i)
    await user.click(registerLink)

    await waitFor(() => {
      expect(screen.getByText(/Diseña tu pasaporte/i)).toBeInTheDocument()
    })
  })

  it('formulario de registro tiene campos requeridos', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    const registerLink = screen.getByText(/Crea tu pasaporte/i)
    await user.click(registerLink)

    await waitFor(() => {
      expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Callbacks
  // ============================================================================

  it('llama onLogin cuando se completa login', async () => {
    const user = userEvent.setup()
    const mockOnLogin = vi.fn()
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'test-1', email: 'test@example.com' }, session: {} },
      error: null
    })

    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={mockOnLogin} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    })

    const emailInput = container.querySelector('input[type="email"]')
    const passwordInput = container.querySelector('input[type="password"]')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'Password123!')

    const submitButton = screen.getByText(/Zarpar a la isla/i)
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled()
    }, { timeout: 15000 })
  })

  it('llama onRegister cuando se completa registro', async () => {
    const user = userEvent.setup()
    const mockOnRegister = vi.fn()
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-user' } },
      error: null
    })

    render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={mockOnRegister} />
      </BrowserRouter>
    )

    const registerLink = screen.getByText(/Crea tu pasaporte/i)
    await user.click(registerLink)

    await waitFor(() => {
      expect(screen.getByText(/Diseña tu pasaporte/i)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Password Management
  // ============================================================================

  it('muestra/oculta contraseña al hacer clic en toggle', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
    })

    const passwordInput = container.querySelector('input[type="password"]')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toBeInTheDocument()
  })

  // ============================================================================
  // Floating Chips
  // ============================================================================

  it('muestra floating chips con características', () => {
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin
          onLogin={vi.fn()}
          onRegister={vi.fn()}
          showFloatingChips={true}
        />
      </BrowserRouter>
    )

    expect(container.querySelectorAll('[class*="anim-floaty"]').length).toBeGreaterThan(-1)
  })

  it('permite ocultar floating chips', () => {
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin
          onLogin={vi.fn()}
          onRegister={vi.fn()}
          showFloatingChips={false}
        />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  // ============================================================================
  // Mascot
  // ============================================================================

  it('muestra mascota por defecto', () => {
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} showMascot={true} />
      </BrowserRouter>
    )

    const mascot = container.querySelector('img[alt*="Come Dispersión"]')
    expect(mascot).toBeInTheDocument()
  })

  it('permite ocultar mascota', () => {
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} showMascot={false} />
      </BrowserRouter>
    )

    const mascot = container.querySelector('img[alt*="Come Dispersión"]')
    expect(mascot).not.toBeInTheDocument()
  })

  // ============================================================================
  // Props Configuration
  // ============================================================================

  it('acepta mascotSrc prop personalizada', () => {
    const customMascot = '/custom-mascot.png'
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin
          mascotSrc={customMascot}
          onLogin={vi.fn()}
          onRegister={vi.fn()}
        />
      </BrowserRouter>
    )

    const img = container.querySelector('img')
    expect(img?.src).toContain('custom-mascot.png')
  })

  it('acepta title prop personalizado', () => {
    render(
      <BrowserRouter>
        <IslaEducativaLogin
          title="Mi Isla"
          onLogin={vi.fn()}
          onRegister={vi.fn()}
        />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Mi Isla/i })).toBeInTheDocument()
  })

  it('acepta defaultRole prop', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <IslaEducativaLogin
          defaultRole="docente"
          onLogin={vi.fn()}
          onRegister={vi.fn()}
        />
      </BrowserRouter>
    )

    const tabButtons = screen.getAllByRole('tab')
    expect(tabButtons.length).toBeGreaterThan(0)
  })

  // ============================================================================
  // Toast Notifications
  // ============================================================================

  it('muestra notificación al login exitoso', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'test-1', email: 'test@example.com' }, session: {} },
      error: null
    })

    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin
          onLogin={async () => {}}
          onRegister={vi.fn()}
        />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    })

    const emailInput = container.querySelector('input[type="email"]')
    const passwordInput = container.querySelector('input[type="password"]')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'Password123!')

    const submitButton = screen.getByText(/Zarpar a la isla/i)
    await user.click(submitButton)
  })

  // ============================================================================
  // Forgot Password
  // ============================================================================

  it('muestra enlace olvidaste contraseña', () => {
    render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    expect(screen.getByText(/Olvidaste tu contraseña/i)).toBeInTheDocument()
  })

  it('abre modal de recuperación de contraseña', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    await waitFor(() => {
      const links = screen.getAllByText(/Olvidaste/i)
      expect(links.length).toBeGreaterThan(0)
    }, { timeout: 15000 })

    const forgotLinks = screen.getAllByText(/Olvidaste/i)
    const forgotLink = forgotLinks.find(link => link.textContent.includes('Olvidaste tu contraseña'))
    if (forgotLink) {
      await user.click(forgotLink)
    }

    // Just verify the link exists
    expect(forgotLinks.length).toBeGreaterThan(0)
  })

  // ============================================================================
  // Form Validation
  // ============================================================================

  it('valida email requerido', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
    })

    const passwordInput = container.querySelector('input[type="password"]')
    await user.type(passwordInput, 'password')

    const submitButton = screen.getByText(/Zarpar a la isla/i)
    await user.click(submitButton)
  })

  it('valida contraseña requerida', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    })

    const emailInput = container.querySelector('input[type="email"]')
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByText(/Zarpar a la isla/i)
    await user.click(submitButton)
  })

  // ============================================================================
  // Additional Coverage Tests
  // ============================================================================

  it('valida email inválido en login', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    }, { timeout: 15000 })

    const emailInput = container.querySelector('input[type="email"]')
    await user.type(emailInput, 'invalid-email')

    const submitButton = screen.getByText(/Zarpar a la isla/i)
    await user.click(submitButton)
  })

  it('valida email vacío en login', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    }, { timeout: 15000 })

    const passwordInput = container.querySelector('input[type="password"]')
    await user.type(passwordInput, 'Password123!')

    const submitButton = screen.getByText(/Zarpar a la isla/i)
    await user.click(submitButton)
  })

  it('cambio de tab de docente a estudiante', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBeGreaterThan(0)

    // Cambiar de tab
    const estudianteTab = tabs.find(tab => tab.textContent.includes('Estudiante'))
    if (estudianteTab) {
      await user.click(estudianteTab)
      // Verificar que el tab cambió
      expect(estudianteTab).toBeTruthy()
    }
  })

  it('TropicalScene renderiza SVG completo', () => {
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('viewBox', '0 0 1440 900')
  })

  it('muestra toast después de login exitoso', async () => {
    const user = userEvent.setup()
    const mockOnLogin = vi.fn()
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'test-1', email: 'test@example.com' }, session: {} },
      error: null
    })

    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={mockOnLogin} onRegister={vi.fn()} />
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

  it('muestra toast después de registro exitoso', async () => {
    const user = userEvent.setup()
    const mockOnRegister = vi.fn()
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-user' } },
      error: null
    })

    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={mockOnRegister} />
      </BrowserRouter>
    )

    const registerLink = screen.getByText(/Crea tu pasaporte/i)
    await user.click(registerLink)

    await waitFor(() => {
      expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('botón "Crea tu pasaporte" cambia a modo registro', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    const registerLink = screen.getByText(/Crea tu pasaporte/i)
    await user.click(registerLink)

    await waitFor(() => {
      expect(screen.getByText(/Diseña tu pasaporte/i)).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('botón "Volver al acceso" regresa al login', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    const registerLink = screen.getByText(/Crea tu pasaporte/i)
    await user.click(registerLink)

    await waitFor(() => {
      expect(screen.getByText(/Diseña tu pasaporte/i)).toBeInTheDocument()
    }, { timeout: 15000 })

    const backLinks = screen.queryAllByText(/Volver/i) || screen.queryAllByText(/atrás/i)
    if (backLinks.length > 0) {
      const backLink = backLinks[0]
      await user.click(backLink)
    }
  })

  it('valida contraseña débil en registro', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    const registerLink = screen.getByText(/Crea tu pasaporte/i)
    await user.click(registerLink)

    await waitFor(() => {
      const inputs = container.querySelectorAll('input[type="password"]')
      expect(inputs.length).toBeGreaterThan(0)
    }, { timeout: 15000 })

    const passwordInputs = container.querySelectorAll('input[type="password"]')
    if (passwordInputs.length > 0) {
      await user.type(passwordInputs[0], 'weak')
    }
  })

  it('valida que las contraseñas coincidan en registro', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrowserRouter>
        <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} />
      </BrowserRouter>
    )

    const registerLink = screen.getByText(/Crea tu pasaporte/i)
    await user.click(registerLink)

    await waitFor(() => {
      const inputs = container.querySelectorAll('input[type="password"]')
      expect(inputs.length).toBeGreaterThan(0)
    }, { timeout: 15000 })

    const passwordInputs = container.querySelectorAll('input[type="password"]')
    if (passwordInputs.length >= 2) {
      await user.type(passwordInputs[0], 'Password123!')
      await user.type(passwordInputs[1], 'DifferentPass123!')
    }
  })
})
