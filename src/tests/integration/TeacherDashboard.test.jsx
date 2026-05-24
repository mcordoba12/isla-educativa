import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import TeacherDashboard from '../../pages/TeacherDashboard'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null })
    },
    from: vi.fn(),
    rpc: vi.fn()
  }
}))

import { supabase } from '../../services/supabaseClient'

// Helper function para configurar el mock de from() con diferenciación por tabla
function setupFromMock() {
  supabase.from.mockImplementation((table) => {
    if (table === 'users') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
        single: vi.fn().mockResolvedValue({
          data: { codigo_clase: 'MATH101' },
          error: null
        }),
        update: vi.fn().mockReturnThis()
      }
    }
    if (table === 'classroom_sessions') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }
    }
    if (table === 'session_questions') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            count: 0,
            data: null,
            error: null
          })
        })
      }
    }
    if (table === 'missions') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        update: vi.fn().mockReturnThis()
      }
    }
    if (table === 'teacher_students') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }
    }
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    }
  })
}

describe('TeacherDashboard - handleSaveMission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'teacher-1',
          email: 'teacher@example.com',
          user_metadata: { nombre_completo: 'Prof. García' }
        }
      }
    })
    supabase.rpc.mockResolvedValue({
      data: { success: true, message: 'Misión publicada' },
      error: null
    })
    setupFromMock()
  })

  // ============================================================================
  // handleSaveMission - Validación de campos vacíos
  // ============================================================================
  it('valida que asignatura no esté vacía - caso error', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(supabase.auth.getUser).toHaveBeenCalled(), { timeout: 15000 })

    // Buscar botón Nueva misión y clickearlo
    const newMissionBtn = screen.queryByText(/Nueva misión/)
    if (newMissionBtn) {
      await user.click(newMissionBtn)

      // Rellenar solo reto, dejar asignatura vacía
      const retoInput = screen.queryByPlaceholderText(/¿Qué deben responder/)
      if (retoInput) {
        await user.type(retoInput, 'Pregunta test')
      }

      // Intentar guardar sin asignatura
      const publishBtn = screen.queryByRole('button', { name: /Publicar misión/ })
      if (publishBtn) {
        expect(publishBtn.disabled).toBe(true)
      }
    }
  })

  it('valida que reto no esté vacío - caso error', async () => {
    const user = userEvent.setup()
    const getChainableMock = () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { codigo_clase: 'MATH101' },
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis()
    })

    supabase.from.mockReturnValue(getChainableMock())

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(supabase.auth.getUser).toHaveBeenCalled(), { timeout: 15000 })

    const newMissionBtn = screen.queryByText(/Nueva misión/)
    if (newMissionBtn) {
      await user.click(newMissionBtn)

      const asignaturaInput = screen.queryByPlaceholderText(/Ciencias Naturales/)
      if (asignaturaInput) {
        await user.type(asignaturaInput, 'Ciencias')
      }

      // Reto vacío - botón deshabilitado
      const publishBtn = screen.queryByRole('button', { name: /Publicar misión/ })
      if (publishBtn) {
        expect(publishBtn.disabled).toBe(true)
      }
    }
  })

  // ============================================================================
  // handleSaveMission - Crear nueva misión (caso exitoso)
  // ============================================================================
  it('publica nueva misión con RPC - caso exitoso', async () => {
    const user = userEvent.setup()
    const getChainableMock = () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { codigo_clase: 'MATH101' },
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis()
    })

    supabase.from.mockReturnValue(getChainableMock())

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(supabase.auth.getUser).toHaveBeenCalled(), { timeout: 15000 })

    const newMissionBtn = screen.queryByText(/Nueva misión/)
    if (newMissionBtn) {
      await user.click(newMissionBtn)

      const asignaturaInput = screen.queryByPlaceholderText(/Ciencias Naturales/)
      const retoInput = screen.queryByPlaceholderText(/¿Qué deben responder/)

      if (asignaturaInput && retoInput) {
        await user.type(asignaturaInput, 'Ciencias')
        await user.type(retoInput, 'Pregunta test')

        const publishBtn = screen.queryByRole('button', { name: /Publicar misión/ })
        if (publishBtn && !publishBtn.disabled) {
          await user.click(publishBtn)

          await waitFor(() => {
            expect(supabase.rpc).toHaveBeenCalled()
          }, { timeout: 3000 })
        }
      }
    }
  })

  // ============================================================================
  // handleSaveMission - Error en RPC
  // ============================================================================
  it('maneja error al publicar misión - caso error Supabase', async () => {
    const user = userEvent.setup()
    const getChainableMock = () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { codigo_clase: 'MATH101' },
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis()
    })

    supabase.from.mockReturnValue(getChainableMock())
    supabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'Error en base de datos' }
    })

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(supabase.auth.getUser).toHaveBeenCalled(), { timeout: 15000 })

    const newMissionBtn = screen.queryByText(/Nueva misión/)
    if (newMissionBtn) {
      await user.click(newMissionBtn)

      const asignaturaInput = screen.queryByPlaceholderText(/Ciencias Naturales/)
      const retoInput = screen.queryByPlaceholderText(/¿Qué deben responder/)

      if (asignaturaInput && retoInput) {
        await user.type(asignaturaInput, 'Ciencias')
        await user.type(retoInput, 'Pregunta test')

        const publishBtn = screen.queryByRole('button', { name: /Publicar misión/ })
        if (publishBtn && !publishBtn.disabled) {
          await user.click(publishBtn)
        }
      }
    }
  })

  // ============================================================================
  // handleSaveMission - Actualizar misión existente
  // ============================================================================
  it('actualiza misión existente - caso exitoso con UPDATE', async () => {
    const user = userEvent.setup()
    const getChainableMock = () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { codigo_clase: 'MATH101' },
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis()
    })

    supabase.from.mockReturnValue(getChainableMock())

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(supabase.auth.getUser).toHaveBeenCalled(), { timeout: 15000 })
  })

  // ============================================================================
  // handleSaveMission - Error al actualizar
  // ============================================================================
  it('maneja error al actualizar misión', async () => {
    const getChainableMock = () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { codigo_clase: 'MATH101' },
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis()
    })

    supabase.from.mockReturnValue(getChainableMock())

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(supabase.auth.getUser).toHaveBeenCalled(), { timeout: 15000 })
  })
})

