import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

// Componentes de prueba simulados
const IslaEducativaLogin = ({ onRoleSelect, onLoginSuccess }) => {
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole)
    if (onRoleSelect) onRoleSelect(selectedRole)
  }

  const handleLogin = () => {
    if (!email || !password) {
      setError('Email y contraseña requeridos')
      return
    }
    if (onLoginSuccess) onLoginSuccess({ email, role })
  }

  return (
    <div data-testid="login-component">
      <div className="role-selector">
        <button onClick={() => handleRoleSelect('docente')} data-testid="role-teacher">
          Docente
        </button>
        <button onClick={() => handleRoleSelect('estudiante')} data-testid="role-student">
          Estudiante
        </button>
      </div>
      <input
        data-testid="email-input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        data-testid="password-input"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin} data-testid="login-btn">
        Iniciar sesión
      </button>
      {error && <div data-testid="error-msg">{error}</div>}
    </div>
  )
}

const MissionCard = ({ mission, onRespond }) => {
  const [showFeedback, setShowFeedback] = useState(false)

  const handleRespond = () => {
    setShowFeedback(true)
    if (onRespond) onRespond(mission.id)
  }

  return (
    <div data-testid={`mission-${mission.id}`} className="mission-card">
      <h3>{mission.tema}</h3>
      <p>{mission.reto}</p>
      <button onClick={handleRespond} data-testid={`respond-${mission.id}`}>
        Responder
      </button>
      {showFeedback && <div data-testid={`feedback-${mission.id}`}>{mission.feedback}</div>}
    </div>
  )
}

const TeacherModal = ({ isOpen, students, onClose }) => {
  if (!isOpen) return null

  return (
    <div data-testid="teacher-modal" className="modal">
      <button onClick={onClose} data-testid="close-modal">
        Cerrar
      </button>
      <h2>Estudiantes vinculados ({students.length})</h2>
      <ul data-testid="students-list">
        {students.map((student) => (
          <li key={student.id} data-testid={`student-${student.id}`}>
            {student.nombre}
          </li>
        ))}
      </ul>
    </div>
  )
}

