import { describe, it, expect, vi, beforeAll } from 'vitest'

// Configurar variables de entorno para el test
beforeAll(() => {
  process.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
  process.env.VITE_SUPABASE_ANON_KEY = 'test-key-123'
})

// Mock de @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => {
  const mockClient = {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      updateUser: vi.fn()
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      single: vi.fn()
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn()
    })
  }

  return {
    createClient: vi.fn(() => mockClient)
  }
})

// Importar supabase después de configurar el mock
import { supabase } from '../../services/supabaseClient'

describe('supabaseClient.js', () => {
  it('cliente se exporta correctamente', () => {
    expect(supabase).toBeDefined()
  })

  it('cliente tiene método auth', () => {
    expect(supabase.auth).toBeDefined()
    expect(typeof supabase.auth).toBe('object')
  })

  it('cliente tiene método from para acceder a tablas', () => {
    expect(supabase.from).toBeDefined()
    expect(typeof supabase.from).toBe('function')
  })

  it('cliente tiene método channel para realtime', () => {
    expect(supabase.channel).toBeDefined()
    expect(typeof supabase.channel).toBe('function')
  })

  it('auth tiene método signInWithPassword', () => {
    expect(supabase.auth.signInWithPassword).toBeDefined()
    expect(typeof supabase.auth.signInWithPassword).toBe('function')
  })

  it('auth tiene método signUp', () => {
    expect(supabase.auth.signUp).toBeDefined()
    expect(typeof supabase.auth.signUp).toBe('function')
  })

  it('auth tiene método signOut', () => {
    expect(supabase.auth.signOut).toBeDefined()
    expect(typeof supabase.auth.signOut).toBe('function')
  })

  it('auth tiene método getSession', () => {
    expect(supabase.auth.getSession).toBeDefined()
    expect(typeof supabase.auth.getSession).toBe('function')
  })

  it('auth tiene método onAuthStateChange', () => {
    expect(supabase.auth.onAuthStateChange).toBeDefined()
    expect(typeof supabase.auth.onAuthStateChange).toBe('function')
  })

  it('auth tiene método updateUser', () => {
    expect(supabase.auth.updateUser).toBeDefined()
    expect(typeof supabase.auth.updateUser).toBe('function')
  })

  it('from retorna un objeto con métodos de query', () => {
    const table = supabase.from('users')
    expect(table).toBeDefined()
    expect(table.select).toBeDefined()
    expect(table.insert).toBeDefined()
    expect(table.update).toBeDefined()
    expect(table.delete).toBeDefined()
  })

  it('channel retorna un objeto con métodos de realtime', () => {
    const channel = supabase.channel('test-channel')
    expect(channel).toBeDefined()
    expect(channel.on).toBeDefined()
    expect(channel.subscribe).toBeDefined()
    expect(channel.unsubscribe).toBeDefined()
  })

  it('cliente está correctamente configurado', () => {
    expect(supabase).toHaveProperty('auth')
    expect(supabase).toHaveProperty('from')
    expect(supabase).toHaveProperty('channel')
  })

  it('auth tiene métodos esperados', () => {
    const expectedMethods = ['signInWithPassword', 'signUp', 'signOut', 'getSession', 'onAuthStateChange', 'updateUser']
    expectedMethods.forEach(method => {
      expect(supabase.auth[method]).toBeDefined()
      expect(typeof supabase.auth[method]).toBe('function')
    })
  })

  it('from es callable con nombre de tabla', () => {
    const result = supabase.from('test_table')
    expect(result).toBeDefined()
    expect(result.select).toBeDefined()
  })

  it('channel es callable con nombre de canal', () => {
    const result = supabase.channel('test_channel')
    expect(result).toBeDefined()
    expect(result.subscribe).toBeDefined()
  })

  it('cliente es instancia de objeto', () => {
    expect(typeof supabase).toBe('object')
    expect(supabase !== null).toBe(true)
  })
})
