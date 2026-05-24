import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProtectedRoute } from '../../components/Auth/ProtectedRoute'

// Mock Supabase
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    })
  }
}))

import { supabase } from '../../services/supabaseClient'

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // Loading State
  // ============================================================================

  it('muestra loading mientras verifica auth', async () => {
    supabase.auth.getUser.mockImplementation(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({ data: { user: null } }), 100)
      )
    )

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    // El loading debe mostrarse brevemente
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  // ============================================================================
  // Authentication Status
  // ============================================================================

  it('redirige a "/" si no hay usuario logueado', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    // Verificar que no se renderiza el contenido protegido
    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('renderiza children si el usuario está autenticado sin requiredRole', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } }
    })

    supabase.from().select().eq().single.mockResolvedValue({
      data: { rol: 'docente' }
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  // ============================================================================
  // Role-Based Access Control
  // ============================================================================

  it('redirige a "/" si el rol no coincide', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } }
    })

    supabase.from().select().eq().single.mockResolvedValue({
      data: { rol: 'estudiante' }
    })

    render(
      <MemoryRouter initialEntries={['/teacher']}>
        <ProtectedRoute requiredRole="docente">
          <div>Teacher Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    // Verificar que no se renderiza el contenido porque el rol no coincide
    await waitFor(() => {
      expect(screen.queryByText('Teacher Content')).not.toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('renderiza children si el usuario tiene el rol correcto (docente)', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } }
    })

    supabase.from().select().eq().single.mockResolvedValue({
      data: { rol: 'docente' }
    })

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="docente">
          <div>Teacher Dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('renderiza children si el usuario tiene el rol correcto (estudiante)', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-456' } }
    })

    supabase.from().select().eq().single.mockResolvedValue({
      data: { rol: 'estudiante' }
    })

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="estudiante">
          <div>Student Island</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Student Island')).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('renderiza spinner correctamente durante carga', async () => {
    supabase.auth.getUser.mockImplementation(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({ data: { user: null } }), 200)
      )
    )

    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('maneja error de verificación de autenticación', async () => {
    supabase.auth.getUser.mockRejectedValue(new Error('Auth error'))

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    // No debería renderizar el contenido protegido
    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    }, { timeout: 15000 })
  })
})
