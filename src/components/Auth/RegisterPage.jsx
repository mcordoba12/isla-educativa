import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { supabase } from '../../services/supabaseClient'
import './LoginRegisterStyles.css'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, error } = useAuthContext()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rol, setRol] = useState('estudiante')
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    codigoClase: '',
    terminosAceptados: false
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

    // Validaciones
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.password) {
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

    if (rol === 'estudiante' && !formData.codigoClase) {
      setLocalError('Debes ingresar el código de tu clase')
      return
    }

    if (!formData.terminosAceptados) {
      setLocalError('Debes aceptar los términos y privacidad')
      return
    }

    try {
      const nombreCompleto = `${formData.nombre} ${formData.apellido}`
      await register(
        formData.email,
        formData.password,
        rol,
        nombreCompleto
      )
      navigate('/dashboard')
    } catch (err) {
      setLocalError(err.message || 'Error al registrarse')
    }
  }

  return (
    <div className="login-container">
      {/* Fondo animado */}
      <div className="ocean-background">
        <div className="sky"></div>
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
        <div className="sun">
          <div className="sun-rays"></div>
        </div>
        <div className="palm palm-left">
          <div className="palm-trunk"></div>
          <div className="palm-leaves"></div>
        </div>
        <div className="palm palm-right">
          <div className="palm-trunk"></div>
          <div className="palm-leaves"></div>
        </div>
        <div className="boat"></div>
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
        <div className="wave wave-3"></div>
        <div className="sand"></div>
      </div>

      {/* Tarjeta */}
      <div className="card card-register">
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
          <p className="description">
            Diseña tu pasaporte y empieza la aventura.
          </p>

          {/* Botón volver */}
          <Link to="/login" className="btn-back">
            ← Volver al acceso
          </Link>

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
            {/* Nombre y Apellido */}
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="nombre">NOMBRE</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Marina"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="apellido">APELLIDO</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Pérez"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
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
                  placeholder="tu@correo.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contraseña y Repetir */}
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
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
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="confirmPassword">REPETIR</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            </div>

            {/* Código de clase (solo estudiantes) */}
            {rol === 'estudiante' && (
              <div className="form-group">
                <label htmlFor="codigoClase">CÓDIGO DE TU CLASE</label>
                <div className="input-wrapper">
                  <span className="input-icon">🏫</span>
                  <input
                    type="text"
                    id="codigoClase"
                    name="codigoClase"
                    value={formData.codigoClase}
                    onChange={handleChange}
                    placeholder="ISLA-4B-2026"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Términos */}
            <div className="form-terms">
              <input
                type="checkbox"
                id="terminosAceptados"
                name="terminosAceptados"
                checked={formData.terminosAceptados}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="terminosAceptados">
                Acepto los <Link to="#" className="link-terms">términos</Link> y la{' '}
                <Link to="#" className="link-terms">privacidad</Link> de la isla.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creando cuenta...' : '✚ Crear mi pasaporte'}
            </button>
          </form>
        </div>
      </div>

      {/* Decoraciones */}
      <div className="decoration decoration-1">🎓 +120 misiones</div>
      <div className="decoration decoration-2">🏆 24 islas</div>
      <div className="decoration decoration-3">⛵ Clase en vivo</div>
      <div className="decoration decoration-4">🎁 Premios diarios</div>
    </div>
  )
}
