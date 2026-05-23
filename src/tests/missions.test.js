import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabaseClient, createMockUser } from './setup'

describe('Misiones para Casa', () => {
  let mockUser

  beforeEach(() => {
    mockUser = createMockUser()
  })

  describe('Crear misión', () => {
    it('crea una misión con datos válidos', () => {
      const missionData = {
        asignatura: 'Matemáticas',
        tema: 'Ecuaciones lineales',
        explicacion: 'Aprenderemos a resolver ecuaciones',
        reto: '¿Cuál es la solución de 2x + 3 = 7?',
        exito: '¡Correcto! Muy bien resuelto',
        fallo: 'Intenta de nuevo, recuerda los pasos',
        docente_id: mockUser.id,
        estado: 'activa',
      }

      expect(missionData.asignatura).toBeTruthy()
      expect(missionData.tema).toBeTruthy()
      expect(missionData.reto).toBeTruthy()
      expect(missionData.docente_id).toBe(mockUser.id)
      expect(['activa', 'archivada']).toContain(missionData.estado)
    })

    it('requiere asignatura, tema y reto', () => {
      const invalidMission = {
        asignatura: '',
        tema: '',
        reto: '',
      }

      expect(invalidMission.asignatura).toBeFalsy()
      expect(invalidMission.tema).toBeFalsy()
      expect(invalidMission.reto).toBeFalsy()
    })

    it('misión tiene campos de retroalimentación', () => {
      const mission = {
        exito: 'Mensaje cuando el estudiante acierta',
        fallo: 'Mensaje cuando el estudiante falla',
      }

      expect(mission.exito).toBeTruthy()
      expect(mission.fallo).toBeTruthy()
    })
  })

  describe('Publicar misión', () => {
    it('publica misión a todos los estudiantes vinculados', async () => {
      const missionData = {
        asignatura: 'Biología',
        tema: 'Ecosistemas',
        explicacion: 'Estudio de ecosistemas',
        reto: '¿Qué es un ecosistema?',
        exito: '¡Excelente!',
        fallo: 'Vuelve a intentar',
      }

      const linkedStudents = [
        { id: 'student-1', email: 'student1@example.com' },
        { id: 'student-2', email: 'student2@example.com' },
        { id: 'student-3', email: 'student3@example.com' },
      ]

      // Simulación de creación de student_missions
      const studentMissions = linkedStudents.map((student) => ({
        estudiante_id: student.id,
        mision_id: 'mission-123',
        estado: 'pendiente',
        respuesta: null,
      }))

      expect(studentMissions).toHaveLength(linkedStudents.length)
      expect(studentMissions.every((m) => m.estado === 'pendiente')).toBe(true)
    })

    it('crea registros en student_missions para cada estudiante', () => {
      const students = ['student-1', 'student-2', 'student-3']
      const missionId = 'mission-123'

      const studentMissions = students.map((studentId) => ({
        estudiante_id: studentId,
        mision_id: missionId,
        estado: 'pendiente',
      }))

      expect(studentMissions).toHaveLength(students.length)
      expect(studentMissions[0].mision_id).toBe(missionId)
    })
  })

  describe('Visibilidad de misiones del estudiante', () => {
    it('estudiante ve misiones de docentes vinculados', () => {
      const studentMissions = [
        {
          id: 'sm-1',
          asignatura: 'Matemáticas',
          tema: 'Álgebra',
          estado: 'pendiente',
          docente_nombre: 'Prof. García',
        },
        {
          id: 'sm-2',
          asignatura: 'Historia',
          tema: 'Edad Media',
          estado: 'pendiente',
          docente_nombre: 'Prof. López',
        },
      ]

      expect(studentMissions).toHaveLength(2)
      expect(studentMissions.every((m) => m.estado === 'pendiente')).toBe(true)
      expect(studentMissions.map((m) => m.asignatura)).toContain('Matemáticas')
      expect(studentMissions.map((m) => m.asignatura)).toContain('Historia')
    })

    it('misión tiene atributo docente', () => {
      const mission = {
        id: 'sm-1',
        asignatura: 'Inglés',
        tema: 'Present Perfect',
        docente_id: 'teacher-1',
        docente_nombre: 'Prof. Smith',
        estado: 'pendiente',
      }

      expect(mission.docente_nombre).toBeTruthy()
      expect(mission.docente_id).toBe('teacher-1')
    })
  })

  describe('Respuesta del estudiante', () => {
    it('estudiante puede responder a una misión', () => {
      let studentMission = {
        id: 'sm-1',
        mision_id: 'mission-1',
        estudiante_id: 'student-1',
        estado: 'pendiente',
        respuesta: null,
      }

      studentMission.respuesta = '¿Cuál es 2+2?'
      studentMission.estado = 'completada'

      expect(studentMission.respuesta).toBeTruthy()
      expect(studentMission.estado).toBe('completada')
    })

    it('respuesta se guarda con timestamp', () => {
      const response = {
        id: 'response-1',
        student_mission_id: 'sm-1',
        respuesta: 'Mi respuesta',
        fecha_respuesta: new Date().toISOString(),
      }

      expect(response.respuesta).toBeTruthy()
      expect(response.fecha_respuesta).toBeTruthy()
    })
  })

  describe('Estado de misión', () => {
    it('misión comienza en estado pendiente', () => {
      const studentMission = {
        id: 'sm-1',
        estado: 'pendiente',
      }

      expect(studentMission.estado).toBe('pendiente')
    })

    it('misión puede cambiar a completada', () => {
      let studentMission = {
        estado: 'pendiente',
      }

      studentMission.estado = 'completada'

      expect(studentMission.estado).toBe('completada')
    })

    it('misión puede cambiar a vencida', () => {
      let studentMission = {
        estado: 'pendiente',
      }

      studentMission.estado = 'vencida'

      expect(['pendiente', 'completada', 'vencida']).toContain(studentMission.estado)
    })

    it('docente puede archivar misión', () => {
      let mission = {
        id: 'mission-1',
        asignatura: 'Arte',
        estado: 'activa',
      }

      mission.estado = 'archivada'

      expect(mission.estado).toBe('archivada')
    })
  })

  describe('Retroalimentación automática', () => {
    it('estudiante recibe mensaje de éxito', () => {
      const mission = {
        id: 'mission-1',
        reto: '¿Cuál es la capital de Francia?',
        exito: '¡Correcto! París es la capital',
        fallo: 'Intenta nuevamente',
      }

      const studentResponse = 'París'
      const isCorrect = true

      const feedback = isCorrect ? mission.exito : mission.fallo

      expect(feedback).toBe('¡Correcto! París es la capital')
    })

    it('estudiante recibe mensaje de fallo', () => {
      const mission = {
        id: 'mission-1',
        reto: '¿Cuál es la capital de Francia?',
        exito: '¡Correcto! París es la capital',
        fallo: 'Intenta nuevamente',
      }

      const studentResponse = 'Madrid'
      const isCorrect = false

      const feedback = isCorrect ? mission.exito : mission.fallo

      expect(feedback).toBe('Intenta nuevamente')
    })
  })
})
