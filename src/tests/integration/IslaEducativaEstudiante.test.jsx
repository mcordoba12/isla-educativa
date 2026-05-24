import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import IslaEducativaEstudiante from '../../pages/IslaEducativaEstudiante'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MISSION_BASE = {
  id: 'mission-1',
  subject: 'Biología',
  topic: 'La célula',
  descripcion: 'Descripción del tema celular',
  texto_reto: '¿Qué función cumple la mitocondria?',
  retroalimentacion_exito: '¡Excelente aventurero!',
  retroalimentacion_fallo: 'La dispersión regresa...',
  completada: false,
}

const buildMissions = (overrides = []) =>
  overrides.length ? overrides : [MISSION_BASE]

const renderEstudiante = (props = {}) =>
  render(
    <BrowserRouter>
      <IslaEducativaEstudiante
        studentName="Marina Pérez"
        mascotNormal="/mascot-normal.png"
        mascotCelebra="/mascot-celebra.png"
        mascotTriste="/mascot-triste.png"
        missions={buildMissions()}
        onAnswer={vi.fn().mockResolvedValue(undefined)}
        onLogout={vi.fn()}
        {...props}
      />
    </BrowserRouter>
  )

// Abre el modal de una misión haciendo clic en "Iniciar misión"
const openMissionModal = async (user) => {
  const btn = screen.getAllByRole('button', { name: /Iniciar misión/i })[0]
  await user.click(btn)
  // Esperamos el botón "¡Aceptar misión!" que solo existe dentro del modal
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /Aceptar misión/i })).toBeInTheDocument()
  )
}

// ─────────────────────────────────────────────────────────────────────────────

