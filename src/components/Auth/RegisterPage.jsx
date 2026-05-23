import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { supabase } from '../../services/supabaseClient'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, error } = useAuthContext()
  const [docentes, setDocentes] = useState([])
  const [cargandoDocentes, setCargandoDocentes] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombreCompleto: '',
    rol: 'estudiante',
    docenteId: ''
  })
  const [localError, setLocalError] = useState(null)

  useEffect(() => {
    // Cargar lista de docentes
    const cargarDocentes = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, nombre_completo')
          .eq('rol', 'docente')
          .order('nombre_completo')

        if (error) throw error
        setDocentes(data || [])
      } catch (err) {
        console.error('Error cargando docentes:', err)
      } finally {
        setCargandoDocentes(false)
      }
    }

    cargarDocentes()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    setLocalError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    // Validaciones
    if (!formData.email || !formData.password || !formData.nombreCompleto) {
      setLocalError('Por favor completa todos los campos requeridos')
      return
    }

    if (formData.password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Las contraseñas no coinciden')
      return
    }

    if (formData.rol === 'estudiante' && !formData.docenteId) {
      setLocalError('Debes seleccionar un docente')
      return
    }

    try {
      await register(
        formData.email,
        formData.password,
        formData.rol,
        formData.nombreCompleto
      )

      // Si es estudiante, vincular con docente
      if (formData.rol === 'estudiante' && formData.docenteId) {
        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (user) {
          await supabase.from('teacher_students').insert({
            docente_id: formData.docenteId,
            estudiante_id: user.id
          })
        }
      }

      navigate('/dashboard')
    } catch (err) {
      setLocalError(err.message || 'Error al registrarse')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Regístrate
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Únete a la Isla Educativa
        </p>

        {(error || localError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error || localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombreCompleto" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              id="nombreCompleto"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              placeholder="Tu nombre"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
              ¿Eres...?
            </label>
            <select
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            >
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
            </select>
          </div>

          {formData.rol === 'estudiante' && (
            <div>
              <label htmlFor="docenteId" className="block text-sm font-medium text-gray-700 mb-1">
                Selecciona tu docente
              </label>
              {cargandoDocentes ? (
                <div className="text-gray-600 text-sm">Cargando docentes...</div>
              ) : docentes.length > 0 ? (
                <select
                  id="docenteId"
                  name="docenteId"
                  value={formData.docenteId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={loading}
                >
                  <option value="">-- Selecciona un docente --</option>
                  {docentes.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.nombre_completo}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-gray-600 text-sm">
                  No hay docentes disponibles. Contacta al administrador.
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirma tu contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
