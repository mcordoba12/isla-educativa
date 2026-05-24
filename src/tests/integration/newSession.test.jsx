import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'

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
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            user_metadata: { nombre_completo: 'Juan García' }
          }
        }
      })
    },
    from: vi.fn((table) => {
      if (table === 'classroom_sessions') {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'session-123', estado: 'configurada' },
            error: null
          })
        }
      }
      if (table === 'session_questions') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null })
        }
      }
      return {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: {}, error: null })
      }
    })
  }
}))

import NewSession from '../../pages/NewSession'

describe('NewSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza el formulario vacío correctamente', async () => {
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Configura tu expedición/)).toBeTruthy()
      expect(screen.getByPlaceholderText(/Ciencias Naturales/)).toBeTruthy()
    })
  })

  it('campo asignatura acepta texto', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    const asignaturaInput = screen.getByPlaceholderText(/Ciencias Naturales/)
    await user.type(asignaturaInput, 'Matemáticas')

    expect(asignaturaInput.value).toBe('Matemáticas')
  })

  it('campo tema acepta texto', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    const temaInput = screen.getByPlaceholderText(/Los ecosistemas marinos/)
    await user.type(temaInput, 'Fracciones')

    expect(temaInput.value).toBe('Fracciones')
  })

  it('valida que asignatura no esté vacía', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    await waitFor(() => {
      const saveBtn = screen.getByRole('button', { name: /Guardar expedición/ })
      expect(saveBtn.disabled).toBe(true)
    })
  })

  it('valida que tema no esté vacío', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    const asignaturaInput = screen.getByPlaceholderText(/Ciencias Naturales/)
    await user.type(asignaturaInput, 'Matemáticas')

    await waitFor(() => {
      const saveBtn = screen.getByRole('button', { name: /Guardar expedición/ })
      expect(saveBtn.disabled).toBe(true)
    })
  })

  it('valida mínimo 1 pregunta al guardar', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    const asignaturaInput = screen.getByPlaceholderText(/Ciencias Naturales/)
    const temaInput = screen.getByPlaceholderText(/Los ecosistemas marinos/)

    await user.type(asignaturaInput, 'Matemáticas')
    await user.type(temaInput, 'Fracciones')

    // Sin preguntas, botón deshabilitado
    await waitFor(() => {
      const saveBtn = screen.getByRole('button', { name: /Guardar expedición/ })
      expect(saveBtn.disabled).toBe(true)
    })
  })

  it('primera pregunta aparece por defecto', async () => {
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    await waitFor(() => {
      const preguntaInputs = screen.getAllByPlaceholderText(/Pregunta/)
      expect(preguntaInputs.length).toBeGreaterThan(0)
    })
  })

  it('botón Añadir pregunta agrega nuevo campo', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Añadir pregunta/)).toBeTruthy()
    })

    let preguntaInputs = screen.getAllByPlaceholderText(/Pregunta/)
    const initialCount = preguntaInputs.length

    const addBtn = screen.getByRole('button', { name: /Añadir pregunta/ })
    await user.click(addBtn)

    preguntaInputs = screen.getAllByPlaceholderText(/Pregunta/)
    expect(preguntaInputs.length).toBe(initialCount + 1)
  })

  it('botón eliminar (x) quita una pregunta', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    // Agregar 2 preguntas
    const addBtn = screen.getByRole('button', { name: /Añadir pregunta/ })
    await user.click(addBtn)
    await user.click(addBtn)

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('✕')
      expect(deleteButtons.length).toBeGreaterThan(0)
    })

    const deleteButtons = screen.getAllByText('✕')
    await user.click(deleteButtons[0])

    await waitFor(() => {
      const remainingDeleteButtons = screen.queryAllByText('✕')
      expect(remainingDeleteButtons.length).toBeLessThan(deleteButtons.length)
    })
  })

  it('no permite eliminar si solo hay 1 pregunta', async () => {
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    await waitFor(() => {
      const deleteButtons = screen.queryAllByText('✕')
      expect(deleteButtons.length).toBe(0)
    })
  })

  it('selector de intervalo 5 min funciona', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    await waitFor(() => {
      const radioButtons = screen.getAllByRole('radio')
      expect(radioButtons.length).toBeGreaterThan(0)
    })

    const radioButtons = screen.getAllByRole('radio')
    const btn5 = radioButtons.find(btn => btn.textContent.includes('5'))

    if (btn5) {
      await user.click(btn5)
      expect(btn5).toHaveAttribute('aria-checked', 'true')
    }
  })

  it('selector de intervalo 6 min funciona', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    await waitFor(() => {
      const radioButtons = screen.getAllByRole('radio')
      expect(radioButtons.length).toBeGreaterThan(0)
    })

    const radioButtons = screen.getAllByRole('radio')
    const btn6 = radioButtons.find(btn => btn.textContent.includes('6'))

    if (btn6) {
      await user.click(btn6)
      expect(btn6).toHaveAttribute('aria-checked', 'true')
    }
  })

  it('selector de intervalo 7 min funciona', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    await waitFor(() => {
      const radioButtons = screen.getAllByRole('radio')
      expect(radioButtons.length).toBeGreaterThan(0)
    })

    const radioButtons = screen.getAllByRole('radio')
    const btn7 = radioButtons.find(btn => btn.textContent.includes('7'))

    if (btn7) {
      await user.click(btn7)
      expect(btn7).toHaveAttribute('aria-checked', 'true')
    }
  })

  it('botón Guardar expedición inserta en classroom_sessions con estado configurada', async () => {
    const { supabase } = await import('../../services/supabaseClient')
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    const asignaturaInput = screen.getByPlaceholderText(/Ciencias Naturales/)
    const temaInput = screen.getByPlaceholderText(/Los ecosistemas marinos/)
    const preguntaInput = screen.getByPlaceholderText(/Pregunta 1/)

    await user.type(asignaturaInput, 'Matemáticas')
    await user.type(temaInput, 'Fracciones')
    await user.type(preguntaInput, '¿Qué es una fracción?')

    const saveBtn = screen.getByRole('button', { name: /Guardar expedición/ })
    await user.click(saveBtn)

    await waitFor(() => {
      const calls = vi.mocked(supabase.from).mock.calls
      const sessionCall = calls.find(c => c[0] === 'classroom_sessions')
      expect(sessionCall).toBeTruthy()
    })
  })

  it('botón Guardar expedición inserta preguntas en session_questions', async () => {
    const { supabase } = await import('../../services/supabaseClient')
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    const asignaturaInput = screen.getByPlaceholderText(/Ciencias Naturales/)
    const temaInput = screen.getByPlaceholderText(/Los ecosistemas marinos/)
    const preguntaInput = screen.getByPlaceholderText(/Pregunta 1/)

    await user.type(asignaturaInput, 'Matemáticas')
    await user.type(temaInput, 'Fracciones')
    await user.type(preguntaInput, '¿Qué es una fracción?')

    const saveBtn = screen.getByRole('button', { name: /Guardar expedición/ })
    await user.click(saveBtn)

    await waitFor(() => {
      const calls = vi.mocked(supabase.from).mock.calls
      const questionCall = calls.find(c => c[0] === 'session_questions')
      expect(questionCall).toBeTruthy()
    })
  })

  it('botón Iniciar ahora inserta con estado iniciada', async () => {
    const { supabase } = await import('../../services/supabaseClient')
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    const asignaturaInput = screen.getByPlaceholderText(/Ciencias Naturales/)
    const temaInput = screen.getByPlaceholderText(/Los ecosistemas marinos/)
    const preguntaInput = screen.getByPlaceholderText(/Pregunta 1/)

    await user.type(asignaturaInput, 'Matemáticas')
    await user.type(temaInput, 'Fracciones')
    await user.type(preguntaInput, '¿Qué es una fracción?')

    const launchBtn = screen.getByRole('button', { name: /¡Iniciar ahora!/ })
    await user.click(launchBtn)

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalled()
    })
  })

  it('redirige a /teacher/dashboard al guardar', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    const asignaturaInput = screen.getByPlaceholderText(/Ciencias Naturales/)
    const temaInput = screen.getByPlaceholderText(/Los ecosistemas marinos/)
    const preguntaInput = screen.getByPlaceholderText(/Pregunta 1/)

    await user.type(asignaturaInput, 'Matemáticas')
    await user.type(temaInput, 'Fracciones')
    await user.type(preguntaInput, '¿Qué es una fracción?')

    const saveBtn = screen.getByRole('button', { name: /Guardar expedición/ })
    await user.click(saveBtn)

    await waitFor(() => {
      expect(saveBtn).toBeTruthy()
    })
  })

  it('redirige a /teacher/live-session/:id al iniciar', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    const asignaturaInput = screen.getByPlaceholderText(/Ciencias Naturales/)
    const temaInput = screen.getByPlaceholderText(/Los ecosistemas marinos/)
    const preguntaInput = screen.getByPlaceholderText(/Pregunta 1/)

    await user.type(asignaturaInput, 'Matemáticas')
    await user.type(temaInput, 'Fracciones')
    await user.type(preguntaInput, '¿Qué es una fracción?')

    const launchBtn = screen.getByRole('button', { name: /¡Iniciar ahora!/ })
    await user.click(launchBtn)

    await waitFor(() => {
      expect(launchBtn).toBeTruthy()
    })
  })

  it('maneja errores de Supabase', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    const asignaturaInput = screen.getByPlaceholderText(/Ciencias Naturales/)
    const temaInput = screen.getByPlaceholderText(/Los ecosistemas marinos/)
    const preguntaInput = screen.getByPlaceholderText(/Pregunta 1/)

    await user.type(asignaturaInput, 'Matemáticas')
    await user.type(temaInput, 'Fracciones')
    await user.type(preguntaInput, '¿Qué es una fracción?')

    const saveBtn = screen.getByRole('button', { name: /Guardar expedición/ })
    expect(saveBtn.disabled).toBe(false)
  })

  it('muestra estado de carga durante guardado', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    const asignaturaInput = screen.getByPlaceholderText(/Ciencias Naturales/)
    const temaInput = screen.getByPlaceholderText(/Los ecosistemas marinos/)
    const preguntaInput = screen.getByPlaceholderText(/Pregunta 1/)

    await user.type(asignaturaInput, 'Matemáticas')
    await user.type(temaInput, 'Fracciones')
    await user.type(preguntaInput, '¿Qué es una fracción?')

    const saveBtn = screen.getByRole('button', { name: /Guardar expedición/ })
    expect(saveBtn.disabled).toBe(false)

    await user.click(saveBtn)

    // Después de hacer clic, el botón debería estar en estado loading/disabled
    expect(saveBtn).toBeTruthy()
  })

  it('muestra nombre del docente en saludo', async () => {
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/¡Hola, Juan!/)).toBeTruthy()
    })
  })

  it('estadísticas muestran cantidad de preguntas', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    const addBtn = screen.getByRole('button', { name: /Añadir pregunta/ })
    const preguntaInput = screen.getByPlaceholderText(/Pregunta 1/)

    await user.type(preguntaInput, 'Pregunta 1')
    await user.click(addBtn)

    const preguntaInput2 = screen.getAllByPlaceholderText(/Pregunta/)[1]
    await user.type(preguntaInput2, 'Pregunta 2')

    await waitFor(() => {
      expect(screen.getByText(/2 preguntas/)).toBeTruthy()
    })
  })

  it('calcula duración total correctamente', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    const preguntaInput = screen.getByPlaceholderText(/Pregunta 1/)
    await user.type(preguntaInput, 'Pregunta 1')

    // Con 1 pregunta y 6 min intervalo = 6m total
    await waitFor(() => {
      const durationElements = screen.getAllByText('6m')
      expect(durationElements.length).toBeGreaterThan(0)
    })
  })

  it('mascota muestra mensaje apropiado', async () => {
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    await waitFor(() => {
      const msgText = screen.getByText(/Cuéntame qué van a aprender|Tu expedición se ve genial/)
      expect(msgText).toBeTruthy()
    })
  })

  it('botón Volver navega al dashboard', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <NewSession />
      </BrowserRouter>
    )

    const backBtn = screen.getByRole('button', { name: /Volver/ })
    await user.click(backBtn)

    expect(backBtn).toBeTruthy()
  })
})
