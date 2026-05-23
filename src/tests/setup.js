import { expect, afterEach, vi } from 'vitest'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// Limpiar después de cada prueba
afterEach(() => {
  cleanup()
})

// Mock de Supabase
export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(),
  rpc: vi.fn(),
  on: vi.fn(),
  channel: vi.fn(),
}

// Mock de respuestas comunes
export const createMockUser = (id = 'user-123') => ({
  id,
  email: 'test@example.com',
  user_metadata: {
    nombre_completo: 'Test User',
    full_name: 'Test User',
  },
})

export const createMockSession = () => ({
  user: createMockUser(),
  session: {
    access_token: 'mock-token',
  },
})

// Mock de base de datos
export const mockDatabaseQuery = () => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  catch: vi.fn().mockReturnThis(),
})

// Configurar variables de entorno para pruebas
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
process.env.VITE_SUPABASE_ANON_KEY = 'test-key-123'
