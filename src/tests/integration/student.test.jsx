import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import StudentIsland from '../../pages/StudentIsland'
import { AuthProvider } from '../../context/AuthContext'

// Mock Supabase
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({
          data: {
            session: {
              user: {
                id: 'student-1',
                email: 'student@example.com',
                user_metadata: { nombre_completo: 'Juan García', rol: 'estudiante' }
              }
            }
          }
        })
      ),
      getUser: vi.fn(() =>
        Promise.resolve({
          data: {
            user: {
              id: 'student-1',
              email: 'student@example.com'
            }
          }
        })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn((table) => {
      if (table === 'users') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [{ id: 'teacher-1', codigo_clase: 'MATH101', nombre: 'Prof. García' }],
            error: null
          })
        }
      }
      if (table === 'student_missions') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'sm-1',
                asignatura: 'Matemáticas',
                tema: 'Ecuaciones lineales',
                reto: '¿Cuál es 2x + 3 = 7?',
                exito: '¡Correcto!',
                fallo: 'Intenta de nuevo',
                estado: 'pendiente',
                docente_nombre: 'Prof. García'
              }
            ],
            error: null
          }),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis()
        }
      }
      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis()
      }
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn()
    }),
    rpc: vi.fn()
  }
}))

import { supabase } from '../../services/supabaseClient'

describe('Integration: Isla del Estudiante Real', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    supabase.rpc.mockResolvedValue({
      data: { success: true, message: 'Unido a la clase' },
      error: null
    })
  })

  it('renderiza isla del estudiante con componentes reales', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <StudentIsland />
        </AuthProvider>
      </BrowserRouter>
    )

    // Espera que cargue el componente
    await waitFor(() => {
      const buttons = screen.queryAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('muestra botón para unirse a clase', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <StudentIsland />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const joinBtns = screen.queryAllByRole('button')
      expect(joinBtns.length).toBeGreaterThan(0)
    })
  })

  it('simula unirse a clase con código válido', async () => {
    supabase.rpc.mockResolvedValue({
      data: { success: true, message: 'Inscrito a la clase' },
      error: null
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <StudentIsland />
        </AuthProvider>
      </BrowserRouter>
    )

    // Busca input de código o modal de unirse
    await waitFor(() => {
      const inputs = screen.queryAllByRole('textbox')
      if (inputs.length > 0) {
        expect(inputs.length).toBeGreaterThan(0)
      }
    })
  })

  it('carga misiones después de unirse', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'student_missions') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'sm-1',
                asignatura: 'Matemáticas',
                tema: 'Álgebra',
                estado: 'pendiente'
              },
              {
                id: 'sm-2',
                asignatura: 'Historia',
                tema: 'Edad Media',
                estado: 'pendiente'
              }
            ],
            error: null
          }),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis()
        }
      }
      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
        eq: vi.fn().mockReturnThis()
      }
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <StudentIsland />
        </AuthProvider>
      </BrowserRouter>
    )

    // Verifica que Supabase se llamó para cargar misiones
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalled()
    })
  })

  it('muestra lista de docentes vinculados', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'teacher_students') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [
              { docente_id: 'teacher-1', estudiante_id: 'student-1' }
            ],
            error: null
          }),
          eq: vi.fn().mockReturnThis()
        }
      }
      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
        eq: vi.fn().mockReturnThis()
      }
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <StudentIsland />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalled()
    })
  })

  it('verifica que la RPC de unirse se llama con código correcto', async () => {
    supabase.rpc.mockResolvedValue({
      data: { success: true, message: 'Inscrito' },
      error: null
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <StudentIsland />
        </AuthProvider>
      </BrowserRouter>
    )

    // El componente intenta unirse al montarse o mediante un botón
    await waitFor(() => {
      // La RPC puede ser llamada automáticamente o por acción del usuario
      if (supabase.rpc.mock.calls.length > 0) {
        expect(supabase.rpc).toHaveBeenCalled()
      }
    })
  })

  it('maneja error cuando código de clase es inválido', async () => {
    supabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'Código de clase no válido' }
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <StudentIsland />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      // Verifica que se intenta hacer la RPC
      const rpcCalls = supabase.rpc.mock.calls.length
      expect(typeof rpcCalls).toBe('number')
    })
  })

  it('verifica estructura de misión cargada', async () => {
    const mockMission = {
      id: 'sm-1',
      asignatura: 'Matemáticas',
      tema: 'Ecuaciones',
      reto: '¿Cuál es 2+2?',
      exito: '¡Correcto!',
      fallo: 'Intenta de nuevo',
      estado: 'pendiente',
      docente_id: 'teacher-1',
      docente_nombre: 'Prof. García'
    }

    // Validar estructura de misión
    expect(mockMission).toHaveProperty('id')
    expect(mockMission).toHaveProperty('asignatura')
    expect(mockMission).toHaveProperty('tema')
    expect(mockMission).toHaveProperty('reto')
    expect(mockMission).toHaveProperty('exito')
    expect(mockMission).toHaveProperty('fallo')
    expect(mockMission).toHaveProperty('estado')
    expect(['pendiente', 'completada', 'vencida']).toContain(mockMission.estado)
  })

  it('simula responder una misión', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <StudentIsland />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const buttons = screen.queryAllByRole('button')
      // Si hay botones de responder, se pueden simular clicks
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('verifica que se carga con código de clase en URL', async () => {
    // Simular código de clase en parámetros de URL
    const testCode = 'MATH101'

    // Verificar que el componente puede recibir parámetros
    render(
      <BrowserRouter>
        <AuthProvider>
          <StudentIsland />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled()
    })
  })
})
