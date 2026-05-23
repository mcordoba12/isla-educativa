# Ejemplo: Integration Tests para Mejorar Coverage

## Estructura recomendada

Para que Vitest mida el coverage real, necesitas importar y testear tus componentes actuales:

```
src/tests/
├── unit/               # Tests unitarios (lógica pura)
│   ├── auth.test.js
│   ├── missions.test.js
│   └── ...
├── integration/        # Tests que usan componentes reales
│   ├── StudentIsland.test.jsx
│   ├── TeacherDashboard.test.jsx
│   ├── Auth.test.jsx
│   └── ...
├── setup.js
└── mocks/
    └── supabase.js
```

## Ejemplo 1: StudentIsland Integration Test

```javascript
// src/tests/integration/StudentIsland.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import StudentIsland from '../../pages/StudentIsland'

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'student-1', email: 'test@example.com' } }
      })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          { id: '1', nombre: 'Prof García', codigo_clase: 'MATH101' }
        ]
      })
    }),
    rpc: vi.fn().mockResolvedValue({ data: { success: true }, error: null })
  }
}))

describe('StudentIsland Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza isla del estudiante', () => {
    render(
      <BrowserRouter>
        <StudentIsland />
      </BrowserRouter>
    )

    expect(screen.getByText(/isla del estudiante/i)).toBeInTheDocument()
  })

  it('muestra botón de unirse a clase', () => {
    render(
      <BrowserRouter>
        <StudentIsland />
      </BrowserRouter>
    )

    expect(screen.getByRole('button', { name: /unirse/i })).toBeInTheDocument()
  })

  it('unirse con código válido', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <StudentIsland />
      </BrowserRouter>
    )

    const input = screen.getByPlaceholderText(/código/i)
    const button = screen.getByRole('button', { name: /unirse/i })

    await user.type(input, 'MATH101')
    await user.click(button)

    await waitFor(() => {
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })
  })

  it('carga misiones después de unirse', async () => {
    render(
      <BrowserRouter>
        <StudentIsland />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/misiones/i)).toBeInTheDocument()
    })
  })
})
```

## Ejemplo 2: TeacherDashboard Integration Test

```javascript
// src/tests/integration/TeacherDashboard.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TeacherDashboard from '../../pages/TeacherDashboard'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'teacher-1' } }
      })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          { id: 's1', nombre: 'Juan' },
          { id: 's2', nombre: 'María' }
        ]
      })
    })
  }
}))

describe('TeacherDashboard Integration', () => {
  it('renderiza dashboard', async () => {
    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await screen.findByText(/dashboard/i)
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
  })

  it('muestra contador de estudiantes', async () => {
    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    await screen.findByText(/2/)
    expect(screen.getByText(/2/)).toBeInTheDocument()
  })

  it('tiene botón para crear misión', async () => {
    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    )

    const newMissionBtn = await screen.findByRole('button', { name: /nueva misión/i })
    expect(newMissionBtn).toBeInTheDocument()
  })
})
```

## Ejemplo 3: Auth Components Integration Test

```javascript
// src/tests/integration/Auth.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import IslaEducativaLogin from '../../components/Auth/IslaEducativaLogin'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-2' } },
        error: null
      })
    }
  }
}))

describe('Login Component', () => {
  it('renderiza formulario de login', () => {
    render(<IslaEducativaLogin />)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
  })

  it('valida contraseña débil', async () => {
    const user = userEvent.setup()
    render(<IslaEducativaLogin />)

    const passwordInput = screen.getByPlaceholderText(/contraseña/i)
    await user.type(passwordInput, 'weak')

    expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument()
  })
})
```

## Pasos para implementar:

1. **Crear carpeta `src/tests/integration/`**
   ```bash
   mkdir src/tests/integration
   ```

2. **Copiar y adaptar los ejemplos** a tus componentes reales

3. **Mock de Supabase mejorado** en `src/tests/mocks/supabase.js`
   ```javascript
   export const createMockSupabase = () => ({
     auth: { getUser: vi.fn(), signInWithPassword: vi.fn(), ... },
     from: vi.fn().mockReturnValue({ select: vi.fn(), ... }),
     rpc: vi.fn().mockResolvedValue({ data: {}, error: null })
   })
   ```

4. **Ejecutar tests**
   ```bash
   npm test -- src/tests/integration
   ```

5. **Ver coverage mejorado**
   ```bash
   npm run test:coverage
   ```

## Expected Coverage Growth

Después de agregar integration tests:
- **Antes**: 0% (0/1481 statements)
- **Después**: 40-60% (típico para apps medianas con buena cobertura de integration tests)
- **Con unit + integration tests exhaustivos**: 70-85%

## Recursos

- [Testing Library React](https://testing-library.com/react)
- [Vitest Mocking](https://vitest.dev/guide/mocking.html)
- [React Router Testing](https://reactrouter.com/en/main/start/testing)
