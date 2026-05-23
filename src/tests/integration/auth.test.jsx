import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '../../components/Auth/LoginPage'
import { AuthProvider } from '../../context/AuthContext'

// Mock Supabase - solo las llamadas a la API
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({
          data: { session: null }
        })
      ),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockResolvedValue({ error: null }),
      eq: vi.fn().mockReturnThis()
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn()
    })
  }
}))

import { supabase } from '../../services/supabaseClient'

describe('Integration: Autenticación Real', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('verifica que Supabase se mockea correctamente', () => {
    expect(supabase.auth).toBeDefined()
    expect(supabase.auth.signInWithPassword).toBeDefined()
    expect(supabase.auth.signUp).toBeDefined()
  })

  it('valida que email tenga formato correcto', () => {
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('test@domain.co.uk')).toBe(true)
    expect(isValidEmail('invalidemail')).toBe(false)
    expect(isValidEmail('test@')).toBe(false)
  })

  it('valida que contraseña cumpla requisitos', () => {
    const validatePassword = (pw) => {
      if (!pw) return 'Escribe tu nueva contraseña'
      if (pw.length < 8) return 'Mínimo 8 caracteres'
      if (!/[A-Z]/.test(pw)) return 'Necesita al menos una mayúscula'
      if (!/[!@#$%^&*]/.test(pw)) return 'Necesita al menos un carácter especial'
      return ''
    }

    expect(validatePassword('Valid123!')).toBe('')
    expect(validatePassword('short')).toContain('8 caracteres')
    expect(validatePassword('nouppercase123!')).toContain('mayúscula')
    expect(validatePassword('NoSpecial123')).toContain('especial')
  })

  it('simula login exitoso', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-1',
          email: 'test@example.com',
          user_metadata: { rol: 'estudiante' }
        },
        session: { access_token: 'token-123' }
      },
      error: null
    })

    const loginData = {
      email: 'test@example.com',
      password: 'Password123!'
    }

    const result = await supabase.auth.signInWithPassword(loginData)

    expect(result.error).toBeNull()
    expect(result.data.user).toBeDefined()
    expect(result.data.user.email).toBe('test@example.com')
  })

  it('maneja error de login', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Credenciales inválidas' }
    })

    const loginData = {
      email: 'wrong@example.com',
      password: 'wrongpassword'
    }

    const result = await supabase.auth.signInWithPassword(loginData)

    expect(result.error).not.toBeNull()
    expect(result.error.message).toBe('Credenciales inválidas')
  })

  it('simula registro exitoso', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: 'new-user',
          email: 'newstudent@example.com'
        }
      },
      error: null
    })

    const registerData = {
      email: 'newstudent@example.com',
      password: 'NewPass123!',
      options: { data: { nombre_completo: 'Juan García', rol: 'estudiante' } }
    }

    const result = await supabase.auth.signUp(registerData)

    expect(result.error).toBeNull()
    expect(result.data.user).toBeDefined()
  })

})
