import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import IslaEducativaProyeccion from './IslaEducativaProyeccion'

export default function LiveSession() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch session and questions on mount
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setLoading(true)
        console.log('[LiveSession] Cargando sesión con ID:', id)

        // Fetch session
        const { data: sessionData, error: sessionError } = await supabase
          .from('classroom_sessions')
          .select('*')
          .eq('id', id)
          .single()

        if (sessionError) {
          console.error('[LiveSession] Error cargando sesión:', sessionError)
          throw new Error('No se encontró la sesión')
        }

        console.log('[LiveSession] Sesión cargada:', sessionData)
        setSession(sessionData)

        // Fetch questions ordered by numero_orden
        const { data: questionsData, error: questionsError } = await supabase
          .from('session_questions')
          .select('*')
          .eq('session_id', id)
          .order('numero_orden', { ascending: true })

        if (questionsError) {
          console.error('[LiveSession] Error cargando preguntas:', questionsError)
          throw new Error('No se pudieron cargar las preguntas')
        }

        console.log('[LiveSession] Preguntas cargadas:', questionsData)
        setQuestions(questionsData || [])
        setError(null)
      } catch (err) {
        console.error('[LiveSession] Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadSessionData()
    }
  }, [id])

  // Handle answer - update respuesta_docente for the question
  const handleAnswer = async ({ questionIndex, isCorrect }) => {
    try {
      if (!questions[questionIndex]) {
        console.warn('[LiveSession] Pregunta no encontrada en índice:', questionIndex)
        return
      }

      const question = questions[questionIndex]
      console.log('[LiveSession] Actualizando respuesta para pregunta:', question.id, 'isCorrect:', isCorrect)

      const { error } = await supabase
        .from('session_questions')
        .update({
          respuesta_docente: isCorrect ? 'correcto' : 'incorrecto'
        })
        .eq('id', question.id)

      if (error) {
        console.error('[LiveSession] Error actualizando respuesta:', error)
        throw error
      }

      console.log('[LiveSession] Respuesta actualizada exitosamente')
    } catch (err) {
      console.error('[LiveSession] Error en handleAnswer:', err)
    }
  }

  // Handle mission result - update resultado_mision for the question
  const handleMissionResult = async ({ questionIndex, resultado }) => {
    try {
      if (!questions[questionIndex]) {
        console.warn('[LiveSession] Pregunta no encontrada en índice:', questionIndex)
        return
      }

      const question = questions[questionIndex]
      console.log('[LiveSession] Actualizando resultado de misión para pregunta:', question.id, 'resultado:', resultado)

      const { error } = await supabase
        .from('session_questions')
        .update({
          resultado_mision: resultado
        })
        .eq('id', question.id)

      if (error) {
        console.error('[LiveSession] Error actualizando resultado_mision:', error)
        throw error
      }

      console.log('[LiveSession] Resultado de misión actualizado exitosamente')
    } catch (err) {
      console.error('[LiveSession] Error en handleMissionResult:', err)
    }
  }

  // Handle session complete - update estado back to 'configurada'
  const handleComplete = async () => {
    try {
      console.log('[LiveSession] Expedición completada, volviendo a configurada:', id)

      const { error } = await supabase
        .from('classroom_sessions')
        .update({
          estado: 'configurada',
          ended_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('[LiveSession] Error completando expedición:', error)
        throw error
      }

      console.log('[LiveSession] Expedición volvió a configurada exitosamente')
      // Redirect to dashboard
      navigate('/teacher/dashboard')
    } catch (err) {
      console.error('[LiveSession] Error en handleComplete:', err)
    }
  }

  // Handle exit - ask for confirmation and update back to 'configurada'
  const handleExit = async () => {
    const confirmed = window.confirm('¿Estás seguro de que quieres salir de la expedición? Volverá al estado configurado para poder iniciarla de nuevo.')

    if (!confirmed) {
      console.log('[LiveSession] Usuario canceló salida')
      return
    }

    try {
      console.log('[LiveSession] Cerrando expedición:', id)

      const { error } = await supabase
        .from('classroom_sessions')
        .update({
          estado: 'configurada'
        })
        .eq('id', id)

      if (error) {
        console.error('[LiveSession] Error cerrando expedición:', error)
        throw error
      }

      console.log('[LiveSession] Expedición volvió a configurada exitosamente')
      // Redirect to dashboard
      navigate('/teacher/dashboard')
    } catch (err) {
      console.error('[LiveSession] Error en handleExit:', err)
    }
  }

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-b from-[#87D5EE] to-[#E4F6FB]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F8FCE] mb-4"></div>
          <p className="text-[#4E6B7E] font-semibold">Cargando sesión...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-b from-[#87D5EE] to-[#E4F6FB]">
        <div className="text-center">
          <p className="text-[#E85C42] font-semibold mb-4">Error: {error}</p>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="px-6 py-3 bg-[#1F8FCE] text-white rounded-lg font-semibold hover:bg-[#0E5C8A]"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-b from-[#87D5EE] to-[#E4F6FB]">
        <div className="text-center">
          <p className="text-[#4E6B7E] font-semibold mb-4">No se encontró la sesión</p>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="px-6 py-3 bg-[#1F8FCE] text-white rounded-lg font-semibold hover:bg-[#0E5C8A]"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    )
  }

  // Extract question texts for the component
  const questionTexts = questions.map(q => q.texto_pregunta)

  return (
    <IslaEducativaProyeccion
      mascotNormal="/src/assets/images/cookie-normal.png"
      mascotCelebra="/src/assets/images/cookie-celebra.png"
      mascotTriste="/src/assets/images/cookie-triste.png"
      subject={session.titulo}
      topic={session.tema || 'Expedición educativa'}
      characterName="Come Dispersión"
      questions={questionTexts}
      totalQuestions={questions.length || 6}
      minutesPerQuestion={session.intervalo_minutos || 6}
      onAnswer={handleAnswer}
      onMissionResult={handleMissionResult}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  )
}
