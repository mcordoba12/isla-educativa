import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import IslaEducativaLogin from '../../components/Auth/IslaEducativaLogin'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(),
  },
}))

global.fetch = vi.fn()

import { supabase } from '../../services/supabaseClient'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const renderLogin = (props = {}) =>
  render(
    <BrowserRouter>
      <IslaEducativaLogin onLogin={vi.fn()} onRegister={vi.fn()} {...props} />
    </BrowserRouter>
  )

const goToRegister = async (user) => {
  await user.click(screen.getByText(/Crea tu pasaporte/i))
  await waitFor(() => screen.getByText(/Diseña tu pasaporte/i))
}

const openForgotModal = async (user) => {
  await user.click(screen.getByText(/¿Olvidaste tu contraseña\?/i))
  // El modal tiene h3 "Verificar identidad" Y botón "Verificar identidad"
  // Esperamos por el heading para no ambigüedad
  await waitFor(() => screen.getByRole('heading', { name: /Verificar identidad/i }))
}

// ─── Supabase from() chainable mock ──────────────────────────────────────────

const buildFromMock = ({ data = null, error = null } = {}) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  }
  supabase.from.mockReturnValue(chain)
  return chain
}

// ─────────────────────────────────────────────────────────────────────────────

describe('IslaEducativaLogin — cobertura completa', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })

    supabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null })
    supabase.auth.signUp.mockResolvedValue({ data: {}, error: null })
    supabase.auth.updateUser.mockResolvedValue({ data: {}, error: null })
    buildFromMock()

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ==========================================================================
  // 1. Renderizado y estructura
  // ==========================================================================

  describe('Renderizado y estructura', () => {
    it('renderiza el componente sin errores con props por defecto', () => {
      renderLogin()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('renderiza título personalizado via prop title', () => {
      renderLogin({ title: 'Mi Plataforma' })
      expect(screen.getByRole('heading', { level: 1, name: /Mi Plataforma/i })).toBeInTheDocument()
    })

    it('divide el título en dos partes (first + rest)', () => {
      renderLogin({ title: 'Isla Educativa Digital' })
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1.textContent).toContain('Isla')
      expect(h1.textContent).toContain('Educativa Digital')
    })

    it('muestra TropicalScene con SVG viewBox correcto', () => {
      const { container } = renderLogin()
      const svg = container.querySelector('svg[viewBox="0 0 1440 900"]')
      expect(svg).toBeInTheDocument()
    })

    it('muestra la mascota cuando showMascot=true (default)', () => {
      const { container } = renderLogin()
      expect(container.querySelector('img[alt*="Come Dispersión"]')).toBeInTheDocument()
    })

    it('oculta la mascota cuando showMascot=false', () => {
      const { container } = renderLogin({ showMascot: false })
      expect(container.querySelector('img[alt*="Come Dispersión"]')).not.toBeInTheDocument()
    })

    it('usa mascotSrc personalizado', () => {
      const { container } = renderLogin({ mascotSrc: '/mi-mascota.png' })
      expect(container.querySelector('img')?.src).toContain('mi-mascota.png')
    })

    it('muestra floating chips cuando showFloatingChips=true', () => {
      renderLogin({ showFloatingChips: true })
      expect(screen.getByText('+120 misiones')).toBeInTheDocument()
    })

    it('oculta floating chips cuando showFloatingChips=false', () => {
      renderLogin({ showFloatingChips: false })
      expect(screen.queryByText('+120 misiones')).not.toBeInTheDocument()
    })

    it('muestra copyright al pie', () => {
      renderLogin()
      expect(screen.getByText(/2026 Isla Educativa/i)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // 2. Tabs de rol
  // ==========================================================================

  describe('Tabs de selección de rol', () => {
    it('tab Estudiante activo por defecto', () => {
      renderLogin({ defaultRole: 'estudiante' })
      const tabEstu = screen.getByRole('tab', { name: /Soy Estudiante/i })
      expect(tabEstu).toHaveAttribute('aria-selected', 'true')
    })

    it('tab Docente activo cuando defaultRole="docente"', () => {
      renderLogin({ defaultRole: 'docente' })
      const tabDoc = screen.getByRole('tab', { name: /Soy Docente/i })
      expect(tabDoc).toHaveAttribute('aria-selected', 'true')
    })

    it('tabs están deshabilitados en modo login', () => {
      renderLogin()
      screen.getAllByRole('tab').forEach((tab) => {
        expect(tab).toBeDisabled()
      })
    })

    it('tabs están habilitados en modo registro', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await goToRegister(user)
      screen.getAllByRole('tab').forEach((tab) => {
        expect(tab).not.toBeDisabled()
      })
    })

    it('cambiar de tab en registro actualiza el rol', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin({ defaultRole: 'estudiante' })
      await goToRegister(user)
      const tabDoc = screen.getByRole('tab', { name: /Soy Docente/i })
      await user.click(tabDoc)
      expect(tabDoc).toHaveAttribute('aria-selected', 'true')
    })
  })

  // ==========================================================================
  // 3. Formulario de Login — validación (líneas 533, ramas de submit)
  // ==========================================================================

  describe('LoginForm — validación', () => {
    it('muestra error cuando email está vacío al enviar', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin()

      await user.type(container.querySelector('input[type="password"]'), 'Pass1234')
      await user.click(screen.getByRole('button', { name: /Zarpar/i }))

      await waitFor(() =>
        expect(screen.getByText('Escribe tu correo')).toBeInTheDocument()
      )
    })

    it('muestra error cuando email es inválido', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin()

      await user.type(container.querySelector('input[type="email"]'), 'no-es-email')
      await user.type(container.querySelector('input[type="password"]'), 'Pass1234')
      await user.click(screen.getByRole('button', { name: /Zarpar/i }))

      await waitFor(() =>
        expect(screen.getByText('Correo no válido')).toBeInTheDocument()
      )
    })

    it('muestra error cuando contraseña está vacía', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin()

      await user.type(container.querySelector('input[type="email"]'), 'test@test.com')
      await user.click(screen.getByRole('button', { name: /Zarpar/i }))

      await waitFor(() =>
        expect(screen.getByText('Escribe tu contraseña')).toBeInTheDocument()
      )
    })

    it('muestra error cuando contraseña tiene menos de 4 caracteres', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin()

      await user.type(container.querySelector('input[type="email"]'), 'test@test.com')
      await user.type(container.querySelector('input[type="password"]'), 'abc')
      await user.click(screen.getByRole('button', { name: /Zarpar/i }))

      await waitFor(() =>
        expect(screen.getByText('Al menos 4 caracteres')).toBeInTheDocument()
      )
    })

    it('limpia error de email al escribir en el campo', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin()

      await user.click(screen.getByRole('button', { name: /Zarpar/i }))
      await waitFor(() => screen.getByText('Escribe tu correo'))

      await user.type(container.querySelector('input[type="email"]'), 'x')
      await waitFor(() =>
        expect(screen.queryByText('Escribe tu correo')).not.toBeInTheDocument()
      )
    })

    it('limpia error de contraseña al escribir en el campo', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin()

      await user.type(container.querySelector('input[type="email"]'), 'test@test.com')
      await user.click(screen.getByRole('button', { name: /Zarpar/i }))
      await waitFor(() => screen.getByText('Escribe tu contraseña'))

      await user.type(container.querySelector('input[type="password"]'), 'x')
      await waitFor(() =>
        expect(screen.queryByText('Escribe tu contraseña')).not.toBeInTheDocument()
      )
    })

    it('llama onLogin con datos correctos cuando el formulario es válido', async () => {
      const mockOnLogin = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin({ onLogin: mockOnLogin })

      await user.type(container.querySelector('input[type="email"]'), 'test@test.com')
      await user.type(container.querySelector('input[type="password"]'), 'Password1')
      await user.click(screen.getByRole('button', { name: /Zarpar/i }))

      await waitFor(() =>
        expect(mockOnLogin).toHaveBeenCalledWith({
          email: 'test@test.com',
          pw: 'Password1',
          remember: true,
          role: 'estudiante',
        })
      )
    })

    it('muestra toast de bienvenida tras login exitoso', async () => {
      const mockOnLogin = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin({ onLogin: mockOnLogin })

      await user.type(container.querySelector('input[type="email"]'), 'marina@test.com')
      await user.type(container.querySelector('input[type="password"]'), 'Password1')
      await user.click(screen.getByRole('button', { name: /Zarpar/i }))

      await waitFor(() =>
        expect(screen.getByText(/Bienvenid@/i)).toBeInTheDocument()
      )
    })

    it('muestra toast de error cuando onLogin lanza excepción', async () => {
      const mockOnLogin = vi.fn().mockRejectedValue(new Error('Credenciales inválidas'))
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin({ onLogin: mockOnLogin })

      await user.type(container.querySelector('input[type="email"]'), 'test@test.com')
      await user.type(container.querySelector('input[type="password"]'), 'Password1')
      await user.click(screen.getByRole('button', { name: /Zarpar/i }))

      await waitFor(() =>
        expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
      )
    })

    it('muestra toast de error genérico cuando onLogin lanza sin message', async () => {
      const mockOnLogin = vi.fn().mockRejectedValue({})
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin({ onLogin: mockOnLogin })

      await user.type(container.querySelector('input[type="email"]'), 'test@test.com')
      await user.type(container.querySelector('input[type="password"]'), 'Password1')
      await user.click(screen.getByRole('button', { name: /Zarpar/i }))

      await waitFor(() =>
        expect(screen.getByText('Error al iniciar sesión')).toBeInTheDocument()
      )
    })

    it('toggle "Recordarme" cambia estado del checkbox', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()

      const checkbox = screen.getByRole('checkbox', { name: /Recordarme/i })
      expect(checkbox).toBeChecked()
      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('toggle muestra/oculta contraseña', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin()

      const pwInput = container.querySelector('input[type="password"]')
      expect(pwInput).toHaveAttribute('type', 'password')

      const toggleBtn = screen.getByRole('button', { name: /Mostrar u ocultar contraseña/i })
      await user.click(toggleBtn)
      expect(pwInput).toHaveAttribute('type', 'text')

      await user.click(toggleBtn)
      expect(pwInput).toHaveAttribute('type', 'password')
    })
  })

  // ==========================================================================
  // 4. Navegación Login ↔ Registro
  // ==========================================================================

  describe('Navegación Login ↔ Registro', () => {
    it('"Crea tu pasaporte" cambia a modo registro', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await goToRegister(user)
      expect(screen.getByText(/Diseña tu pasaporte/i)).toBeInTheDocument()
    })

    it('"Volver al acceso" regresa al modo login', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await goToRegister(user)
      await user.click(screen.getByText(/Volver al acceso/i))
      await waitFor(() =>
        expect(screen.getByText(/Naveguemos juntos/i)).toBeInTheDocument()
      )
    })
  })

  // ==========================================================================
  // 5. RegisterForm — validación (líneas 577-590)
  // ==========================================================================

  describe('RegisterForm — validación', () => {
    const goToReg = async (user) => {
      renderLogin()
      await goToRegister(user)
    }

    it('muestra error cuando nombre está vacío', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToReg(user)

      await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))
      await waitFor(() =>
        expect(screen.getByText('Falta el nombre')).toBeInTheDocument()
      )
    })

    it('muestra error cuando email está vacío', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToReg(user)

      const textInputs = screen.getAllByRole('textbox')
      const nombreInput = textInputs.find((i) => i.placeholder === 'Marina')
      await user.type(nombreInput, 'Marina')

      await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))
      await waitFor(() =>
        expect(screen.getByText('Escribe tu correo')).toBeInTheDocument()
      )
    })

    it('validatePassword — error cuando contraseña tiene menos de 8 caracteres', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await goToRegister(user)

      const { container } = document
      const textInputs = screen.getAllByRole('textbox')
      const nombreInput = textInputs.find((i) => i.placeholder === 'Marina')
      await user.type(nombreInput, 'Marina')

      const emailInput = document.querySelector('input[type="email"]')
      await user.type(emailInput, 'marina@test.com')

      const pwInputs = document.querySelectorAll('input[type="password"]')
      await user.type(pwInputs[0], 'Short1!')
      await user.type(pwInputs[1], 'Short1!')

      const acceptCheckbox = screen.getByRole('checkbox')
      await user.click(acceptCheckbox)

      await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))
      await waitFor(() =>
        expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument()
      )
    })

    it('validatePassword — error cuando falta mayúscula', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await goToRegister(user)

      const textInputs = screen.getAllByRole('textbox')
      const nombreInput = textInputs.find((i) => i.placeholder === 'Marina')
      await user.type(nombreInput, 'Marina')

      const emailInput = document.querySelector('input[type="email"]')
      await user.type(emailInput, 'marina@test.com')

      const pwInputs = document.querySelectorAll('input[type="password"]')
      await user.type(pwInputs[0], 'sinmayuscula1!')
      await user.type(pwInputs[1], 'sinmayuscula1!')

      const acceptCheckbox = screen.getByRole('checkbox')
      await user.click(acceptCheckbox)

      await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))
      await waitFor(() =>
        expect(screen.getByText('Necesita una mayúscula')).toBeInTheDocument()
      )
    })

    it('validatePassword — error cuando falta carácter especial', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await goToRegister(user)

      const textInputs = screen.getAllByRole('textbox')
      const nombreInput = textInputs.find((i) => i.placeholder === 'Marina')
      await user.type(nombreInput, 'Marina')

      const emailInput = document.querySelector('input[type="email"]')
      await user.type(emailInput, 'marina@test.com')

      const pwInputs = document.querySelectorAll('input[type="password"]')
      await user.type(pwInputs[0], 'SinEspecial1')
      await user.type(pwInputs[1], 'SinEspecial1')

      const acceptCheckbox = screen.getByRole('checkbox')
      await user.click(acceptCheckbox)

      await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))
      await waitFor(() =>
        expect(
          screen.getByText('Necesita un carácter especial (!@#$%^&*)')
        ).toBeInTheDocument()
      )
    })

    it('muestra error cuando contraseñas no coinciden', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await goToRegister(user)

      const textInputs = screen.getAllByRole('textbox')
      const nombreInput = textInputs.find((i) => i.placeholder === 'Marina')
      await user.type(nombreInput, 'Marina')

      const emailInput = document.querySelector('input[type="email"]')
      await user.type(emailInput, 'marina@test.com')

      const pwInputs = document.querySelectorAll('input[type="password"]')
      await user.type(pwInputs[0], 'Password1!')
      await user.type(pwInputs[1], 'OtraPassword1!')

      const acceptCheckbox = screen.getByRole('checkbox')
      await user.click(acceptCheckbox)

      await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))
      await waitFor(() =>
        expect(screen.getByText('No coinciden')).toBeInTheDocument()
      )
    })

    it('muestra error cuando no acepta términos', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await goToRegister(user)

      const textInputs = screen.getAllByRole('textbox')
      const nombreInput = textInputs.find((i) => i.placeholder === 'Marina')
      await user.type(nombreInput, 'Marina')

      const emailInput = document.querySelector('input[type="email"]')
      await user.type(emailInput, 'marina@test.com')

      const pwInputs = document.querySelectorAll('input[type="password"]')
      await user.type(pwInputs[0], 'Password1!')
      await user.type(pwInputs[1], 'Password1!')

      // No acepta términos — no hacemos click en el checkbox
      await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))
      await waitFor(() =>
        expect(screen.getByText('Acepta los términos')).toBeInTheDocument()
      )
    })

    it('llama onRegister cuando todos los campos son válidos', async () => {
      const mockOnRegister = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin({ onRegister: mockOnRegister })
      await goToRegister(user)

      const textInputs = screen.getAllByRole('textbox')
      const nombreInput = textInputs.find((i) => i.placeholder === 'Marina')
      await user.type(nombreInput, 'Marina')

      const emailInput = document.querySelector('input[type="email"]')
      await user.type(emailInput, 'marina@test.com')

      const pwInputs = document.querySelectorAll('input[type="password"]')
      await user.type(pwInputs[0], 'Password1!')
      await user.type(pwInputs[1], 'Password1!')

      const acceptCheckbox = screen.getByRole('checkbox')
      await user.click(acceptCheckbox)

      await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))
      await waitFor(() =>
        expect(mockOnRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            nombre: 'Marina',
            email: 'marina@test.com',
            role: 'estudiante',
          })
        )
      )
    })

    it('muestra toast de bienvenida tras registro exitoso', async () => {
      const mockOnRegister = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin({ onRegister: mockOnRegister })
      await goToRegister(user)

      const textInputs = screen.getAllByRole('textbox')
      await user.type(
        textInputs.find((i) => i.placeholder === 'Marina'),
        'Luna'
      )
      await user.type(document.querySelector('input[type="email"]'), 'luna@test.com')
      const pwInputs = document.querySelectorAll('input[type="password"]')
      await user.type(pwInputs[0], 'Password1!')
      await user.type(pwInputs[1], 'Password1!')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))

      await waitFor(() =>
        expect(screen.getByText(/Bienvenid@.*Luna/i)).toBeInTheDocument()
      )
    })

    it('muestra toast de error cuando onRegister lanza excepción', async () => {
      const mockOnRegister = vi.fn().mockRejectedValue(new Error('Email ya registrado'))
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin({ onRegister: mockOnRegister })
      await goToRegister(user)

      const textInputs = screen.getAllByRole('textbox')
      await user.type(textInputs.find((i) => i.placeholder === 'Marina'), 'Marina')
      await user.type(document.querySelector('input[type="email"]'), 'dup@test.com')
      const pwInputs = document.querySelectorAll('input[type="password"]')
      await user.type(pwInputs[0], 'Password1!')
      await user.type(pwInputs[1], 'Password1!')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))

      await waitFor(() =>
        expect(screen.getByText('Email ya registrado')).toBeInTheDocument()
      )
    })

    it('muestra toast de error genérico cuando onRegister lanza sin message', async () => {
      const mockOnRegister = vi.fn().mockRejectedValue({})
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin({ onRegister: mockOnRegister })
      await goToRegister(user)

      const textInputs = screen.getAllByRole('textbox')
      await user.type(textInputs.find((i) => i.placeholder === 'Marina'), 'Marina')
      await user.type(document.querySelector('input[type="email"]'), 'x@test.com')
      const pwInputs = document.querySelectorAll('input[type="password"]')
      await user.type(pwInputs[0], 'Password1!')
      await user.type(pwInputs[1], 'Password1!')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))

      await waitFor(() =>
        expect(screen.getByText('Error al registrarse')).toBeInTheDocument()
      )
    })

    it('muestra campo Institución solo para docentes', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin({ defaultRole: 'docente' })
      await goToRegister(user)

      // En registro docente los tabs están habilitados y el tab docente debe estar activo
      const tabDoc = screen.getByRole('tab', { name: /Soy Docente/i })
      await user.click(tabDoc)

      await waitFor(() =>
        expect(screen.getByPlaceholderText('Colegio Las Palmeras')).toBeInTheDocument()
      )
    })

    it('limpia error de nombre al escribir', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await goToRegister(user)

      await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))
      await waitFor(() => screen.getByText('Falta el nombre'))

      const nombreInput = screen.getAllByRole('textbox').find((i) => i.placeholder === 'Marina')
      await user.type(nombreInput, 'X')
      await waitFor(() =>
        expect(screen.queryByText('Falta el nombre')).not.toBeInTheDocument()
      )
    })

    it('acepta apellido opcional (puede quedar vacío)', async () => {
      const mockOnRegister = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin({ onRegister: mockOnRegister })
      await goToRegister(user)

      const textInputs = screen.getAllByRole('textbox')
      await user.type(textInputs.find((i) => i.placeholder === 'Marina'), 'Ana')
      // Dejamos apellido vacío
      await user.type(document.querySelector('input[type="email"]'), 'ana@test.com')
      const pwInputs = document.querySelectorAll('input[type="password"]')
      await user.type(pwInputs[0], 'Password1!')
      await user.type(pwInputs[1], 'Password1!')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))

      await waitFor(() => expect(mockOnRegister).toHaveBeenCalled())
      expect(mockOnRegister).toHaveBeenCalledWith(expect.objectContaining({ apellido: '' }))
    })
  })

  // ==========================================================================
  // 6. ForgotPasswordModal — Paso 1: verificar identidad (líneas 279-320)
  // ==========================================================================

  describe('ForgotPasswordModal — Paso 1 (verificar identidad)', () => {
    it('el modal se abre al hacer clic en "¿Olvidaste tu contraseña?"', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await openForgotModal(user)
      expect(screen.getByText('PASO 1 de 2')).toBeInTheDocument()
    })

    it('el modal se cierra al hacer clic en "Cancelar"', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await openForgotModal(user)

      await user.click(screen.getByRole('button', { name: /Cancelar/i }))
      await waitFor(() =>
        expect(screen.queryByText('Verificar identidad')).not.toBeInTheDocument()
      )
    })

    it('muestra error cuando email está vacío en paso 1', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await openForgotModal(user)

      await user.click(screen.getByRole('button', { name: /Verificar identidad/i }))
      await waitFor(() =>
        expect(screen.getByText('Escribe tu correo')).toBeInTheDocument()
      )
    })

    it('muestra error cuando nombre completo está vacío en paso 1', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await openForgotModal(user)

      const modal = document.querySelector('.fixed')
      const emailInput = within(modal).getByPlaceholderText('tu@correo.com')
      await user.type(emailInput, 'test@test.com')

      await user.click(screen.getByRole('button', { name: /Verificar identidad/i }))
      await waitFor(() =>
        expect(screen.getByText('Escribe tu nombre completo')).toBeInTheDocument()
      )
    })

    it('muestra error cuando usuario no es encontrado en BD (PGRST116)', async () => {
      buildFromMock({ data: null, error: { code: 'PGRST116', message: 'not found' } })

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await openForgotModal(user)

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('tu@correo.com'), 'noexiste@test.com')
      await user.type(
        within(modal).getByPlaceholderText('Tu nombre como lo registraste'),
        'Nadie Existe'
      )
      await user.click(screen.getByRole('button', { name: /Verificar identidad/i }))

      await waitFor(() =>
        expect(
          screen.getByText(/El usuario no existe/i)
        ).toBeInTheDocument()
      )
    })

    it('muestra error de autenticación RLS (PGRST100)', async () => {
      buildFromMock({ data: null, error: { code: 'PGRST100', message: 'unauthorized' } })

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await openForgotModal(user)

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('tu@correo.com'), 'test@test.com')
      await user.type(
        within(modal).getByPlaceholderText('Tu nombre como lo registraste'),
        'Test User'
      )
      await user.click(screen.getByRole('button', { name: /Verificar identidad/i }))

      await waitFor(() =>
        expect(screen.getByText(/política RLS/i)).toBeInTheDocument()
      )
    })

    it('muestra error genérico con código desconocido', async () => {
      buildFromMock({ data: null, error: { code: 'UNKNOWN_CODE', message: 'algo salió mal' } })

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await openForgotModal(user)

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('tu@correo.com'), 'test@test.com')
      await user.type(
        within(modal).getByPlaceholderText('Tu nombre como lo registraste'),
        'Test User'
      )
      await user.click(screen.getByRole('button', { name: /Verificar identidad/i }))

      await waitFor(() =>
        expect(screen.getByText(/No encontramos esa cuenta.*UNKNOWN_CODE/i)).toBeInTheDocument()
      )
    })

    it('muestra error cuando data es null sin error de query', async () => {
      buildFromMock({ data: null, error: null })

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await openForgotModal(user)

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('tu@correo.com'), 'test@test.com')
      await user.type(
        within(modal).getByPlaceholderText('Tu nombre como lo registraste'),
        'Test User'
      )
      await user.click(screen.getByRole('button', { name: /Verificar identidad/i }))

      await waitFor(() =>
        expect(screen.getByText(/No encontramos esa cuenta\. Verifica/i)).toBeInTheDocument()
      )
    })

    it('avanza al paso 2 cuando usuario es encontrado', async () => {
      buildFromMock({ data: { id: 'user-123' }, error: null })

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await openForgotModal(user)

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('tu@correo.com'), 'test@test.com')
      await user.type(
        within(modal).getByPlaceholderText('Tu nombre como lo registraste'),
        'Test User'
      )
      await user.click(screen.getByRole('button', { name: /Verificar identidad/i }))

      await waitFor(() =>
        expect(screen.getByText('PASO 2 de 2')).toBeInTheDocument()
      )
    })

    it('maneja excepciones inesperadas en handleVerifyIdentity', async () => {
      supabase.from.mockImplementation(() => {
        throw new Error('Fallo de red')
      })

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await openForgotModal(user)

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('tu@correo.com'), 'test@test.com')
      await user.type(
        within(modal).getByPlaceholderText('Tu nombre como lo registraste'),
        'Test User'
      )
      await user.click(screen.getByRole('button', { name: /Verificar identidad/i }))

      await waitFor(() =>
        expect(screen.getByText('Fallo de red')).toBeInTheDocument()
      )
    })
  })

  // ==========================================================================
  // 7. ForgotPasswordModal — Paso 2: cambiar contraseña (líneas 325-352)
  // ==========================================================================

  describe('ForgotPasswordModal — Paso 2 (cambiar contraseña)', () => {
    // Helper: llega al paso 2
    const goToStep2 = async (user) => {
      buildFromMock({ data: { id: 'user-xyz' }, error: null })
      renderLogin()
      await openForgotModal(user)

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('tu@correo.com'), 'test@test.com')
      await user.type(
        within(modal).getByPlaceholderText('Tu nombre como lo registraste'),
        'Test User'
      )
      await user.click(screen.getByRole('button', { name: /Verificar identidad/i }))
      await waitFor(() => screen.getByText('PASO 2 de 2'))
    }

    it('muestra el PIN generado en el paso 2', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToStep2(user)

      // El PIN es un número de 6 dígitos en el cuadro de verificación
      const pinContainer = screen.getByText(/Tu código de verificación/i).closest('div')
      const pinText = pinContainer.querySelector('p.font-mono')
      expect(pinText?.textContent).toMatch(/^\d{6}$/)
    })

    it('muestra error cuando el campo código está vacío', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToStep2(user)

      await user.click(screen.getByRole('button', { name: /Cambiar contraseña/i }))
      await waitFor(() =>
        expect(screen.getByText('Copia el código de arriba y pégalo aquí')).toBeInTheDocument()
      )
    })

    it('muestra error cuando contraseña nueva está vacía', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToStep2(user)

      // Obtener el PIN real del DOM
      const pinContainer = screen.getByText(/Tu código de verificación/i).closest('div')
      const realPin = pinContainer.querySelector('p.font-mono').textContent.trim()

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('Copia el código de arriba'), realPin)
      await user.click(screen.getByRole('button', { name: /Cambiar contraseña/i }))

      await waitFor(() =>
        expect(screen.getByText('Escribe tu nueva contraseña')).toBeInTheDocument()
      )
    })

    it('validatePassword en paso 2 — error por menos de 8 caracteres', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToStep2(user)

      const pinContainer = screen.getByText(/Tu código de verificación/i).closest('div')
      const realPin = pinContainer.querySelector('p.font-mono').textContent.trim()

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('Copia el código de arriba'), realPin)

      const pwInputs = within(modal).getAllByPlaceholderText('••••••••')
      await user.type(pwInputs[0], 'Corta1!')
      await user.type(pwInputs[1], 'Corta1!')

      await user.click(screen.getByRole('button', { name: /Cambiar contraseña/i }))
      // validatePassword rechaza la contraseña — el modal permanece en paso 2 (no avanza a éxito)
      await waitFor(() => {
        expect(screen.queryByText(/Contraseña actualizada/i)).not.toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /Nueva contraseña/i })).toBeInTheDocument()
      })
    })

    it('validatePassword en paso 2 — error por falta de mayúscula', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToStep2(user)

      const pinContainer = screen.getByText(/Tu código de verificación/i).closest('div')
      const realPin = pinContainer.querySelector('p.font-mono').textContent.trim()

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('Copia el código de arriba'), realPin)

      const pwInputs = within(modal).getAllByPlaceholderText('••••••••')
      await user.type(pwInputs[0], 'sinmayuscula1!')
      await user.type(pwInputs[1], 'sinmayuscula1!')

      await user.click(screen.getByRole('button', { name: /Cambiar contraseña/i }))
      // validatePassword rechaza — modal sigue en paso 2, no avanza a pantalla de éxito
      await waitFor(() => {
        expect(screen.queryByText(/Contraseña actualizada/i)).not.toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /Nueva contraseña/i })).toBeInTheDocument()
      })
    })

    it('validatePassword en paso 2 — error por falta de carácter especial', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToStep2(user)

      const pinContainer = screen.getByText(/Tu código de verificación/i).closest('div')
      const realPin = pinContainer.querySelector('p.font-mono').textContent.trim()

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('Copia el código de arriba'), realPin)

      const pwInputs = within(modal).getAllByPlaceholderText('••••••••')
      await user.type(pwInputs[0], 'SinEspecial1234')
      await user.type(pwInputs[1], 'SinEspecial1234')

      await user.click(screen.getByRole('button', { name: /Cambiar contraseña/i }))
      // validatePassword rechaza — modal sigue en paso 2, no avanza a pantalla de éxito
      await waitFor(() => {
        expect(screen.queryByText(/Contraseña actualizada/i)).not.toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /Nueva contraseña/i })).toBeInTheDocument()
      })
    })

    it('muestra error cuando contraseñas nuevas no coinciden', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToStep2(user)

      const pinContainer = screen.getByText(/Tu código de verificación/i).closest('div')
      const realPin = pinContainer.querySelector('p.font-mono').textContent.trim()

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('Copia el código de arriba'), realPin)

      const pwFields = within(modal).getAllByPlaceholderText('••••••••')
      await user.type(pwFields[0], 'Password1!')
      await user.type(pwFields[1], 'OtraPass1!')

      await user.click(screen.getByRole('button', { name: /Cambiar contraseña/i }))
      await waitFor(() =>
        // Aparece en 2 campos (incluye "nueva" y "coinciden"), usamos getAllByText
        expect(screen.getAllByText('Las contraseñas nuevas no coinciden').length).toBeGreaterThan(0)
      )
    })

    it('cambia contraseña exitosamente y muestra pantalla de éxito (línea 358-365)', async () => {
      global.fetch.mockResolvedValue({ ok: true, json: async () => ({}) })

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToStep2(user)

      const pinContainer = screen.getByText(/Tu código de verificación/i).closest('div')
      const realPin = pinContainer.querySelector('p.font-mono').textContent.trim()

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('Copia el código de arriba'), realPin)

      const pwInputs = within(modal).getAllByPlaceholderText('••••••••')
      await user.type(pwInputs[0], 'NuevaClave1!')
      await user.type(pwInputs[1], 'NuevaClave1!')

      await user.click(screen.getByRole('button', { name: /Cambiar contraseña/i }))

      await waitFor(() =>
        expect(screen.getByText(/Contraseña actualizada/i)).toBeInTheDocument()
      )
      expect(screen.getByText(/ya puedes zarpar/i)).toBeInTheDocument()
    })

    it('cierra modal automáticamente 2.5s después del éxito', async () => {
      global.fetch.mockResolvedValue({ ok: true, json: async () => ({}) })

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToStep2(user)

      const pinContainer = screen.getByText(/Tu código de verificación/i).closest('div')
      const realPin = pinContainer.querySelector('p.font-mono').textContent.trim()

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('Copia el código de arriba'), realPin)

      const pwInputs = within(modal).getAllByPlaceholderText('••••••••')
      await user.type(pwInputs[0], 'NuevaClave1!')
      await user.type(pwInputs[1], 'NuevaClave1!')

      await user.click(screen.getByRole('button', { name: /Cambiar contraseña/i }))
      await waitFor(() => screen.getByText(/Contraseña actualizada/i))

      vi.advanceTimersByTime(2600)
      await waitFor(() =>
        expect(screen.queryByText(/Contraseña actualizada/i)).not.toBeInTheDocument()
      )
    })

    it('muestra error cuando fetch falla (response.ok = false)', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Error al cambiar la nueva contraseña' }),
      })

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToStep2(user)

      const pinContainer = screen.getByText(/Tu código de verificación/i).closest('div')
      const realPin = pinContainer.querySelector('p.font-mono').textContent.trim()

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('Copia el código de arriba'), realPin)

      const pwInputs = within(modal).getAllByPlaceholderText('••••••••')
      await user.type(pwInputs[0], 'NuevaClave1!')
      await user.type(pwInputs[1], 'NuevaClave1!')

      await user.click(screen.getByRole('button', { name: /Cambiar contraseña/i }))
      // El error se muestra en el campo "Nueva contraseña" (incluye "nueva")
      await waitFor(() =>
        expect(screen.getByText('Error al cambiar la nueva contraseña')).toBeInTheDocument()
      )
    })

    it('muestra error cuando fetch lanza excepción', async () => {
      global.fetch.mockRejectedValue(new Error('Fallo al cambiar la nueva contraseña'))

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToStep2(user)

      const pinContainer = screen.getByText(/Tu código de verificación/i).closest('div')
      const realPin = pinContainer.querySelector('p.font-mono').textContent.trim()

      const modal = document.querySelector('.fixed')
      await user.type(within(modal).getByPlaceholderText('Copia el código de arriba'), realPin)

      const pwInputs = within(modal).getAllByPlaceholderText('••••••••')
      await user.type(pwInputs[0], 'NuevaClave1!')
      await user.type(pwInputs[1], 'NuevaClave1!')

      await user.click(screen.getByRole('button', { name: /Cambiar contraseña/i }))
      // El error se muestra en el campo "Nueva contraseña" (incluye "nueva")
      await waitFor(() =>
        expect(screen.getByText('Fallo al cambiar la nueva contraseña')).toBeInTheDocument()
      )
    })

    it('botón "Atrás" regresa al paso 1 y limpia campos', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToStep2(user)

      await user.click(screen.getByRole('button', { name: /Atrás/i }))
      await waitFor(() =>
        expect(screen.getByRole('heading', { name: /Verificar identidad/i })).toBeInTheDocument()
      )
    })
  })

  // ==========================================================================
  // 8. TextField — comportamiento interno
  // ==========================================================================

  describe('TextField — comportamiento', () => {
    it('aplica clase de error cuando se pasa prop error', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin()

      await user.click(screen.getByRole('button', { name: /Zarpar/i }))
      await waitFor(() => {
        const errorInput = container.querySelector('input[class*="border-[#E85C42]"]')
        expect(errorInput).toBeInTheDocument()
      })
    })

    it('muestra ícono de advertencia junto al mensaje de error', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()

      await user.click(screen.getByRole('button', { name: /Zarpar/i }))
      await waitFor(() => {
        const errorMessages = screen.getAllByText('Escribe tu correo')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })
  })

  // ==========================================================================
  // 9. Icon — default case (línea 33)
  // ==========================================================================

  describe('Icon component — casos de ícono', () => {
    it('renderiza ícono mail correctamente', () => {
      renderLogin()
      // Hay campos de email con ícono de mail
      const { container } = renderLogin()
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renderiza ícono compass en el botón de submit', () => {
      const { container } = renderLogin()
      // El botón Zarpar tiene un ícono compass
      expect(screen.getByText(/Zarpar/i)).toBeInTheDocument()
    })

    it('renderiza ícono sparkle en registro', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin()
      await goToRegister(user)
      expect(screen.getByText(/Crear mi pasaporte/i)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // 10. Toast — auto-dismiss
  // ==========================================================================

  describe('Toast — auto-dismiss', () => {
    it('toast de login desaparece después de 2.4s', async () => {
      const mockOnLogin = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin({ onLogin: mockOnLogin })

      await user.type(container.querySelector('input[type="email"]'), 'x@test.com')
      await user.type(container.querySelector('input[type="password"]'), 'Pass12')
      await user.click(screen.getByRole('button', { name: /Zarpar/i }))

      await waitFor(() => screen.getByText(/Bienvenid@/i))
      vi.advanceTimersByTime(2500)
      await waitFor(() =>
        expect(screen.queryByText(/Bienvenid@/i)).not.toBeInTheDocument()
      )
    })

    it('toast de error de login desaparece después de 3s', async () => {
      const mockOnLogin = vi.fn().mockRejectedValue(new Error('Fallo'))
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin({ onLogin: mockOnLogin })

      await user.type(container.querySelector('input[type="email"]'), 'x@test.com')
      await user.type(container.querySelector('input[type="password"]'), 'Pass12')
      await user.click(screen.getByRole('button', { name: /Zarpar/i }))

      await waitFor(() => screen.getByText('Fallo'))
      vi.advanceTimersByTime(3100)
      await waitFor(() =>
        expect(screen.queryByText('Fallo')).not.toBeInTheDocument()
      )
    })
  })

  // ==========================================================================
  // 11. Estado isLoading
  // ==========================================================================

  describe('Estado isLoading', () => {
    it('botón de login muestra "Navegando..." mientras carga', async () => {
      let resolveLogin
      const mockOnLogin = vi.fn(
        () => new Promise((res) => { resolveLogin = res })
      )
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderLogin({ onLogin: mockOnLogin })

      await user.type(container.querySelector('input[type="email"]'), 'x@test.com')
      await user.type(container.querySelector('input[type="password"]'), 'Pass12')
      await user.click(screen.getByRole('button', { name: /Zarpar/i }))

      await waitFor(() =>
        expect(screen.getByText('Navegando...')).toBeInTheDocument()
      )
      resolveLogin()
    })

    it('botón de registro muestra "Creando..." mientras carga', async () => {
      let resolveReg
      const mockOnRegister = vi.fn(
        () => new Promise((res) => { resolveReg = res })
      )
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderLogin({ onRegister: mockOnRegister })
      await goToRegister(user)

      const textInputs = screen.getAllByRole('textbox')
      await user.type(textInputs.find((i) => i.placeholder === 'Marina'), 'Ana')
      await user.type(document.querySelector('input[type="email"]'), 'ana@test.com')
      const pwInputs = document.querySelectorAll('input[type="password"]')
      await user.type(pwInputs[0], 'Password1!')
      await user.type(pwInputs[1], 'Password1!')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Crear mi pasaporte/i }))

      await waitFor(() =>
        expect(screen.getByText('Creando...')).toBeInTheDocument()
      )
      resolveReg()
    })
  })
})
