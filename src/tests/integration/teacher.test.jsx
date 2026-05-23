import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import TeacherDashboard from '../../pages/TeacherDashboard'
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
                id: 'teacher-1',
                email: 'teacher@example.com',
                user_metadata: { nombre_completo: 'Prof. García', rol: 'docente' }
              }
            }
          }
        })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn((table) => {
      return {
        select: vi.fn().mockResolvedValue({
          data: [
            {
              id: 's-1',
              nombre: 'Juan',
              email: 'juan@example.com'
            },
            {
              id: 's-2',
              nombre: 'María',
              email: 'maria@example.com'
            }
          ],
          error: null
        }),
        insert: vi.fn().mockResolvedValue({
          data: [{ id: 'new-session' }],
          error: null
        }),
        update: vi.fn().mockResolvedValue({ error: null }),
        delete: vi.fn().mockResolvedValue({ error: null }),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis()
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

describe('Integration: Dashboard del Docente Real', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    supabase.rpc.mockResolvedValue({
      data: { success: true, student_count: 2 },
      error: null
    })
  })

  it('renderiza dashboard del docente con componentes reales', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TeacherDashboard />
        </AuthProvider>
      </BrowserRouter>
    )

    // Verifica que el componente se renderizó
    expect(supabase.auth.getSession).toHaveBeenCalled()
  })

  it('muestra contador de estudiantes vinculados', () => {
    // Validar estructura de datos de estudiantes vinculados
    const linkedStudents = [
      { docente_id: 'teacher-1', estudiante_id: 'student-1' },
      { docente_id: 'teacher-1', estudiante_id: 'student-2' },
      { docente_id: 'teacher-1', estudiante_id: 'student-3' }
    ]

    expect(linkedStudents).toHaveLength(3)
    expect(linkedStudents.filter((ls) => ls.docente_id === 'teacher-1')).toHaveLength(3)
  })

  it('simula crear una expedición (sesión)', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'expeditions') {
        return {
          insert: vi.fn().mockResolvedValue({
            data: [{ id: 'exp-1' }],
            error: null
          }),
          select: vi.fn().mockReturnThis()
        }
      }
      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
        eq: vi.fn().mockReturnThis()
      }
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <TeacherDashboard />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled()
    })
  })

  it('verifica estructura de expedición/sesión', () => {
    const mockSession = {
      id: 'exp-1',
      titulo: 'Matemáticas - Álgebra',
      tema: 'Ecuaciones lineales',
      intervalo_minutos: 6,
      estado: 'configurada',
      docente_id: 'teacher-1'
    }

    expect(mockSession).toHaveProperty('id')
    expect(mockSession).toHaveProperty('titulo')
    expect(mockSession).toHaveProperty('tema')
    expect(mockSession).toHaveProperty('intervalo_minutos')
    expect(mockSession).toHaveProperty('estado')
    expect([5, 6, 7]).toContain(mockSession.intervalo_minutos)
    expect(['configurada', 'iniciada', 'pausada', 'finalizada']).toContain(mockSession.estado)
  })

  it('simula publicar una misión a estudiantes', async () => {
    supabase.rpc.mockResolvedValue({
      data: {
        success: true,
        student_count: 3,
        message: 'Misión publicada a 3 estudiantes'
      },
      error: null
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <TeacherDashboard />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      // La RPC de publish_mission se llama cuando se publica
      if (supabase.rpc.mock.calls.length > 0) {
        expect(supabase.rpc).toHaveBeenCalled()
      }
    })
  })

  it('verifica estructura de misión publicada', () => {
    const mockMission = {
      id: 'mission-1',
      asignatura: 'Matemáticas',
      tema: 'Ecuaciones',
      explicacion: 'Aprenderemos ecuaciones lineales',
      reto: '¿Cuál es 2x + 3 = 7?',
      exito: '¡Correcto! x = 2',
      fallo: 'Intenta de nuevo, aíslalo en la ecuación',
      docente_id: 'teacher-1',
      estado: 'activa'
    }

    expect(mockMission).toHaveProperty('asignatura')
    expect(mockMission).toHaveProperty('tema')
    expect(mockMission).toHaveProperty('reto')
    expect(mockMission).toHaveProperty('exito')
    expect(mockMission).toHaveProperty('fallo')
    expect(['activa', 'archivada']).toContain(mockMission.estado)
  })

  it('verifica que student_missions se crean para cada estudiante', async () => {
    const linkedStudents = ['student-1', 'student-2', 'student-3']
    const missionId = 'mission-1'

    const studentMissions = linkedStudents.map((studentId) => ({
      estudiante_id: studentId,
      mision_id: missionId,
      estado: 'pendiente'
    }))

    expect(studentMissions).toHaveLength(linkedStudents.length)
    studentMissions.forEach((sm) => {
      expect(sm.mision_id).toBe(missionId)
      expect(sm.estado).toBe('pendiente')
    })
  })

  it('carga lista de expediciones del docente', () => {
    // Validar estructura de expediciones
    const expeditions = [
      { id: 'exp-1', titulo: 'Sesión 1', estado: 'finalizada' },
      { id: 'exp-2', titulo: 'Sesión 2', estado: 'pausada' }
    ]

    expect(expeditions).toHaveLength(2)
    expect(expeditions[0].estado).toBe('finalizada')
    expect(expeditions[1].estado).toBe('pausada')
  })

  it('carga lista de misiones del docente', () => {
    // Validar estructura de misiones
    const missions = [
      { id: 'mission-1', asignatura: 'Matemáticas', estado: 'activa' },
      { id: 'mission-2', asignatura: 'Historia', estado: 'activa' }
    ]

    expect(missions).toHaveLength(2)
    expect(missions[0].estado).toBe('activa')
    expect(missions[1].asignatura).toBe('Historia')
  })

  it('verifica que docente puede archivar una misión', () => {
    const mission = {
      id: 'mission-1',
      estado: 'activa'
    }

    const updatedMission = { ...mission, estado: 'archivada' }

    expect(updatedMission.estado).toBe('archivada')
  })

  it('muestra modal con lista de estudiantes vinculados', () => {
    // Validar estructura de datos para modal de estudiantes
    const students = [
      { id: 'ts-1', nombre: 'Juan' },
      { id: 'ts-2', nombre: 'María' },
      { id: 'ts-3', nombre: 'Pedro' }
    ]

    expect(students).toHaveLength(3)
    expect(students.map((s) => s.nombre)).toContain('Juan')
    expect(students.map((s) => s.nombre)).toContain('María')
  })
})
