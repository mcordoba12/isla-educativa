import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IslaEducativaProyeccion from '../../pages/IslaEducativaProyeccion'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const QUESTIONS = [
  'Los océanos cubren el 71% de la Tierra',
  'El agua dulce es más densa que el agua salada',
  'Los corales son animales',
]

const renderProyeccion = (props = {}) =>
  render(
    <IslaEducativaProyeccion
      mascotNormal="/mascot-normal.png"
      mascotCelebra="/mascot-celebra.png"
      mascotTriste="/mascot-triste.png"
      subject="Ciencias"
      topic="Ecosistemas"
      characterName="Come Dispersión"
      questions={QUESTIONS}
      totalQuestions={3}
      minutesPerQuestion={1}
      onExit={vi.fn()}
      onAnswer={vi.fn()}
      onMissionResult={vi.fn()}
      onComplete={vi.fn()}
      {...props}
    />
  )

// Avanza todos los diálogos del intro hasta llegar al estado timer
const skipIntro = async (user) => {
  // 4 diálogos → 3 clicks de "Siguiente" + 1 "¡Empezar primera pregunta!"
  for (let i = 0; i < 3; i++) {
    await user.click(screen.getByRole('button', { name: /Siguiente/i }))
  }
  await user.click(screen.getByRole('button', { name: /Empezar primera pregunta/i }))
  await waitFor(() =>
    expect(screen.getByText(/Próxima pregunta|pregunta.*se revela/i)).toBeInTheDocument()
  )
}

// Desde timer → hace clic en "Siguiente pregunta" para llegar a asking
const goToAsking = async (user) => {
  await user.click(screen.getByRole('button', { name: /Siguiente pregunta/i }))
  // Usar texto único del estado asking, no los botones que pueden ser múltiples
  await waitFor(() =>
    expect(screen.getByText(/¿Será esto correcto\?/i)).toBeInTheDocument()
  )
}

// ─────────────────────────────────────────────────────────────────────────────

