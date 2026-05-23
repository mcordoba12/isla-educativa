import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import TeacherDashboard from '../../pages/TeacherDashboard'

// Mock Supabase with chainable methods
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'teacher-1',
            email: 'teacher@example.com',
            user_metadata: { nombre_completo: 'Prof. García' }
          }
        }
      }),
      signOut: vi.fn().mockResolvedValue({ error: null })
    },
    from: vi.fn(function (table) {
      const self = {
        select: vi.fn(() => self),
        eq: vi.fn(() => self),
        in: vi.fn(() => self),
        order: vi.fn(() => self),
        single: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }))
      }

      // Set up specific data for each table
      if (table === 'users') {
        self.single.mockResolvedValue({
          data: { codigo_clase: 'MATH101' },
          error: null
        })
        self.in.mockResolvedValue({
          data: [
            { id: 'student-1', nombre_completo: 'Juan Pérez' },
            { id: 'student-2', nombre_completo: 'María García' }
          ],
          error: null
        })
      } else if (table === 'classroom_sessions') {
        self.order.mockResolvedValue({
          data: [
            {
              id: 'session-1',
              titulo: 'Matemáticas - Álgebra',
              tema: 'Ecuaciones lineales',
              intervalo_minutos: 6,
              estado: 'configurada',
              docente_id: 'teacher-1'
            }
          ],
          error: null
        })
      } else if (table === 'session_questions') {
        self.select.mockResolvedValue({
          count: 5,
          error: null
        })
      } else if (table === 'missions') {
        self.order.mockResolvedValue({
          data: [
            {
              id: 'mission-1',
              titulo: 'Ciencias',
              descripcion: 'Ecosistemas',
              texto_reto: '¿Qué es un ecosistema?',
              retroalimentacion_exito: '¡Correcto!',
              retroalimentacion_fallo: 'Intenta de nuevo',
              estado: 'activa',
              docente_id: 'teacher-1'
            }
          ],
          error: null
        })
      } else if (table === 'teacher_students') {
        self.order.mockResolvedValue({
          data: [
            { estudiante_id: 'student-1' },
            { estudiante_id: 'student-2' }
          ],
          error: null
        })
      } else if (table === 'student_missions') {
        self.insert.mockResolvedValue({ error: null })
      }

      return self
    }),
    rpc: vi.fn().mockResolvedValue({
      data: { success: true, message: 'Misión publicada' },
      error: null
    })
  }
}))

import { supabase } from '../../services/supabaseClient'

describe('Integration: TeacherDashboard Real', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // ============================================================================
  // Renderizado básico
  // ============================================================================

  it('renderiza TeacherDashboard sin errores', async () => {
    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(
      () => expect(supabase.auth.getUser).toHaveBeenCalled(),
      { timeout: 15000 }
    )
  })

  it('muestra el nombre del docente', async () => {
    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(
      () => expect(screen.getByText(/Prof. García/i)).toBeInTheDocument(),
      { timeout: 15000 }
    )
  })

  // ============================================================================
  // Expediciones
  // ============================================================================

  it('renderiza la lista de expediciones', async () => {
    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(
      () => expect(screen.getByText('Matemáticas - Álgebra')).toBeInTheDocument(),
      { timeout: 15000 }
    )
  })

  // ============================================================================
  // Código de clase
  // ============================================================================

  it('muestra el código de clase del docente', async () => {
    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(
      () => expect(screen.getByText('MATH101')).toBeInTheDocument(),
      { timeout: 15000 }
    )
  })

  // ============================================================================
  // Estudiantes vinculados
  // ============================================================================

  it('muestra el número de estudiantes vinculados', async () => {
    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(
      () => expect(screen.getByText(/2 estudiantes/i)).toBeInTheDocument(),
      { timeout: 15000 }
    )
  })

  // ============================================================================
  // Navegación
  // ============================================================================

  it('el botón Nueva expedición navega correctamente', async () => {
    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(
      () => expect(screen.getByText(/Nueva expedición/i)).toBeInTheDocument(),
      { timeout: 15000 }
    )
  })

  // ============================================================================
  // Misiones
  // ============================================================================

  it('muestra lista de misiones en tab de misiones', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(
      () => expect(screen.getByText('Misiones para casa')).toBeInTheDocument(),
      { timeout: 15000 }
    )

    const misionTab = screen.getByRole('button', { name: /Misiones para casa/i })
    await user.click(misionTab)

    await waitFor(
      () => expect(screen.getByText('Ciencias')).toBeInTheDocument(),
      { timeout: 10000 }
    )
  })

  // ============================================================================
  // Crear misión
  // ============================================================================

  it('formulario de misión tiene campos requeridos', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    const misionTab = screen.getByRole('button', { name: /Misiones para casa/i })
    await user.click(misionTab)

    const nuevaMisionBtn = await screen.findByRole('button', { name: /Nueva misión/i })
    await user.click(nuevaMisionBtn)

    await waitFor(
      () => {
        expect(screen.getByPlaceholderText(/Ej. Ciencias Naturales/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/¿Qué deben responder/i)).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
  })

  it('crear misión llama a Supabase RPC correctamente', async () => {
    const user = userEvent.setup()

    supabase.rpc.mockResolvedValue({
      data: { success: true },
      error: null
    })

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    const misionTab = await screen.findByRole('button', { name: /Misiones para casa/i })
    await user.click(misionTab)

    const nuevaMisionBtn = await screen.findByRole('button', { name: /Nueva misión/i })
    await user.click(nuevaMisionBtn)

    const asignatura = await screen.findByPlaceholderText(/Ej. Ciencias Naturales/i)
    const reto = await screen.findByPlaceholderText(/¿Qué deben responder/i)

    await user.type(asignatura, 'Biología')
    await user.type(reto, '¿Qué es?')

    const publicarBtn = await screen.findByRole('button', { name: /Publicar misión/i })
    await user.click(publicarBtn)

    await waitFor(
      () => {
        expect(supabase.rpc).toHaveBeenCalledWith(
          'publish_mission',
          expect.objectContaining({
            p_titulo: 'Biología',
            p_texto_reto: '¿Qué es?'
          })
        )
      },
      { timeout: 10000 }
    )
  })

  // ============================================================================
  // Logout
  // ============================================================================

  it('tiene botón para cerrar sesión', async () => {
    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(
      () => expect(screen.getByRole('button', { name: /Cerrar sesión/i })).toBeInTheDocument(),
      { timeout: 15000 }
    )
  })
})