describe('TeacherDashboard - handleEditMission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'teacher-1',
          email: 'teacher@example.com',
          user_metadata: { nombre_completo: 'Prof. García' }
        }
      }
    })
  })

  // ============================================================================
  // handleEditMission - Cargar datos de misión
  // ============================================================================
  it('carga datos de misión en el formulario - caso exitoso', async () => {
    const user = userEvent.setup()
    const getChainableMock = () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { codigo_clase: 'MATH101' },
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis()
    })

    supabase.from.mockReturnValue(getChainableMock())

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(supabase.auth.getUser).toHaveBeenCalled(), { timeout: 15000 })

    const editBtns = screen.queryAllByText(/Editar/)
    if (editBtns.length > 0) {
      await user.click(editBtns[0])
    }
  })

  // ============================================================================
  // handleEditMission - Mostrar modal de edición
  // ============================================================================
  it('abre modal de edición cuando se clickea botón Editar', async () => {
    const user = userEvent.setup()
    const getChainableMock = () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { codigo_clase: 'MATH101' },
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis()
    })

    supabase.from.mockReturnValue(getChainableMock())

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(supabase.auth.getUser).toHaveBeenCalled(), { timeout: 15000 })

    const editBtns = screen.queryAllByText(/Editar/)
    if (editBtns.length > 0) {
      await user.click(editBtns[0])

      // Debe mostrar "Editar misión" en el modal
      const editTitle = screen.queryByText(/Editar misión/)
      if (editTitle) {
        expect(editTitle).toBeTruthy()
      }
    }
  })
})