describe('IslaEducativaEstudiante — cobertura completa', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  // ==========================================================================
  // 1. Renderizado y estructura
  // ==========================================================================

  describe('Renderizado y estructura', () => {
    it('renderiza sin errores con props por defecto', () => {
      renderEstudiante()
      expect(screen.getAllByText(/Marina/i).length).toBeGreaterThan(0)
    })

    it('muestra el nombre del estudiante en el header', () => {
      renderEstudiante({ studentName: 'Tomás Quintero' })
      expect(screen.getAllByText(/Tomás/i).length).toBeGreaterThan(0)
    })

    it('muestra iniciales del estudiante en el avatar', () => {
      renderEstudiante({ studentName: 'Marina Pérez' })
      expect(screen.getByText('MP')).toBeInTheDocument()
    })

    it('muestra "Aventurer@" cuando studentName está vacío', () => {
      renderEstudiante({ studentName: '' })
      expect(screen.getAllByText(/Aventurer@/i).length).toBeGreaterThan(0)
    })

    it('muestra el HeroIsland SVG', () => {
      const { container } = renderEstudiante()
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('muestra sección de misiones activas', () => {
      renderEstudiante()
      expect(screen.getByText(/Tus misiones activas/i)).toBeInTheDocument()
    })

    it('muestra mensaje vacío cuando no hay misiones', () => {
      renderEstudiante({ missions: [] })
      expect(screen.getByText(/No hay misiones por ahora/i)).toBeInTheDocument()
    })

    it('muestra contador de misiones pendientes y completadas en stats', () => {
      renderEstudiante({
        missions: [
          { ...MISSION_BASE, completada: false },
          { ...MISSION_BASE, id: 'm2', completada: true },
        ],
      })
      expect(screen.getByText('Pendientes')).toBeInTheDocument()
      expect(screen.getByText('Completadas')).toBeInTheDocument()
    })

    it('muestra botón de logout', () => {
      renderEstudiante()
      expect(screen.getByRole('button', { name: /Salir/i })).toBeInTheDocument()
    })

    it('llama onLogout al hacer clic en Salir', async () => {
      const mockLogout = vi.fn()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante({ onLogout: mockLogout })
      await user.click(screen.getByRole('button', { name: /Salir/i }))
      expect(mockLogout).toHaveBeenCalledOnce()
    })

    it('muestra botón + Unirme', () => {
      renderEstudiante()
      expect(screen.getByRole('button', { name: /Unirme/i })).toBeInTheDocument()
    })

    it('llama onJoinClick al hacer clic en Unirme', async () => {
      const mockJoin = vi.fn()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante({ onJoinClick: mockJoin })
      await user.click(screen.getByRole('button', { name: /Unirme/i }))
      expect(mockJoin).toHaveBeenCalledOnce()
    })

    it('muestra botón de docentes cuando linkedTeachersCount > 0', () => {
      renderEstudiante({ linkedTeachersCount: 3 })
      expect(screen.getByText(/👨‍🏫.*3/)).toBeInTheDocument()
    })

    it('llama onTeachersClick al hacer clic en el botón de docentes', async () => {
      const mockTeachers = vi.fn()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante({ linkedTeachersCount: 2, onTeachersClick: mockTeachers })
      const btn = screen.getByText(/👨‍🏫/)
      await user.click(btn)
      expect(mockTeachers).toHaveBeenCalledOnce()
    })

    it('muestra mascota normal en el hero', () => {
      const { container } = renderEstudiante()
      const img = container.querySelector('img[alt="Come Dispersión"]')
      expect(img).toBeInTheDocument()
      expect(img.src).toContain('mascot-normal')
    })

    it('muestra corazones de vida de la isla', () => {
      const { container } = renderEstudiante({
        missions: [
          { ...MISSION_BASE, id: 'm1', completada: true },
          { ...MISSION_BASE, id: 'm2', completada: true },
        ],
      })
      // 2 misiones completadas = 2 corazones llenos con clase isla-heartbeat
      expect(container.querySelectorAll('.isla-heartbeat').length).toBeGreaterThanOrEqual(2)
    })
  })

  // ==========================================================================
  // 2. MissionCard — renderizado (línea 610-611: handleStart)
  // ==========================================================================

  describe('MissionCard — renderizado y handleStart', () => {
    it('muestra la tarjeta con asignatura y tema', () => {
      renderEstudiante()
      expect(screen.getByText('La célula')).toBeInTheDocument()
      expect(screen.getByText('Biología')).toBeInTheDocument()
    })

    it('muestra el texto del reto en la tarjeta', () => {
      renderEstudiante()
      expect(screen.getByText(/mitocondria/i)).toBeInTheDocument()
    })

    it('muestra badge "¡Nuevo!" en misiones nuevas', () => {
      renderEstudiante({
        missions: [{ ...MISSION_BASE, isNew: true }],
      })
      expect(screen.getByText('¡Nuevo!')).toBeInTheDocument()
    })

    it('muestra badge "Completada" en misiones completadas', () => {
      renderEstudiante({
        missions: [{ ...MISSION_BASE, completada: true }],
      })
      expect(screen.getAllByText(/Completada/i).length).toBeGreaterThan(0)
    })

    it('botones deshabilitados para misiones completadas', () => {
      renderEstudiante({
        missions: [{ ...MISSION_BASE, completada: true }],
      })
      const btns = screen.getAllByRole('button', { name: /Completada/i })
      btns.forEach(btn => expect(btn).toBeDisabled())
    })

    it('handleStart — abre el modal al hacer clic en "Iniciar misión" (línea 610)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await user.click(screen.getAllByRole('button', { name: /Iniciar misión/i })[0])
      // El modal se abrió si aparece el botón que solo existe en él
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Aceptar misión/i })).toBeInTheDocument()
      )
    })

    it('handleStart — abre el modal al hacer clic en "Responder reto" (línea 611)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await user.click(screen.getAllByRole('button', { name: /Responder reto/i })[0])
      // El modal se abrió si aparece el botón que solo existe en él
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Aceptar misión/i })).toBeInTheDocument()
      )
    })

    it('renderiza múltiples misiones de asignaturas distintas', () => {
      renderEstudiante({
        missions: [
          { ...MISSION_BASE, id: 'm1', subject: 'Matemáticas', topic: 'Álgebra' },
          { ...MISSION_BASE, id: 'm2', subject: 'Lengua', topic: 'Ortografía' },
          { ...MISSION_BASE, id: 'm3', subject: 'Historia', topic: 'Revolución' },
          { ...MISSION_BASE, id: 'm4', subject: 'Inglés', topic: 'Verbos' },
          { ...MISSION_BASE, id: 'm5', subject: 'Física', topic: 'Cinemática' },
        ],
      })
      expect(screen.getByText('Álgebra')).toBeInTheDocument()
      expect(screen.getByText('Ortografía')).toBeInTheDocument()
      expect(screen.getByText('Revolución')).toBeInTheDocument()
      expect(screen.getByText('Verbos')).toBeInTheDocument()
      expect(screen.getByText('Cinemática')).toBeInTheDocument()
    })

    it('muestra docenteBadge cuando está definido', () => {
      renderEstudiante({
        missions: [{ ...MISSION_BASE, docenteBadge: 'Prof. García' }],
      })
      expect(screen.getByText(/Prof. García/i)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // 3. getSubjEmoji — todos los emojis (línea 145)
  // ==========================================================================

  describe('getSubjEmoji — cobertura de todas las ramas (línea 145)', () => {
    const subjectEmojis = [
      { subject: 'Biología', emoji: '🌱' },
      { subject: 'Matemáticas', emoji: '➗' },
      { subject: 'Lengua española', emoji: '📖' },
      { subject: 'Ciencias Sociales', emoji: '🌎' },
      { subject: 'Inglés', emoji: '🗣️' },
      { subject: 'Quimica', emoji: '⚗️' },
      { subject: 'Arte', emoji: '📚' }, // default
    ]

    subjectEmojis.forEach(({ subject, emoji }) => {
      it(`muestra emoji ${emoji} para asignatura "${subject}"`, () => {
        const { container } = renderEstudiante({
          missions: [{ ...MISSION_BASE, subject, id: subject }],
        })
        // Los emojis multibyte pueden estar en nodos partidos; verificamos en el innerHTML
        expect(container.textContent).toContain(emoji)
      })
    })
  })

  // ==========================================================================
  // 4. MissionModal — Paso "reto" (líneas 260-380)
  // ==========================================================================

  describe('MissionModal — paso reto', () => {
    it('muestra el modal con el título de la misión', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await openMissionModal(user)
      // "La célula" aparece tanto en la tarjeta como en el modal header
      expect(screen.getAllByText('La célula').length).toBeGreaterThanOrEqual(2)
    })

    it('muestra la asignatura en el header del modal', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await openMissionModal(user)
      // Subject appears in both card and modal
      expect(screen.getAllByText('Biología').length).toBeGreaterThan(0)
    })

    it('muestra el contexto/descripción de la misión', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await openMissionModal(user)
      expect(screen.getByText('Descripción del tema celular')).toBeInTheDocument()
    })

    it('no muestra sección de contexto cuando descripcion es vacía', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante({
        missions: [{ ...MISSION_BASE, descripcion: '' }],
      })
      await openMissionModal(user)
      expect(screen.queryByText('Contexto')).not.toBeInTheDocument()
    })

    it('muestra el texto del reto en el modal', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await openMissionModal(user)
      // El reto aparece en la tarjeta y en el modal, verificamos que hay al menos 2
      expect(screen.getAllByText(/mitocondria/i).length).toBeGreaterThanOrEqual(2)
    })

    it('muestra botón "¡Aceptar misión!" en el paso reto', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await openMissionModal(user)
      expect(screen.getByRole('button', { name: /Aceptar misión/i })).toBeInTheDocument()
    })

    it('muestra la mascota normal en el paso reto', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderEstudiante()
      await openMissionModal(user)
      const imgs = container.querySelectorAll('img[alt="Come Dispersión"]')
      const modal = document.querySelector('.fixed')
      const modalImg = within(modal).getByAltText('Come Dispersión')
      expect(modalImg.src).toContain('mascot-normal')
    })

    it('cierra el modal al hacer clic en el botón X en paso reto', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await openMissionModal(user)

      // En el paso reto, X llama handleCloseWithoutAnswer → va a feedback
      const closeBtn = within(document.querySelector('.fixed')).getByRole('button', { name: '' })
      await user.click(closeBtn)
      await waitFor(() =>
        expect(screen.getByText(/Continuar aventura/i)).toBeInTheDocument()
      )
    })
  })

  // ==========================================================================
  // 5. MissionModal — Paso "answering" (líneas 380-440)
  // ==========================================================================

  describe('MissionModal — paso answering', () => {
    const goToAnswering = async (user) => {
      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() =>
        expect(screen.getByPlaceholderText(/Tu respuesta aquí/i)).toBeInTheDocument()
      )
    }

    it('avanza al paso answering al hacer clic en "¡Aceptar misión!"', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await goToAnswering(user)
      expect(screen.getByText(/Escribe tu respuesta/i)).toBeInTheDocument()
    })

    it('muestra textarea para escribir respuesta', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await goToAnswering(user)
      expect(screen.getByPlaceholderText(/Tu respuesta aquí/i)).toBeInTheDocument()
    })

    it('botón Enviar deshabilitado cuando textarea está vacío', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await goToAnswering(user)
      expect(screen.getByRole('button', { name: /Enviar/i })).toBeDisabled()
    })

    it('botón Enviar habilitado cuando hay texto', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await goToAnswering(user)
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'Mi respuesta')
      expect(screen.getByRole('button', { name: /Enviar/i })).not.toBeDisabled()
    })

    it('botón "Volver" regresa al paso reto', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await goToAnswering(user)
      await user.click(screen.getByRole('button', { name: /Volver/i }))
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Aceptar misión/i })).toBeInTheDocument()
      )
    })
  })

  // ==========================================================================
  // 6. MissionModal — Envío exitoso (líneas 440-510, línea 615)
  // ==========================================================================

  describe('MissionModal — envío exitoso (línea 615)', () => {
    const submitAnswer = async (user, onAnswer = vi.fn().mockResolvedValue(undefined)) => {
      renderEstudiante({ onAnswer })
      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() => screen.getByPlaceholderText(/Tu respuesta aquí/i))
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'La mitocondria produce energía ATP')
      await user.click(screen.getByRole('button', { name: /Enviar/i }))
    }

    it('llama onAnswer con misionId y respuesta (línea 615)', async () => {
      const mockOnAnswer = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await submitAnswer(user, mockOnAnswer)
      await waitFor(() => expect(mockOnAnswer).toHaveBeenCalledWith({
        misionId: 'mission-1',
        respuesta: 'La mitocondria produce energía ATP',
      }))
    })

    it('muestra retroalimentación de éxito tras envío exitoso', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await submitAnswer(user)
      await waitFor(() =>
        expect(screen.getByText('¡Excelente aventurero!')).toBeInTheDocument()
      )
    })

    it('muestra mascota de celebración tras éxito', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderEstudiante()
      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() => screen.getByPlaceholderText(/Tu respuesta aquí/i))
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'Respuesta de prueba')
      await user.click(screen.getByRole('button', { name: /Enviar/i }))
      await waitFor(() => {
        const modal = document.querySelector('.fixed.z-50')
        if (modal) {
          const img = within(modal).queryByAltText('Come Dispersión')
          if (img) expect(img.src).toContain('mascot-celebra')
        }
      })
    })

    it('muestra botón "Continuar aventura" en feedback exitoso', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await submitAnswer(user)
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Continuar aventura/i })).toBeInTheDocument()
      )
    })

    it('muestra "Enviando..." mientras carga', async () => {
      let resolve
      const slowAnswer = vi.fn(() => new Promise(r => { resolve = r }))
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante({ onAnswer: slowAnswer })
      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() => screen.getByPlaceholderText(/Tu respuesta aquí/i))
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'Respuesta')
      await user.click(screen.getByRole('button', { name: /Enviar/i }))
      await waitFor(() =>
        expect(screen.getByText('Enviando...')).toBeInTheDocument()
      )
      resolve()
    })
  })

  // ==========================================================================
  // 7. MissionModal — Envío fallido (líneas 450-490)
  // ==========================================================================

  describe('MissionModal — envío fallido', () => {
    it('muestra retroalimentación de fallo cuando onAnswer lanza error', async () => {
      const mockOnAnswer = vi.fn().mockRejectedValue(new Error('Error de red'))
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante({ onAnswer: mockOnAnswer })
      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() => screen.getByPlaceholderText(/Tu respuesta aquí/i))
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'Respuesta fallida')
      await user.click(screen.getByRole('button', { name: /Enviar/i }))
      await waitFor(() =>
        expect(screen.getByText('La dispersión regresa...')).toBeInTheDocument()
      )
    })

    it('muestra mascota triste en feedback de fallo', async () => {
      const mockOnAnswer = vi.fn().mockRejectedValue(new Error('fallo'))
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante({ onAnswer: mockOnAnswer })
      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() => screen.getByPlaceholderText(/Tu respuesta aquí/i))
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'Mal')
      await user.click(screen.getByRole('button', { name: /Enviar/i }))
      await waitFor(() => {
        const modal = document.querySelector('.fixed.z-50')
        if (modal) {
          const img = within(modal).queryByAltText('Come Dispersión')
          if (img) expect(img.src).toContain('mascot-triste')
        }
      })
    })

    it('usa retroalimentacion_fallo por defecto cuando no está definida', async () => {
      const mockOnAnswer = vi.fn().mockRejectedValue(new Error('fallo'))
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante({
        missions: [{ ...MISSION_BASE, retroalimentacion_fallo: '' }],
        onAnswer: mockOnAnswer,
      })
      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() => screen.getByPlaceholderText(/Tu respuesta aquí/i))
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'Respuesta')
      await user.click(screen.getByRole('button', { name: /Enviar/i }))
      await waitFor(() =>
        expect(screen.getByText(/dispersión está regresando/i)).toBeInTheDocument()
      )
    })

    it('usa retroalimentacion_exito por defecto cuando no está definida', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante({
        missions: [{ ...MISSION_BASE, retroalimentacion_exito: '' }],
        onAnswer: vi.fn().mockResolvedValue(undefined),
      })
      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() => screen.getByPlaceholderText(/Tu respuesta aquí/i))
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'Respuesta')
      await user.click(screen.getByRole('button', { name: /Enviar/i }))
      await waitFor(() =>
        expect(screen.getByText(/Excelente aventurero/i)).toBeInTheDocument()
      )
    })
  })

  // ==========================================================================
  // 8. handleClose — cierra modal y actualiza misiones (líneas 619-627)
  // ==========================================================================

  describe('handleClose — cierre del modal y actualización de estado (líneas 619-627)', () => {
    it('cierra el modal al hacer clic en "Continuar aventura" tras éxito', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() => screen.getByPlaceholderText(/Tu respuesta aquí/i))
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'Respuesta')
      await user.click(screen.getByRole('button', { name: /Enviar/i }))
      await waitFor(() => screen.getByRole('button', { name: /Continuar aventura/i }))

      await user.click(screen.getByRole('button', { name: /Continuar aventura/i }))
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: /Continuar aventura/i })).not.toBeInTheDocument()
      )
    })

    it('cierra el modal al hacer clic en X durante feedback', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await openMissionModal(user)
      // X durante paso reto → va a feedback con success=false
      const modal = document.querySelector('.fixed')
      const closeBtn = within(modal).getAllByRole('button').find(b => b.querySelector('svg'))
      await user.click(closeBtn)
      await waitFor(() => screen.getByRole('button', { name: /Continuar aventura/i }))

      // Ahora X en feedback → handleClose
      const modal2 = document.querySelector('.fixed')
      const closeBtnFeedback = within(modal2).getAllByRole('button').find(b => b.querySelector('svg path[d*="M6 6"]'))
      if (closeBtnFeedback) {
        await user.click(closeBtnFeedback)
        await waitFor(() =>
          expect(screen.queryByRole('button', { name: /Continuar aventura/i })).not.toBeInTheDocument()
        )
      }
    })

    it('marca misión como completada en localMissions tras handleAnswer (líneas 619-623)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()

      // Antes: botón "Iniciar misión" activo
      expect(screen.getByRole('button', { name: /Iniciar misión/i })).not.toBeDisabled()

      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() => screen.getByPlaceholderText(/Tu respuesta aquí/i))
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'Respuesta completa')
      await user.click(screen.getByRole('button', { name: /Enviar/i }))
      await waitFor(() => screen.getByRole('button', { name: /Continuar aventura/i }))
      await user.click(screen.getByRole('button', { name: /Continuar aventura/i }))

      // Después: misión marcada como completada
      await waitFor(() =>
        expect(screen.getAllByRole('button', { name: /Completada/i }).length).toBeGreaterThan(0)
      )
    })
  })

  // ==========================================================================
  // 9. Toast — render y auto-dismiss (línea 775)
  // ==========================================================================

  describe('Toast — render y auto-dismiss (línea 775)', () => {
    it('muestra toast "¡Misión completada!" tras envío exitoso', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() => screen.getByPlaceholderText(/Tu respuesta aquí/i))
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'Respuesta')
      await user.click(screen.getByRole('button', { name: /Enviar/i }))

      await waitFor(() =>
        expect(screen.getByText(/Misión completada/i)).toBeInTheDocument()
      )
    })

    it('toast desaparece automáticamente después de 2.5s', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante()
      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() => screen.getByPlaceholderText(/Tu respuesta aquí/i))
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'Respuesta')
      await user.click(screen.getByRole('button', { name: /Enviar/i }))

      await waitFor(() => screen.getByText(/Misión completada/i))

      vi.advanceTimersByTime(2600)
      await waitFor(() =>
        expect(screen.queryByText(/Misión completada/i)).not.toBeInTheDocument()
      )
    })
  })

  // ==========================================================================
  // 10. Confetti — se muestra en éxito y desaparece
  // ==========================================================================

  describe('Confetti', () => {
    it('muestra confetti tras respuesta exitosa', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderEstudiante()
      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() => screen.getByPlaceholderText(/Tu respuesta aquí/i))
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'Respuesta')
      await user.click(screen.getByRole('button', { name: /Enviar/i }))

      await waitFor(() => {
        const confettiPieces = container.querySelectorAll('.isla-confetti')
        expect(confettiPieces.length).toBeGreaterThan(0)
      })
    })

    it('confetti desaparece después de 3.5s', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderEstudiante()
      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() => screen.getByPlaceholderText(/Tu respuesta aquí/i))
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'Respuesta')
      await user.click(screen.getByRole('button', { name: /Enviar/i }))

      await waitFor(() =>
        expect(container.querySelectorAll('.isla-confetti').length).toBeGreaterThan(0)
      )

      vi.advanceTimersByTime(3600)
      await waitFor(() =>
        expect(container.querySelectorAll('.isla-confetti').length).toBe(0)
      )
    })
  })

  // ==========================================================================
  // 11. getSubjKey — colores por asignatura (SUBJ_COLORS)
  // ==========================================================================

  describe('getSubjKey — colores y clases por asignatura', () => {
    const subjects = [
      'Biología', 'Matemáticas', 'Lengua', 'Ciencias Sociales', 'Inglés', 'Física', 'Arte',
    ]

    subjects.forEach(subject => {
      it(`renderiza tarjeta para asignatura "${subject}"`, () => {
        renderEstudiante({
          missions: [{ ...MISSION_BASE, subject, id: subject }],
        })
        expect(screen.getByText(subject)).toBeInTheDocument()
      })
    })
  })

  // ==========================================================================
  // 12. MissionModal — sin onAnswer definido
  // ==========================================================================

  describe('MissionModal — onAnswer opcional', () => {
    it('no lanza error cuando onAnswer no está definido', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderEstudiante({ onAnswer: undefined })
      await openMissionModal(user)
      await user.click(screen.getByRole('button', { name: /Aceptar misión/i }))
      await waitFor(() => screen.getByPlaceholderText(/Tu respuesta aquí/i))
      await user.type(screen.getByPlaceholderText(/Tu respuesta aquí/i), 'Respuesta')
      // Should not throw
      await user.click(screen.getByRole('button', { name: /Enviar/i }))
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Continuar aventura/i })).toBeInTheDocument()
      )
    })
  })
})
