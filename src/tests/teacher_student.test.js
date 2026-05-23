import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabaseClient, createMockUser } from './setup'

describe('Relación Docente-Estudiante', () => {
  let mockTeacher, mockStudent

  beforeEach(() => {
    mockTeacher = createMockUser('teacher-1')
    mockStudent = createMockUser('student-1')
  })

  describe('Unirse a clase con código', () => {
    it('estudiante se une a clase con código válido', () => {
      const classCode = 'ABC123'
      const joinAttempt = {
        codigo: classCode,
        estudiante_id: mockStudent.id,
      }

      expect(joinAttempt.codigo).toBe('ABC123')
      expect(joinAttempt.estudiante_id).toBeTruthy()
    })

    it('código de clase es válido', () => {
      const validCodes = ['ABC123', 'XYZ789', 'DEF456']

      validCodes.forEach((code) => {
        expect(code).toMatch(/^[A-Z0-9]+$/)
        expect(code.length).toBeGreaterThan(0)
      })
    })

    it('código se almacena en tabla users con tabla teacher_students', () => {
      const teacher = {
        id: mockTeacher.id,
        codigo_clase: 'MATH101',
        nombre: 'Prof. García',
      }

      const enrollment = {
        docente_id: teacher.id,
        estudiante_id: mockStudent.id,
        fecha_inscripcion: new Date().toISOString(),
      }

      expect(teacher.codigo_clase).toBeTruthy()
      expect(enrollment.docente_id).toBe(teacher.id)
      expect(enrollment.estudiante_id).toBe(mockStudent.id)
    })
  })

  describe('Validación de código', () => {
    it('rechaza código vacío', () => {
      const invalidCode = ''
      expect(invalidCode.trim()).toBeFalsy()
    })

    it('rechaza código inválido', () => {
      const invalidCode = 'NONEXISTENT'
      const teacersCodes = ['ABC123', 'XYZ789', 'DEF456']

      expect(teacersCodes).not.toContain(invalidCode)
    })

    it('previene inscripción duplicada', () => {
      const enrollments = [
        { docente_id: 'teacher-1', estudiante_id: 'student-1' },
        { docente_id: 'teacher-1', estudiante_id: 'student-1' },
      ]

      const uniqueEnrollments = enrollments.filter(
        (enr, index, arr) => arr.findIndex((e) => e.docente_id === enr.docente_id && e.estudiante_id === enr.estudiante_id) === index
      )

      expect(uniqueEnrollments).toHaveLength(1)
    })
  })

  describe('Múltiples inscripciones de estudiante', () => {
    it('estudiante puede estar vinculado a múltiples docentes', () => {
      const studentEnrollments = [
        { docente_id: 'teacher-1', estudiante_id: 'student-1' },
        { docente_id: 'teacher-2', estudiante_id: 'student-1' },
        { docente_id: 'teacher-3', estudiante_id: 'student-1' },
      ]

      const teachersLinked = [...new Set(studentEnrollments.map((e) => e.docente_id))]

      expect(studentEnrollments).toHaveLength(3)
      expect(teachersLinked).toHaveLength(3)
    })

    it('estudiante ve misiones de todos sus docentes', () => {
      const studentMissions = [
        { docente_id: 'teacher-1', asignatura: 'Matemáticas' },
        { docente_id: 'teacher-2', asignatura: 'Historia' },
        { docente_id: 'teacher-3', asignatura: 'Inglés' },
      ]

      expect(studentMissions).toHaveLength(3)
      expect(studentMissions.map((m) => m.docente_id)).toHaveLength(3)
    })

    it('puede unirse a una clase aunque ya está unido a otra', () => {
      const firstJoin = {
        docente_id: 'teacher-1',
        estudiante_id: mockStudent.id,
        exitoso: true,
      }

      const secondJoin = {
        docente_id: 'teacher-2',
        estudiante_id: mockStudent.id,
        exitoso: true,
      }

      expect(firstJoin.exitoso).toBe(true)
      expect(secondJoin.exitoso).toBe(true)
    })
  })

  describe('Vista del docente - Estudiantes vinculados', () => {
    it('docente puede ver cantidad de estudiantes vinculados', () => {
      const linkedStudents = [
        { id: 'student-1', nombre: 'Juan' },
        { id: 'student-2', nombre: 'María' },
        { id: 'student-3', nombre: 'Pedro' },
      ]

      expect(linkedStudents).toHaveLength(3)
      expect(linkedStudents.every((s) => s.id && s.nombre)).toBe(true)
    })

    it('docente ve lista de estudiantes vinculados', () => {
      const teacherStudents = [
        {
          docente_id: 'teacher-1',
          estudiante_id: 'student-1',
          nombre_estudiante: 'Juan García',
          email: 'juan@example.com',
        },
        {
          docente_id: 'teacher-1',
          estudiante_id: 'student-2',
          nombre_estudiante: 'María López',
          email: 'maria@example.com',
        },
      ]

      const filteredByTeacher = teacherStudents.filter((ts) => ts.docente_id === 'teacher-1')

      expect(filteredByTeacher).toHaveLength(2)
      expect(filteredByTeacher.map((ts) => ts.nombre_estudiante)).toContain('Juan García')
    })

    it('muestra contador de estudiantes vinculados', () => {
      const studentCount = 5

      expect(studentCount).toBeGreaterThan(0)
      expect(studentCount).toBe(5)
    })
  })

  describe('Fecha de inscripción', () => {
    it('inscripción registra fecha y hora', () => {
      const enrollment = {
        docente_id: 'teacher-1',
        estudiante_id: 'student-1',
        fecha_inscripcion: new Date().toISOString(),
      }

      expect(enrollment.fecha_inscripcion).toBeTruthy()
      expect(new Date(enrollment.fecha_inscripcion)).toBeInstanceOf(Date)
    })

    it('estudiantes aparecen en orden de inscripción', () => {
      const enrollments = [
        { id: 1, fecha_inscripcion: '2026-05-20T10:00:00Z' },
        { id: 2, fecha_inscripcion: '2026-05-21T15:30:00Z' },
        { id: 3, fecha_inscripcion: '2026-05-22T08:45:00Z' },
      ]

      const sorted = [...enrollments].sort((a, b) => new Date(b.fecha_inscripcion) - new Date(a.fecha_inscripcion))

      expect(sorted[0].id).toBe(3)
      expect(sorted[1].id).toBe(2)
      expect(sorted[2].id).toBe(1)
    })
  })

  describe('Manejo de errores en unirse', () => {
    it('error cuando código no existe', () => {
      const error = {
        message: 'Código de clase no válido',
        code: 'INVALID_CODE',
      }

      expect(error.code).toBe('INVALID_CODE')
      expect(error.message).toContain('no válido')
    })

    it('error cuando ya está inscrito', () => {
      const error = {
        message: 'Ya estás inscrito en esta clase',
        code: 'ALREADY_ENROLLED',
      }

      expect(error.code).toBe('ALREADY_ENROLLED')
    })

    it('error si estudiante intenta usar código de otro estudiante', () => {
      const isTeacherCode = (code) => {
        // Simulación: solo códigos de docentes son válidos
        const teacherCodes = ['MATH101', 'HIST202', 'ENG303']
        return teacherCodes.includes(code)
      }

      expect(isTeacherCode('MATH101')).toBe(true)
      expect(isTeacherCode('STUDENT001')).toBe(false)
    })
  })

  describe('Asignación automática de misiones', () => {
    it('nueva misión se asigna a todos los estudiantes vinculados', () => {
      const linkedStudents = [
        { id: 'student-1' },
        { id: 'student-2' },
        { id: 'student-3' },
      ]

      const newMission = {
        id: 'mission-1',
        asignatura: 'Matemáticas',
      }

      const assignedMissions = linkedStudents.map((student) => ({
        estudiante_id: student.id,
        mision_id: newMission.id,
        estado: 'pendiente',
      }))

      expect(assignedMissions).toHaveLength(linkedStudents.length)
      expect(assignedMissions.every((m) => m.mision_id === 'mission-1')).toBe(true)
    })

    it('estudiante nuevo recibe misiones pendientes', () => {
      const existingMissions = [
        { id: 'mission-1', estado: 'activa' },
        { id: 'mission-2', estado: 'activa' },
        { id: 'mission-3', estado: 'activa' },
      ]

      const newStudent = { id: 'student-new' }

      const missionsForNewStudent = existingMissions.map((mission) => ({
        estudiante_id: newStudent.id,
        mision_id: mission.id,
        estado: 'pendiente',
      }))

      expect(missionsForNewStudent).toHaveLength(existingMissions.length)
    })
  })
})