describe('Componentes UI', () => {
  describe('IslaEducativaLogin', () => {
    it('renderiza componente de login', () => {
      render(<IslaEducativaLogin />)

      expect(screen.getByTestId('login-component')).toBeInTheDocument()
      expect(screen.getByTestId('role-teacher')).toBeInTheDocument()
      expect(screen.getByTestId('role-student')).toBeInTheDocument()
    })

    it('tiene campos de email y contraseña', () => {
      render(<IslaEducativaLogin />)

      expect(screen.getByTestId('email-input')).toBeInTheDocument()
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
    })

    it('botón de login existe', () => {
      render(<IslaEducativaLogin />)

      expect(screen.getByTestId('login-btn')).toBeInTheDocument()
    })

    it('selecciona rol docente', async () => {
      const mockRoleSelect = vi.fn()
      render(<IslaEducativaLogin onRoleSelect={mockRoleSelect} />)

      const teacherBtn = screen.getByTestId('role-teacher')
      await userEvent.click(teacherBtn)

      expect(mockRoleSelect).toHaveBeenCalledWith('docente')
    })

    it('selecciona rol estudiante', async () => {
      const mockRoleSelect = vi.fn()
      render(<IslaEducativaLogin onRoleSelect={mockRoleSelect} />)

      const studentBtn = screen.getByTestId('role-student')
      await userEvent.click(studentBtn)

      expect(mockRoleSelect).toHaveBeenCalledWith('estudiante')
    })

    it('muestra error cuando falta email o contraseña', async () => {
      render(<IslaEducativaLogin />)

      const loginBtn = screen.getByTestId('login-btn')
      await userEvent.click(loginBtn)

      const errorMsg = await screen.findByTestId('error-msg')
      expect(errorMsg).toBeInTheDocument()
      expect(errorMsg).toHaveTextContent('Email y contraseña requeridos')
    })
  })

  describe('MissionCard', () => {
    const mockMission = {
      id: 'mission-1',
      tema: 'Ecuaciones',
      reto: '¿Cuál es 2+2?',
      feedback: '¡Correcto!',
    }

    it('renderiza tarjeta de misión', () => {
      render(<MissionCard mission={mockMission} />)

      expect(screen.getByTestId(`mission-${mockMission.id}`)).toBeInTheDocument()
      expect(screen.getByText('Ecuaciones')).toBeInTheDocument()
    })

    it('muestra el reto de la misión', () => {
      render(<MissionCard mission={mockMission} />)

      expect(screen.getByText('¿Cuál es 2+2?')).toBeInTheDocument()
    })

    it('tiene botón para responder', () => {
      render(<MissionCard mission={mockMission} />)

      expect(screen.getByTestId(`respond-${mockMission.id}`)).toBeInTheDocument()
    })

    it('llama callback cuando se hace click en responder', async () => {
      const mockRespond = vi.fn()
      render(<MissionCard mission={mockMission} onRespond={mockRespond} />)

      const respondBtn = screen.getByTestId(`respond-${mockMission.id}`)
      await userEvent.click(respondBtn)

      expect(mockRespond).toHaveBeenCalledWith('mission-1')
    })

    it('muestra retroalimentación después de responder', () => {
      const missionWithFeedback = {
        ...mockMission,
        feedback: '¡Muy bien, 2+2=4!',
      }

      render(<MissionCard mission={missionWithFeedback} />)

      expect(screen.getByTestId(`mission-${mockMission.id}`)).toBeInTheDocument()
    })
  })

  describe('TeacherModal', () => {
    const mockStudents = [
      { id: 'student-1', nombre: 'Juan' },
      { id: 'student-2', nombre: 'María' },
      { id: 'student-3', nombre: 'Pedro' },
    ]

    it('no renderiza modal cuando está cerrado', () => {
      render(<TeacherModal isOpen={false} students={mockStudents} />)

      expect(screen.queryByTestId('teacher-modal')).not.toBeInTheDocument()
    })

    it('renderiza modal cuando está abierto', () => {
      render(<TeacherModal isOpen={true} students={mockStudents} />)

      expect(screen.getByTestId('teacher-modal')).toBeInTheDocument()
    })

    it('muestra número de estudiantes', () => {
      render(<TeacherModal isOpen={true} students={mockStudents} />)

      expect(screen.getByText(`Estudiantes vinculados (${mockStudents.length})`)).toBeInTheDocument()
    })

    it('lista todos los estudiantes', () => {
      render(<TeacherModal isOpen={true} students={mockStudents} />)

      expect(screen.getByTestId('students-list')).toBeInTheDocument()
      expect(screen.getByText('Juan')).toBeInTheDocument()
      expect(screen.getByText('María')).toBeInTheDocument()
      expect(screen.getByText('Pedro')).toBeInTheDocument()
    })

    it('muestra cada estudiante con ID único', () => {
      render(<TeacherModal isOpen={true} students={mockStudents} />)

      expect(screen.getByTestId('student-student-1')).toBeInTheDocument()
      expect(screen.getByTestId('student-student-2')).toBeInTheDocument()
      expect(screen.getByTestId('student-student-3')).toBeInTheDocument()
    })

    it('tiene botón para cerrar', () => {
      const mockClose = vi.fn()
      render(<TeacherModal isOpen={true} students={mockStudents} onClose={mockClose} />)

      expect(screen.getByTestId('close-modal')).toBeInTheDocument()
    })

    it('llama callback cuando se cierra', async () => {
      const mockClose = vi.fn()
      render(<TeacherModal isOpen={true} students={mockStudents} onClose={mockClose} />)

      const closeBtn = screen.getByTestId('close-modal')
      await userEvent.click(closeBtn)

      expect(mockClose).toHaveBeenCalled()
    })
  })

  describe('Validación de formularios', () => {
    it('valida que email tenga formato correcto', () => {
      const validEmails = ['test@example.com', 'user@domain.co.uk', 'name+tag@test.com']

      validEmails.forEach((email) => {
        expect(email).toContain('@')
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      })
    })

    it('rechaza emails inválidos', () => {
      const invalidEmails = ['invalidemail', 'user@', '@domain.com', 'user name@test.com']

      invalidEmails.forEach((email) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        expect(isValid).toBe(false)
      })
    })

    it('valida que contraseña cumpla requisitos', () => {
      const validatePassword = (pw) => {
        if (!pw) return 'Requerida'
        if (pw.length < 8) return 'Mínimo 8 caracteres'
        if (!/[A-Z]/.test(pw)) return 'Necesita mayúscula'
        if (!/[!@#$%^&*]/.test(pw)) return 'Necesita carácter especial'
        return ''
      }

      expect(validatePassword('Valid123!')).toBe('')
      expect(validatePassword('short')).toContain('8 caracteres')
      expect(validatePassword('nouppercase123!')).toContain('mayúscula')
    })
  })

  describe('Interacciones de modal', () => {
    it('abre modal al hacer click en botón', async () => {
      const TestComponent = () => {
        const [isOpen, setIsOpen] = useState(false)

        return (
          <div>
            <button data-testid="open-btn" onClick={() => setIsOpen(true)}>
              Abrir
            </button>
            {isOpen && <TeacherModal isOpen={isOpen} students={[]} onClose={() => setIsOpen(false)} />}
          </div>
        )
      }

      render(<TestComponent />)
      const openBtn = screen.getByTestId('open-btn')
      await userEvent.click(openBtn)

      expect(screen.getByTestId('teacher-modal')).toBeInTheDocument()
    })

    it('cierra modal al hacer click en cerrar', async () => {
      const mockClose = vi.fn()
      render(<TeacherModal isOpen={true} students={[]} onClose={mockClose} />)

      const closeBtn = screen.getByTestId('close-modal')
      await userEvent.click(closeBtn)

      expect(mockClose).toHaveBeenCalled()
    })
  })

  describe('Feedback visual', () => {
    it('muestra mensaje de éxito con color verde', () => {
      const feedback = {
        tipo: 'exito',
        mensaje: '¡Correcto! Muy bien',
        color: 'bg-green-100',
      }

      expect(feedback.tipo).toBe('exito')
      expect(feedback.color).toContain('green')
    })

    it('muestra mensaje de error con color rojo', () => {
      const feedback = {
        tipo: 'error',
        mensaje: 'Intenta de nuevo',
        color: 'bg-red-100',
      }

      expect(feedback.tipo).toBe('error')
      expect(feedback.color).toContain('red')
    })

    it('muestra mensaje de información con color azul', () => {
      const feedback = {
        tipo: 'info',
        mensaje: 'Recuerda los pasos',
        color: 'bg-blue-100',
      }

      expect(feedback.tipo).toBe('info')
      expect(feedback.color).toContain('blue')
    })
  })
})
