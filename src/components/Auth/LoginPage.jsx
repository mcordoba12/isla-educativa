import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import './LoginRegisterStyles.css'

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
      {/* Fondo oceanico */}
      <div className="ocean-background">
        <div className="sky"></div>
        <div className="sea"></div>
        <div className="sand"></div>

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
          <div className="palm-leaves">
            <div className="palm-leaf"></div>
            <div className="palm-leaf"></div>
            <div className="palm-leaf"></div>
            <div className="palm-leaf"></div>
            <div className="palm-leaf"></div>
          </div>
        </div>
        <div className="palm palm-right">
          <div className="palm-trunk"></div>
          <div className="palm-leaves">
            <div className="palm-leaf"></div>
            <div className="palm-leaf"></div>
            <div className="palm-leaf"></div>
            <div className="palm-leaf"></div>
            <div className="palm-leaf"></div>
          </div>
        </div>

        {/* Velero */}
        <div className="boat">
          <div className="boat-mast"></div>
          <div className="boat-sail"></div>
          <div className="boat-hull"></div>
        </div>

        {/* Olas */}
        <div className="waves">
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
      </div>

      {/* Badges flotantes */}
      <div className="badge badge-top-left">📋 +120 misiones</div>
      <div className="badge badge-bottom-left">⛵ Clase en vivo</div>
      <div className="badge badge-top-right">🎁 Premios diarios</div>
      <div className="badge badge-bottom-right">🏆 24 islas</div>

      {/* Tarjeta */}
      <div className="card">
        {/* Personaje */}
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
            <button type="button" className="role-btn">
              🎓 Soy Docente
            </button>
            <button type="button" className="role-btn active">
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
              <label>CORREO</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="marina@miescuela.edu"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>CONTRASEÑA</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
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
                  tabIndex="-1"
                >
                  👁️
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
    </div>
  )
}
