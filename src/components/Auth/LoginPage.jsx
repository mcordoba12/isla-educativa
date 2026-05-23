import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import '../Auth/LoginRegisterStyles.css'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, error } = useAuthContext()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    recordarme: false
  })
  const [localError, setLocalError] = useState(null)
  const [rol, setRol] = useState('estudiante')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setLocalError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    if (!formData.email || !formData.password) {
      setLocalError('Por favor completa todos los campos')
      return
    }

    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setLocalError(err.message || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="login-container">
      {/* Fondo animado */}
      <div className="ocean-background">
        <div className="sky"></div>

        {/* Nubes */}
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>

        {/* Sol */}
        <div className="sun">
          <div className="sun-rays"></div>
        </div>

        {/* Palmeras */}
        <div className="palm palm-left">
          <div className="palm-trunk"></div>
          <div className="palm-leaves"></div>
        </div>
        <div className="palm palm-right">
          <div className="palm-trunk"></div>
          <div className="palm-leaves"></div>
        </div>

        {/* Bote */}
        <div className="boat"></div>

        {/* Olas */}
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
        <div className="wave wave-3"></div>

        {/* Arena */}
        <div className="sand"></div>
      </div>

      {/* Tarjeta */}
      <div className="card">
        {/* Personaje arriba */}
        <div className="character-container">
          <img
            src="/src/assets/images/cookie-normal.png"
            alt="Come Dispersión"
            className="character bounce-soft"
          />
        </div>

        {/* Contenido */}
        <div className="card-content">
          <p className="subtitle">APP EDUCATIVA</p>
          <h1 className="title">
            Isla <span className="title-accent">Educativa</span>
          </h1>
          <p className="description">¡Navegemos juntos hacia el aprendizaje!</p>

          {/* Selector de rol */}
          <div className="role-toggle">
            <button
              type="button"
              className={`role-btn ${rol === 'docente' ? 'active' : ''}`}
              onClick={() => setRol('docente')}
            >
              🎓 Soy Docente
            </button>
            <button
              type="button"
              className={`role-btn ${rol === 'estudiante' ? 'active' : ''}`}
              onClick={() => setRol('estudiante')}
            >
              📋 Soy Estudiante
            </button>
          </div>

          {/* Errores */}
          {(error || localError) && (
            <div className="error-message">
              {error || localError}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">CORREO</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="marina@miescuela.edu"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">CONTRASEÑA</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-checkbox">
              <input
                type="checkbox"
                id="recordarme"
                name="recordarme"
                checked={formData.recordarme}
                onChange={handleChange}
              />
              <label htmlFor="recordarme">Recuérdame</label>
              <Link to="#" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Iniciando sesión...' : '⚓ ¡Zarpar a la isla!'}
            </button>
          </form>

          <div className="divider">o</div>

          <p className="switch-auth">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/register" className="link-register">
              Crea tu pasaporte
            </Link>
          </p>
        </div>
      </div>

      {/* Elementos decorativos */}
      <div className="decoration decoration-1">🎓 +120 misiones</div>
      <div className="decoration decoration-2">🏆 24 islas</div>
      <div className="decoration decoration-3">⛵ Clase en vivo</div>
      <div className="decoration decoration-4">🎁 Premios diarios</div>
    </div>
  )
}