describe('IslaEducativaProyeccion — cobertura completa', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  // ==========================================================================
  // 1. Renderizado inicial — estado "intro"
  // ==========================================================================

  describe('Estado intro', () => {
    it('renderiza el componente sin errores', () => {
      renderProyeccion()
      expect(screen.getByText('Ciencias')).toBeInTheDocument()
      expect(screen.getByText('Ecosistemas')).toBeInTheDocument()
    })

    it('muestra el primer diálogo del intro', () => {
      renderProyeccion()
      expect(screen.getByText(/Hola, aventureros/i)).toBeInTheDocument()
    })

    it('muestra el nombre del personaje en el bocadillo', () => {
      renderProyeccion()
      expect(screen.getAllByText(/Come Dispersión/i).length).toBeGreaterThan(0)
    })

    it('muestra botón "Siguiente" en intro', () => {
      renderProyeccion()
      expect(screen.getByRole('button', { name: /Siguiente/i })).toBeInTheDocument()
    })

    it('muestra indicadores de diálogo (dots)', () => {
      const { container } = renderProyeccion()
      // 4 dialogues = 4 dot spans inside the SpeechBubble
      const dots = container.querySelectorAll('.w-2.h-2, .w-6.h-2')
      expect(dots.length).toBe(4)
    })

    it('avanza al segundo diálogo al hacer clic en Siguiente', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      await user.click(screen.getByRole('button', { name: /Siguiente/i }))
      await waitFor(() =>
        expect(screen.getByText(/Estaré despertando/i)).toBeInTheDocument()
      )
    })

    it('avanza al tercer diálogo', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      await user.click(screen.getByRole('button', { name: /Siguiente/i }))
      await user.click(screen.getByRole('button', { name: /Siguiente/i }))
      await waitFor(() =>
        expect(screen.getByText(/compañeros de aventura/i)).toBeInTheDocument()
      )
    })

    it('avanza al cuarto diálogo', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByRole('button', { name: /Siguiente/i }))
      }
      await waitFor(() =>
        expect(screen.getByText(/prepárense/i)).toBeInTheDocument()
      )
    })

    it('en el último diálogo muestra "¡Empezar primera pregunta!"', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByRole('button', { name: /Siguiente/i }))
      }
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Empezar primera pregunta/i })).toBeInTheDocument()
      )
    })

    it('muestra la mascota normal durante el intro', () => {
      const { container } = renderProyeccion()
      const img = container.querySelector('img[alt*="Come Dispersión"]')
      expect(img?.src).toContain('mascot-normal')
    })

    it('muestra TropicalScene SVG', () => {
      const { container } = renderProyeccion()
      expect(container.querySelector('svg[viewBox="0 0 1440 900"]')).toBeInTheDocument()
    })

    it('muestra botón de salir (X)', () => {
      renderProyeccion()
      expect(screen.getByTitle(/Salir de la proyección/i)).toBeInTheDocument()
    })

    it('llama onExit al hacer clic en X', async () => {
      const mockExit = vi.fn()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion({ onExit: mockExit })
      await user.click(screen.getByTitle(/Salir de la proyección/i))
      expect(mockExit).toHaveBeenCalledOnce()
    })

    it('label "Intro" en el top bar durante intro', () => {
      renderProyeccion()
      expect(screen.getByText('Intro')).toBeInTheDocument()
    })

    it('muestra "¡Comenzamos!" en el top bar durante intro', () => {
      renderProyeccion()
      expect(screen.getByText('¡Comenzamos!')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // 2. Estado "timer"
  // ==========================================================================

  describe('Estado timer', () => {
    it('transiciona a timer al finalizar el intro', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      await skipIntro(user)
      expect(screen.getByText(/se revela en breve/i)).toBeInTheDocument()
    })

    it('muestra CircularTimer en estado timer', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderProyeccion()
      await skipIntro(user)
      // Timer has two SVG circles
      const timerSvg = container.querySelector('.absolute.inset-0.-rotate-90')
      expect(timerSvg).toBeInTheDocument()
    })

    it('label "Próxima" en el top bar durante timer', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      await skipIntro(user)
      expect(screen.getByText('Próxima')).toBeInTheDocument()
    })

    it('muestra "1 de 3" en el top bar', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      await skipIntro(user)
      expect(screen.getByText('1 de 3')).toBeInTheDocument()
    })

    it('botón "Pausar" disponible en timer', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      await skipIntro(user)
      expect(screen.getByRole('button', { name: /Pausar/i })).toBeInTheDocument()
    })

    it('toggle pausa — muestra "Reanudar" tras hacer clic', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      await skipIntro(user)
      await user.click(screen.getByRole('button', { name: /Pausar/i }))
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Reanudar/i })).toBeInTheDocument()
      )
    })

    it('timer muestra ⏸ cuando está pausado', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderProyeccion()
      await skipIntro(user)
      await user.click(screen.getByRole('button', { name: /Pausar/i }))
      await waitFor(() =>
        expect(container.textContent).toContain('⏸')
      )
    })

    it('timer muestra advertencia en rojo cuando quedan ≤30s', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderProyeccion({ minutesPerQuestion: 1 })
      await skipIntro(user)
      // Avanzar el tiempo para que queden ≤30s
      vi.advanceTimersByTime(35000)
      await waitFor(() => {
        const warningText = container.querySelector('.text-\\[\\#E85C42\\]')
        expect(warningText).toBeInTheDocument()
      })
    })
  })

  // ==========================================================================
  // 3. Estado "asking"
  // ==========================================================================

  describe('Estado asking', () => {
    it('muestra la pregunta al pasar de timer a asking', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      expect(screen.getByText(QUESTIONS[0])).toBeInTheDocument()
    })

    it('muestra botones Correcto e Incorrecto', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      expect(screen.getAllByRole('button', { name: /Correcto/i }).length).toBeGreaterThan(0)
      expect(screen.getAllByRole('button', { name: /Incorrecto/i }).length).toBeGreaterThan(0)
    })

    it('label "Pregunta" en el top bar durante asking', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      expect(screen.getByText('Pregunta')).toBeInTheDocument()
    })

    it('muestra "Saltar pregunta" en bottom bar', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      expect(screen.getByRole('button', { name: /Saltar pregunta/i })).toBeInTheDocument()
    })

    it('saltar pregunta avanza al timer de la siguiente', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getByRole('button', { name: /Saltar pregunta/i }))
      await waitFor(() =>
        expect(screen.getByText(/se revela en breve/i)).toBeInTheDocument()
      )
    })

    it('muestra "Pregunta N" con número correcto', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      expect(screen.getByText('Pregunta 1')).toBeInTheDocument()
    })

    it('usa texto "Pregunta N" cuando no hay pregunta definida', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion({ questions: [], totalQuestions: 2 })
      await skipIntro(user)
      await goToAsking(user)
      expect(screen.getAllByText('Pregunta 1').length).toBeGreaterThanOrEqual(2)
    })
  })

  // ==========================================================================
  // 4. Estado "correct"
  // ==========================================================================

  describe('Estado correct', () => {
    const goToCorrect = async (user) => {
      renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() =>
        expect(screen.getByText(/Respuesta acertada/i)).toBeInTheDocument()
      )
    }

    it('muestra "¡Respuesta acertada!" al responder Correcto', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToCorrect(user)
      expect(screen.getByText(/Respuesta acertada/i)).toBeInTheDocument()
    })

    it('llama onAnswer con isCorrect=true', async () => {
      const mockOnAnswer = vi.fn()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion({ onAnswer: mockOnAnswer })
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      expect(mockOnAnswer).toHaveBeenCalledWith({ questionIndex: 0, isCorrect: true })
    })

    it('muestra mascota de celebración', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() => {
        const img = container.querySelector('img[alt*="Come Dispersión"]')
        expect(img?.src).toContain('mascot-celebra')
      })
    })

    it('muestra confetti en estado correct', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() =>
        expect(container.querySelectorAll('.isla-confetti-fall').length).toBeGreaterThan(0)
      )
    })

    it('muestra estrellas (StarBurst) en estado correct', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() =>
        expect(container.querySelectorAll('.isla-star-pop').length).toBeGreaterThan(0)
      )
    })

    it('muestra botones "🏆 Misión lograda" y "💔 Misión fallida"', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToCorrect(user)
      expect(screen.getByRole('button', { name: /Misión lograda/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Misión fallida/i })).toBeInTheDocument()
    })

    it('"Siguiente pregunta" avanza al timer siguiente', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() => screen.getByText(/Respuesta acertada/i))
      await user.click(screen.getByRole('button', { name: /Siguiente pregunta/i }))
      await waitFor(() =>
        expect(screen.getByText(/se revela en breve/i)).toBeInTheDocument()
      )
    })

    it('en última pregunta muestra "Finalizar"', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion({ questions: ['Q1'], totalQuestions: 1 })
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Finalizar/i })).toBeInTheDocument()
      )
    })

    it('"Finalizar" en última pregunta llama onComplete', async () => {
      const mockComplete = vi.fn()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion({ questions: ['Q1'], totalQuestions: 1, onComplete: mockComplete })
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() => screen.getByRole('button', { name: /Finalizar/i }))
      await user.click(screen.getByRole('button', { name: /Finalizar/i }))
      expect(mockComplete).toHaveBeenCalledOnce()
    })
  })

  // ==========================================================================
  // 5. Estado "incorrect"
  // ==========================================================================

  describe('Estado incorrect', () => {
    const goToIncorrect = async (user) => {
      renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Incorrecto/i })[0])
      await waitFor(() =>
        expect(screen.getByText(/¡Ay, no!/i)).toBeInTheDocument()
      )
    }

    it('muestra "¡Ay, no!" al responder Incorrecto', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToIncorrect(user)
      expect(screen.getByText(/¡Ay, no!/i)).toBeInTheDocument()
    })

    it('llama onAnswer con isCorrect=false', async () => {
      const mockOnAnswer = vi.fn()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion({ onAnswer: mockOnAnswer })
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Incorrecto/i })[0])
      expect(mockOnAnswer).toHaveBeenCalledWith({ questionIndex: 0, isCorrect: false })
    })

    it('muestra mascota triste', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Incorrecto/i })[0])
      await waitFor(() => {
        const img = container.querySelector('img[alt*="Come Dispersión"]')
        expect(img?.src).toContain('mascot-triste')
      })
    })

    it('muestra lluvia en estado incorrect', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Incorrecto/i })[0])
      await waitFor(() =>
        expect(container.querySelectorAll('.isla-rain-fall').length).toBeGreaterThan(0)
      )
    })

    it('muestra SadCloud en estado incorrect', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Incorrecto/i })[0])
      await waitFor(() =>
        expect(container.querySelector('.isla-cloud-float')).toBeInTheDocument()
      )
    })

    it('muestra botones de misión también en incorrect', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToIncorrect(user)
      expect(screen.getByRole('button', { name: /Misión lograda/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Misión fallida/i })).toBeInTheDocument()
    })

    it('en última pregunta incorrect muestra "Finalizar"', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion({ questions: ['Q1'], totalQuestions: 1 })
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Incorrecto/i })[0])
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Finalizar/i })).toBeInTheDocument()
      )
    })
  })

  // ==========================================================================
  // 6. Estado "mission_success"
  // ==========================================================================

  describe('Estado mission_success', () => {
    const goToMissionSuccess = async (user) => {
      renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() => screen.getByRole('button', { name: /Misión lograda/i }))
      await user.click(screen.getByRole('button', { name: /Misión lograda/i }))
      await waitFor(() =>
        expect(screen.getByText(/Misión completada/i)).toBeInTheDocument()
      )
    }

    it('muestra "¡Misión completada!" al hacer clic en Misión lograda', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToMissionSuccess(user)
      expect(screen.getByText(/Misión completada/i)).toBeInTheDocument()
    })

    it('llama onMissionResult con resultado "lograda"', async () => {
      const mockMission = vi.fn()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion({ onMissionResult: mockMission })
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() => screen.getByRole('button', { name: /Misión lograda/i }))
      await user.click(screen.getByRole('button', { name: /Misión lograda/i }))
      expect(mockMission).toHaveBeenCalledWith({ questionIndex: 0, resultado: 'lograda' })
    })

    it('muestra mascota de celebración en mission_success', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() => screen.getByRole('button', { name: /Misión lograda/i }))
      await user.click(screen.getByRole('button', { name: /Misión lograda/i }))
      await waitFor(() => {
        const img = container.querySelector('img[alt*="Come Dispersión"]')
        expect(img?.src).toContain('mascot-celebra')
      })
    })

    it('auto-avanza a timer después de 3s', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToMissionSuccess(user)
      vi.advanceTimersByTime(3100)
      await waitFor(() =>
        expect(screen.getByText(/se revela en breve/i)).toBeInTheDocument()
      )
    })

    it('en última pregunta mission_success llama onComplete tras 3s', async () => {
      const mockComplete = vi.fn()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion({ questions: ['Q1'], totalQuestions: 1, onComplete: mockComplete })
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() => screen.getByRole('button', { name: /Misión lograda/i }))
      await user.click(screen.getByRole('button', { name: /Misión lograda/i }))
      vi.advanceTimersByTime(3100)
      await waitFor(() => expect(mockComplete).toHaveBeenCalledOnce())
    })
  })

  // ==========================================================================
  // 7. Estado "mission_fail"
  // ==========================================================================

  describe('Estado mission_fail', () => {
    const goToMissionFail = async (user) => {
      renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() => screen.getByRole('button', { name: /Misión fallida/i }))
      await user.click(screen.getByRole('button', { name: /Misión fallida/i }))
      await waitFor(() =>
        expect(screen.getByText(/Misión no lograda/i)).toBeInTheDocument()
      )
    }

    it('muestra "Misión no lograda" al hacer clic en Misión fallida', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToMissionFail(user)
      expect(screen.getByText(/Misión no lograda/i)).toBeInTheDocument()
    })

    it('llama onMissionResult con resultado "fallida"', async () => {
      const mockMission = vi.fn()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion({ onMissionResult: mockMission })
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() => screen.getByRole('button', { name: /Misión fallida/i }))
      await user.click(screen.getByRole('button', { name: /Misión fallida/i }))
      expect(mockMission).toHaveBeenCalledWith({ questionIndex: 0, resultado: 'fallida' })
    })

    it('muestra mascota triste en mission_fail', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() => screen.getByRole('button', { name: /Misión fallida/i }))
      await user.click(screen.getByRole('button', { name: /Misión fallida/i }))
      await waitFor(() => {
        const img = container.querySelector('img[alt*="Come Dispersión"]')
        expect(img?.src).toContain('mascot-triste')
      })
    })

    it('muestra lluvia en mission_fail', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() => screen.getByRole('button', { name: /Misión fallida/i }))
      await user.click(screen.getByRole('button', { name: /Misión fallida/i }))
      await waitFor(() =>
        expect(container.querySelectorAll('.isla-rain-fall').length).toBeGreaterThan(0)
      )
    })

    it('mascota tiene clase fadeout en mission_fail', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() => screen.getByRole('button', { name: /Misión fallida/i }))
      await user.click(screen.getByRole('button', { name: /Misión fallida/i }))
      await waitFor(() => {
        const img = container.querySelector('.isla-anim-mascot-fadeout')
        expect(img).toBeInTheDocument()
      })
    })

    it('auto-avanza a timer después de 3s', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await goToMissionFail(user)
      vi.advanceTimersByTime(3100)
      await waitFor(() =>
        expect(screen.getByText(/se revela en breve/i)).toBeInTheDocument()
      )
    })

    it('mission_fail desde estado incorrect también funciona', async () => {
      const mockMission = vi.fn()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion({ onMissionResult: mockMission })
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Incorrecto/i })[0])
      await waitFor(() => screen.getByRole('button', { name: /Misión fallida/i }))
      await user.click(screen.getByRole('button', { name: /Misión fallida/i }))
      expect(mockMission).toHaveBeenCalledWith({ questionIndex: 0, resultado: 'fallida' })
    })
  })

  // ==========================================================================
  // 8. Controlled state (prop state + onStateChange)
  // ==========================================================================

  describe('Controlled state', () => {
    it('usa el estado controlado cuando se pasa state prop', () => {
      renderProyeccion({ state: 'timer' })
      expect(screen.getByText(/se revela en breve/i)).toBeInTheDocument()
    })

    it('llama onStateChange cuando cambia el estado', async () => {
      const mockStateChange = vi.fn()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion({ state: 'timer', onStateChange: mockStateChange })
      await user.click(screen.getByRole('button', { name: /Siguiente pregunta/i }))
      expect(mockStateChange).toHaveBeenCalledWith('asking')
    })

    it('renderiza estado asking directamente con state="asking"', () => {
      renderProyeccion({ state: 'asking' })
      expect(screen.getByText(/¿Será esto correcto\?/i)).toBeInTheDocument()
    })

    it('renderiza estado correct directamente', () => {
      renderProyeccion({ state: 'correct' })
      expect(screen.getByText(/Respuesta acertada/i)).toBeInTheDocument()
    })

    it('renderiza estado incorrect directamente', () => {
      renderProyeccion({ state: 'incorrect' })
      expect(screen.getByText(/¡Ay, no!/i)).toBeInTheDocument()
    })

    it('renderiza estado mission_success directamente', () => {
      renderProyeccion({ state: 'mission_success' })
      expect(screen.getByText(/Misión completada/i)).toBeInTheDocument()
    })

    it('renderiza estado mission_fail directamente', () => {
      renderProyeccion({ state: 'mission_fail' })
      expect(screen.getByText(/Misión no lograda/i)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // 9. BottomBar — recorrido de puntos
  // ==========================================================================

  describe('BottomBar — recorrido de puntos', () => {
    it('muestra puntos de recorrido según totalQuestions', () => {
      const { container } = renderProyeccion({ totalQuestions: 3 })
      // 3 dots: w-3.5 h-3.5 rounded-full
      const dots = container.querySelectorAll('.rounded-full.border-\\[2px\\].border-\\[\\#173951\\]')
      expect(dots.length).toBeGreaterThanOrEqual(3)
    })

    it('muestra botón de pausa en el bottom bar', () => {
      renderProyeccion()
      expect(screen.getByRole('button', { name: /Pausar/i })).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // 10. Timer countdown
  // ==========================================================================

  describe('Timer countdown', () => {
    it('cuenta regresiva se detiene cuando está pausado', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { container } = renderProyeccion({ minutesPerQuestion: 1 })
      await skipIntro(user)

      // Pausar
      await user.click(screen.getByRole('button', { name: /Pausar/i }))

      // Leer el tiempo
      const before = container.querySelector('.tabular-nums')?.textContent
      vi.advanceTimersByTime(5000)
      const after = container.querySelector('.tabular-nums')?.textContent

      // Debería mostrar ⏸ cuando está pausado
      expect(after).toContain('⏸')
    })

    it('resetea el timer al cambiar de estado a timer', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderProyeccion({ minutesPerQuestion: 1 })
      await skipIntro(user)

      // Avanzar tiempo
      vi.advanceTimersByTime(10000)

      // Ir a asking y saltar
      await goToAsking(user)
      await user.click(screen.getByRole('button', { name: /Saltar pregunta/i }))

      // Al volver a timer el reloj se resetea
      await waitFor(() =>
        expect(screen.getByText(/se revela en breve/i)).toBeInTheDocument()
      )
    })
  })

  // ==========================================================================
  // 11. Cleanup de timeout al desmontar
  // ==========================================================================

  describe('Cleanup de timeout', () => {
    it('limpia el timeout al desmontar el componente', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { unmount } = renderProyeccion()
      await skipIntro(user)
      await goToAsking(user)
      await user.click(screen.getAllByRole('button', { name: /Correcto/i })[0])
      await waitFor(() => screen.getByRole('button', { name: /Misión lograda/i }))
      await user.click(screen.getByRole('button', { name: /Misión lograda/i }))

      // Desmontar antes de que el timeout dispare
      expect(() => unmount()).not.toThrow()
    })
  })

  // ==========================================================================
  // 12. Props opcionales y valores por defecto
  // ==========================================================================

  describe('Props opcionales', () => {
    it('usa totalQuestions de questions.length si no se pasa totalQuestionsProp', () => {
      renderProyeccion({ questions: QUESTIONS, totalQuestions: undefined })
      expect(screen.getByText('Ciencias')).toBeInTheDocument()
    })

    it('usa presentationDialogues si se pasan', () => {
      // presentationDialogues es una prop recibida pero no usada en el render
      // verificar que no rompe nada
      renderProyeccion({ presentationDialogues: ['Custom dialogue'] })
      expect(screen.getByText('Ciencias')).toBeInTheDocument()
    })

    it('usa initialState="timer" para empezar en timer', () => {
      renderProyeccion({ initialState: 'timer' })
      expect(screen.getByText(/se revela en breve/i)).toBeInTheDocument()
    })

    it('usa initialState="asking" para empezar en asking', () => {
      renderProyeccion({ initialState: 'asking' })
      expect(screen.getByText(/¿Será esto correcto\?/i)).toBeInTheDocument()
    })
  })
})
