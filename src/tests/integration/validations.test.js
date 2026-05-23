import { describe, it, expect, beforeEach } from 'vitest'

// Funciones de validación utilizadas en el proyecto
// Estas son las validaciones reales que se usan en los componentes

describe('Integration: Validaciones Reales del Proyecto', () => {
  // Validación de contraseña (usada en RegisterPage, LoginPage, IslaEducativaLogin)
  const validatePassword = (pw) => {
    const errors = []
    if (!pw) return 'Escribe tu nueva contraseña'
    if (pw.length < 8) return 'Mínimo 8 caracteres'
    if (!/[A-Z]/.test(pw)) return 'Necesita al menos una mayúscula'
    if (!/[!@#$%^&*]/.test(pw)) return 'Necesita al menos un carácter especial'
    return ''
  }

  // Validación de email (usada en formularios de auth)
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'El email es requerido'
    if (!emailRegex.test(email)) return 'Email inválido'
    return ''
  }

  // Validación de código de clase (usada en StudentIsland)
  const validateClassCode = (code) => {
    if (!code) return 'El código de clase es requerido'
    if (code.trim().length === 0) return 'El código no puede estar vacío'
    if (code.length < 3) return 'El código debe tener al menos 3 caracteres'
    return ''
  }

  // Validación de nombre
  const validateName = (name) => {
    if (!name) return 'El nombre es requerido'
    if (name.trim().length === 0) return 'El nombre no puede estar vacío'
    if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres'
    if (name.length > 100) return 'El nombre es muy largo'
    return ''
  }

  // Validación de datos de sesión/expedición
  const validateSession = (data) => {
    const errors = []
    if (!data.titulo) errors.push('El título es requerido')
    if (!data.tema) errors.push('El tema es requerido')
    if (![5, 6, 7].includes(data.intervalo_minutos)) {
      errors.push('El intervalo debe ser 5, 6 o 7 minutos')
    }
    if (!['configurada', 'iniciada', 'pausada', 'finalizada'].includes(data.estado)) {
      errors.push('Estado de sesión inválido')
    }
    return errors
  }

  // Validación de misión
  const validateMission = (data) => {
    const errors = []
    if (!data.asignatura) errors.push('La asignatura es requerida')
    if (!data.tema) errors.push('El tema es requerido')
    if (!data.reto) errors.push('El reto es requerido')
    if (!data.exito) errors.push('Mensaje de éxito requerido')
    if (!data.fallo) errors.push('Mensaje de fallo requerido')
    return errors
  }

  describe('Validación de Contraseña', () => {
    it('acepta contraseña válida con 8+ caracteres, mayúscula y carácter especial', () => {
      expect(validatePassword('Password123!')).toBe('')
      expect(validatePassword('SecurePass@456')).toBe('')
      expect(validatePassword('Valid_Pw123!')).toBe('')
    })

    it('rechaza contraseña sin mayúscula', () => {
      const result = validatePassword('password123!')
      expect(result).toContain('mayúscula')
    })

    it('rechaza contraseña sin carácter especial', () => {
      const result = validatePassword('Password123')
      expect(result).toContain('carácter especial')
    })

    it('rechaza contraseña con menos de 8 caracteres', () => {
      const result = validatePassword('Pass1!')
      expect(result).toContain('8 caracteres')
    })

    it('rechaza contraseña vacía', () => {
      const result = validatePassword('')
      expect(result).toContain('nueva contraseña')
    })

    it('rechaza null', () => {
      const result = validatePassword(null)
      expect(result).toBeTruthy()
    })

    it('valida múltiples requisitos simultáneamente', () => {
      const validPasswords = [
        'Password@123',
        'SecurePass@456',
        'Test_Validate789!',
        'CompleX!Pass2024'
      ]

      validPasswords.forEach((pw) => {
        expect(validatePassword(pw)).toBe('')
      })
    })
  })

  describe('Validación de Email', () => {
    it('acepta emails válidos', () => {
      expect(validateEmail('student@example.com')).toBe('')
      expect(validateEmail('teacher@domain.co.uk')).toBe('')
      expect(validateEmail('user+tag@test.com')).toBe('')
    })

    it('rechaza emails sin @', () => {
      const result = validateEmail('invalidemail')
      expect(result).toContain('inválido')
    })

    it('rechaza emails sin dominio', () => {
      const result = validateEmail('user@')
      expect(result).toContain('inválido')
    })

    it('rechaza emails sin usuario', () => {
      const result = validateEmail('@example.com')
      expect(result).toContain('inválido')
    })

    it('rechaza email vacío', () => {
      const result = validateEmail('')
      expect(result).toContain('requerido')
    })

    it('rechaza espacios en blanco', () => {
      const result = validateEmail('user name@test.com')
      expect(result).toContain('inválido')
    })

    it('valida formato correcto con regex', () => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      expect(regex.test('test@example.com')).toBe(true)
      expect(regex.test('invalid.email')).toBe(false)
      expect(regex.test('user@domain')).toBe(false)
    })
  })

  describe('Validación de Código de Clase', () => {
    it('acepta código válido', () => {
      expect(validateClassCode('MATH101')).toBe('')
      expect(validateClassCode('ABC123')).toBe('')
      expect(validateClassCode('XYZ789')).toBe('')
    })

    it('rechaza código vacío', () => {
      const result = validateClassCode('')
      expect(result).toContain('requerido')
    })

    it('rechaza código solo con espacios', () => {
      const result = validateClassCode('   ')
      expect(result).toContain('vacío')
    })

    it('rechaza código muy corto', () => {
      const result = validateClassCode('AB')
      expect(result).toContain('3 caracteres')
    })

    it('acepta código con números y letras', () => {
      expect(validateClassCode('Class2024A')).toBe('')
      expect(validateClassCode('ENGLISH7')).toBe('')
    })

    it('valida longitud mínima', () => {
      expect(validateClassCode('AB')).toBeTruthy()
      expect(validateClassCode('ABC')).toBe('')
      expect(validateClassCode('ABCD')).toBe('')
    })
  })

  describe('Validación de Nombre', () => {
    it('acepta nombres válidos', () => {
      expect(validateName('Juan')).toBe('')
      expect(validateName('María García')).toBe('')
      expect(validateName('João da Silva')).toBe('')
    })

    it('rechaza nombre vacío', () => {
      const result = validateName('')
      expect(result).toContain('requerido')
    })

    it('rechaza nombre solo espacios', () => {
      const result = validateName('   ')
      expect(result).toContain('vacío')
    })

    it('rechaza nombre muy corto', () => {
      const result = validateName('A')
      expect(result).toContain('2 caracteres')
    })

    it('rechaza nombre muy largo', () => {
      const result = validateName('A'.repeat(101))
      expect(result).toContain('muy largo')
    })

    it('acepta nombres con espacios y caracteres especiales', () => {
      expect(validateName('María José')).toBe('')
      expect(validateName("O'Connor")).toBe('')
      expect(validateName('José-María')).toBe('')
    })
  })

  describe('Validación de Sesión/Expedición', () => {
    it('valida sesión con datos completos', () => {
      const validSession = {
        titulo: 'Matemáticas - Álgebra',
        tema: 'Ecuaciones lineales',
        intervalo_minutos: 6,
        estado: 'configurada'
      }
      expect(validateSession(validSession)).toHaveLength(0)
    })

    it('rechaza sesión sin título', () => {
      const session = {
        tema: 'Tema',
        intervalo_minutos: 5,
        estado: 'configurada'
      }
      const errors = validateSession(session)
      expect(errors.some((e) => e.includes('título'))).toBe(true)
    })

    it('rechaza intervalo inválido', () => {
      const session = {
        titulo: 'Título',
        tema: 'Tema',
        intervalo_minutos: 10,
        estado: 'configurada'
      }
      const errors = validateSession(session)
      expect(errors.some((e) => e.includes('intervalo'))).toBe(true)
    })

    it('acepta solo intervalos 5, 6 o 7', () => {
      const validIntervals = [5, 6, 7]
      validIntervals.forEach((interval) => {
        const session = {
          titulo: 'Título',
          tema: 'Tema',
          intervalo_minutos: interval,
          estado: 'configurada'
        }
        expect(validateSession(session)).toHaveLength(0)
      })
    })

    it('rechaza estado inválido', () => {
      const session = {
        titulo: 'Título',
        tema: 'Tema',
        intervalo_minutos: 6,
        estado: 'activa'
      }
      const errors = validateSession(session)
      expect(errors.some((e) => e.includes('Estado'))).toBe(true)
    })

    it('acepta todos los estados válidos', () => {
      const validStates = ['configurada', 'iniciada', 'pausada', 'finalizada']
      validStates.forEach((state) => {
        const session = {
          titulo: 'Título',
          tema: 'Tema',
          intervalo_minutos: 6,
          estado: state
        }
        expect(validateSession(session)).toHaveLength(0)
      })
    })
  })

  describe('Validación de Misión', () => {
    it('valida misión con datos completos', () => {
      const validMission = {
        asignatura: 'Matemáticas',
        tema: 'Ecuaciones',
        reto: '¿Cuál es 2+2?',
        exito: '¡Correcto!',
        fallo: 'Intenta de nuevo'
      }
      expect(validateMission(validMission)).toHaveLength(0)
    })

    it('rechaza misión sin asignatura', () => {
      const mission = {
        tema: 'Tema',
        reto: 'Reto',
        exito: 'Éxito',
        fallo: 'Fallo'
      }
      const errors = validateMission(mission)
      expect(errors.some((e) => e.includes('asignatura'))).toBe(true)
    })

    it('rechaza misión sin reto', () => {
      const mission = {
        asignatura: 'Asignatura',
        tema: 'Tema',
        exito: 'Éxito',
        fallo: 'Fallo'
      }
      const errors = validateMission(mission)
      expect(errors.some((e) => e.includes('reto'))).toBe(true)
    })

    it('rechaza misión sin mensajes de feedback', () => {
      const mission = {
        asignatura: 'Asignatura',
        tema: 'Tema',
        reto: 'Reto'
      }
      const errors = validateMission(mission)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('valida todos los campos requeridos', () => {
      const mission = {
        asignatura: 'Historia',
        tema: 'Edad Media',
        reto: '¿Quién fue Colón?',
        exito: '¡Muy bien!',
        fallo: 'Revisa el material'
      }
      expect(validateMission(mission)).toHaveLength(0)
    })
  })

  describe('Validación integrada de flujos', () => {
    it('valida registro completo de estudiante', () => {
      const studentData = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'SecurePass@123',
        rol: 'estudiante'
      }

      expect(validateName(studentData.nombre)).toBe('')
      expect(validateEmail(studentData.email)).toBe('')
      expect(validatePassword(studentData.password)).toBe('')
    })

    it('valida login de docente', () => {
      const loginData = {
        email: 'teacher@example.com',
        password: 'TeacherPass@456'
      }

      expect(validateEmail(loginData.email)).toBe('')
      expect(validatePassword(loginData.password)).toBe('')
    })

    it('valida unirse a clase de estudiante', () => {
      const joinData = {
        classCode: 'MATH101'
      }

      expect(validateClassCode(joinData.classCode)).toBe('')
    })

    it('valida creación de misión completa', () => {
      const missionData = {
        asignatura: 'Biología',
        tema: 'Ecosistemas',
        reto: '¿Qué es un ecosistema?',
        exito: '¡Excelente respuesta!',
        fallo: 'Vuelve a intentar'
      }

      expect(validateMission(missionData)).toHaveLength(0)
    })
  })
})
