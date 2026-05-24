import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProtectedRoute } from '../../components/Auth/ProtectedRoute'

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuthContext: vi.fn()
}))

// Mock Supabase
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    })
  }
}))

import { useAuthContext } from '../../context/AuthContext'
import { supabase } from '../../services/supabaseClient'

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // Loading State
  // ============================================================================

  it('muestra loading mientras verifica auth', async () => {
    useAuthContext.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false
    })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  // ============================================================================
  // Authentication Status
  // ============================================================================

  it('redirige a "/" si no hay usuario logueado', async () => {
    useAuthContext.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false
    })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  it('renderiza children si el usuario está autenticado sin requiredRole', async () => {
    useAuthContext.mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      loading: false,
      error: null,
      isAuthenticated: true
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
    })
  })

  // ============================================================================
  // Role-Based Access Control
  // ============================================================================

  it('redirige a "/" si el rol no coincide', async () => {
    useAuthContext.mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      loading: false,
      error: null,
      isAuthenticated: true
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

    await waitFor(() => {
      expect(screen.queryByText('Teacher Content')).not.toBeInTheDocument()
    })
  })

  it('renderiza children si el usuario tiene el rol correcto (docente)', async () => {
    useAuthContext.mockReturnValue({
      user: { id: 'user-123', email: 'teacher@example.com' },
      loading: false,
      error: null,
      isAuthenticated: true
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
    })
  })

  it('renderiza children si el usuario tiene el rol correcto (estudiante)', async () => {
    useAuthContext.mockReturnValue({
      user: { id: 'user-456', email: 'student@example.com' },
      loading: false,
      error: null,
      isAuthenticated: true
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
    })
  })

  it('renderiza spinner correctamente durante carga', async () => {
    useAuthContext.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false
    })

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
    useAuthContext.mockReturnValue({
      user: null,
      loading: false,
      error: 'Auth error',
      isAuthenticated: false
    })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })
})