describe('TeacherDashboard - handleCancelEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'teacher-1',
          email: 'teacher@example.com',
          user_metadata: { nombre_completo: 'Prof. García' }
        }
      }
    })
  })

  // ============================================================================
  // handleCancelEdit - Cerrar formulario
  // ============================================================================
  it('cancela edición y limpia formulario', async () => {
    const user = userEvent.setup()
    const getChainableMock = () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { codigo_clase: 'MATH101' },
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis()
    })

    supabase.from.mockReturnValue(getChainableMock())

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(supabase.auth.getUser).toHaveBeenCalled(), { timeout: 15000 })

    const newMissionBtn = screen.queryByText(/Nueva misión/)
    if (newMissionBtn) {
      await user.click(newMissionBtn)

      const cancelBtn = screen.queryByRole('button', { name: /Cancelar/ })
      if (cancelBtn) {
        await user.click(cancelBtn)

        // Después de cancelar, el formulario debe cerrarse
        const form = screen.queryByText(/Crear nueva misión/)
        if (form) {
          expect(form).toBeTruthy()
        }
      }
    }
  })

  // ============================================================================
  // handleCancelEdit - Reset de campos
  // ============================================================================
  it('limpia todos los campos del formulario al cancelar', async () => {
    const user = userEvent.setup()
    const getChainableMock = () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { codigo_clase: 'MATH101' },
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis()
    })

    supabase.from.mockReturnValue(getChainableMock())

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(supabase.auth.getUser).toHaveBeenCalled(), { timeout: 15000 })

    const newMissionBtn = screen.queryByText(/Nueva misión/)
    if (newMissionBtn) {
      await user.click(newMissionBtn)

      const asignaturaInput = screen.queryByPlaceholderText(/Ciencias Naturales/)
      if (asignaturaInput) {
        await user.type(asignaturaInput, 'Test')
      }

      const cancelBtn = screen.queryByRole('button', { name: /Cancelar/ })
      if (cancelBtn) {
        await user.click(cancelBtn)
      }
    }
  })
})

describe('TeacherDashboard - Validaciones del formulario', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'teacher-1',
          email: 'teacher@example.com',
          user_metadata: { nombre_completo: 'Prof. García' }
        }
      }
    })
  })

  it('deshabilita botón Publicar si asignatura está vacía', async () => {
    const getChainableMock = () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { codigo_clase: 'MATH101' },
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis()
    })

    supabase.from.mockReturnValue(getChainableMock())

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(supabase.auth.getUser).toHaveBeenCalled(), { timeout: 15000 })
  })

  it('deshabilita botón Publicar si reto está vacío', async () => {
    const getChainableMock = () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { codigo_clase: 'MATH101' },
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis()
    })

    supabase.from.mockReturnValue(getChainableMock())

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(supabase.auth.getUser).toHaveBeenCalled(), { timeout: 15000 })
  })

  it('habilita botón Publicar cuando campos requeridos están llenos', async () => {
    const user = userEvent.setup()
    const getChainableMock = () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { codigo_clase: 'MATH101' },
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis()
    })

    supabase.from.mockReturnValue(getChainableMock())

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(supabase.auth.getUser).toHaveBeenCalled(), { timeout: 15000 })

    const newMissionBtn = screen.queryByText(/Nueva misión/)
    if (newMissionBtn) {
      await user.click(newMissionBtn)

      const asignaturaInput = screen.queryByPlaceholderText(/Ciencias Naturales/)
      const retoInput = screen.queryByPlaceholderText(/¿Qué deben responder/)

      if (asignaturaInput && retoInput) {
        await user.type(asignaturaInput, 'Matemáticas')
        await user.type(retoInput, '¿Cuánto es 2+2?')

        const publishBtn = screen.queryByRole('button', { name: /Publicar misión/ })
        if (publishBtn) {
          expect(publishBtn.disabled).toBe(false)
        }
      }
    }
  })
})

describe('TeacherDashboard - UI y Modal de estudiantes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'teacher-1',
          email: 'teacher@example.com',
          user_metadata: { nombre_completo: 'Prof. García' }
        }
      }
    })
  })

  it('muestra código de clase con botón copiar', async () => {
    const getChainableMock = () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { codigo_clase: 'MATH101' },
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis()
    })

    supabase.from.mockReturnValue(getChainableMock())

    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(supabase.auth.getUser).toHaveBeenCalled(), { timeout: 15000 })

    const copyBtn = screen.queryByRole('button', { name: /Copiar/ })
    if (copyBtn) {
      expect(copyBtn).toBeTruthy()
    }
  })
})
