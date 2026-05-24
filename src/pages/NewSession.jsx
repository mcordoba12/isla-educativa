import React, { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

// ─── Animaciones ─────────────────────────────────────────────────────────────
const ANIMATIONS_CSS = `
@keyframes isla-mascot-bob   { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-8px) rotate(3deg); } }
@keyframes isla-speech-pop   { from { transform: scale(.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes isla-toast-pop    { from { transform: translateX(-50%) translateY(20px) scale(.85); opacity: 0; } to { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; } }
@keyframes isla-launch-spin  { to { transform: rotate(360deg); } }
@keyframes isla-launch-popin { from { transform: scale(.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes isla-fade-in      { from { opacity: 0; } to { opacity: 1; } }
.isla-anim-bob   { animation: isla-mascot-bob 2.6s ease-in-out infinite; transform-origin: bottom center; }
.isla-anim-speech{ animation: isla-speech-pop .4s cubic-bezier(.2,1.4,.4,1); }
.isla-anim-toast { animation: isla-toast-pop .35s cubic-bezier(.2,1.4,.4,1); }
.isla-anim-spin  { animation: isla-launch-spin 1.1s linear infinite; }
.isla-anim-popin { animation: isla-launch-popin .4s cubic-bezier(.2,1.4,.4,1); }
.isla-anim-fadein{ animation: isla-fade-in .3s ease; }
`

// ─── Iconos ──────────────────────────────────────────────────────────────────
function Icon({ name, className = "w-5 h-5", strokeWidth = 2.2 }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" }
  switch (name) {
    case "book":      return <svg viewBox="0 0 24 24" className={className}><path d="M4 5a2 2 0 012-2h12v18H6a2 2 0 01-2-2V5z" {...p}/><path d="M6 19h12M9 7h6" {...p}/></svg>
    case "lightbulb": return <svg viewBox="0 0 24 24" className={className}><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12c.8.8 1.2 2 1.2 3h5.6c0-1 .4-2.2 1.2-3A7 7 0 0012 2z" {...p}/></svg>
    case "help":      return <svg viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="9" {...p}/><path d="M9.5 9a2.5 2.5 0 015 .3c0 1.7-2.5 1.7-2.5 3.7M12 17v.5" {...p}/></svg>
    case "compass":   return <svg viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="9" {...p}/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" {...p}/></svg>
    case "clock":     return <svg viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="9" {...p}/><path d="M12 7v5l3 2" {...p}/></svg>
    case "logout":    return <svg viewBox="0 0 24 24" className={className}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" {...p}/></svg>
    case "play":      return <svg viewBox="0 0 24 24" className={className}><path d="M7 5l13 7-13 7V5z" {...p} fill="currentColor"/></svg>
    case "check":     return <svg viewBox="0 0 24 24" className={className}><path d="M5 12l5 5 9-10" {...p}/></svg>
    case "sparkle":   return <svg viewBox="0 0 24 24" className={className}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" {...p} fill="currentColor"/></svg>
    case "users":     return <svg viewBox="0 0 24 24" className={className}><circle cx="9" cy="9" r="3.5" {...p}/><circle cx="17" cy="10" r="2.5" {...p}/><path d="M3 19c.8-3 3.5-4.5 6-4.5s5.2 1.5 6 4.5M15.5 15c1.5 0 4.5 1 5.5 4" {...p}/></svg>
    case "arrow-left": return <svg viewBox="0 0 24 24" className={className}><path d="M14 6l-6 6 6 6M20 12H8" {...p}/></svg>
    default: return null
  }
}

// ─── Fondo tropical ──────────────────────────────────────────────────────────
function TropicalScene() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none opacity-60" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
        <defs>
          <linearGradient id="ipd-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7FCFEC"/>
            <stop offset="55%" stopColor="#BCEAF7"/>
            <stop offset="100%" stopColor="#E4F6FB"/>
          </linearGradient>
          <linearGradient id="ipd-ocean" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4FB5E5"/>
            <stop offset="100%" stopColor="#1F8FCE"/>
          </linearGradient>
          <radialGradient id="ipd-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE9A8"/>
            <stop offset="70%" stopColor="#FFD874"/>
            <stop offset="100%" stopColor="#E8B547"/>
          </radialGradient>
        </defs>

        <rect width="1440" height="900" fill="url(#ipd-sky)"/>

        <g>
          <circle cx="1180" cy="220" r="120" fill="#FFE9A8" opacity="0.55"/>
          <circle cx="1180" cy="220" r="80" fill="url(#ipd-sun)" stroke="#173951" strokeWidth="4"/>
          {[0,45,90,135,180,225,270,315].map((a) => (
            <rect key={a} x="1176" y="80" width="8" height="20" rx="3"
              fill="#FFD874" stroke="#173951" strokeWidth="3"
              transform={`rotate(${a} 1180 220)`}/>
          ))}
        </g>

        <g fill="#FFFDF6" stroke="#173951" strokeWidth="3.5">
          <g transform="translate(180,160)">
            <ellipse cx="0" cy="0" rx="55" ry="22"/>
            <ellipse cx="35" cy="-10" rx="32" ry="18"/>
            <ellipse cx="-30" cy="-6" rx="28" ry="16"/>
          </g>
          <g transform="translate(720,90)">
            <ellipse cx="0" cy="0" rx="48" ry="20"/>
            <ellipse cx="30" cy="-8" rx="28" ry="16"/>
            <ellipse cx="-26" cy="-4" rx="24" ry="14"/>
          </g>
          <g transform="translate(420,260)">
            <ellipse cx="0" cy="0" rx="40" ry="16"/>
            <ellipse cx="25" cy="-7" rx="22" ry="13"/>
            <ellipse cx="-22" cy="-3" rx="20" ry="12"/>
          </g>
        </g>

        <g opacity="0.5">
          <ellipse cx="220" cy="640" rx="160" ry="22" fill="#1F8FCE"/>
          <path d="M 90 640 Q 220 555 350 640 Z" fill="#5BC982" stroke="#1B7A45" strokeWidth="3"/>
        </g>

        <path d="M 0 640 Q 360 615 720 640 T 1440 640 L 1440 900 L 0 900 Z" fill="url(#ipd-ocean)"/>
        <g stroke="#FFFDF6" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7">
          <path d="M 60 720 q 30 -10 60 0 t 60 0"/>
          <path d="M 980 700 q 30 -10 60 0 t 60 0"/>
          <path d="M 300 800 q 30 -10 60 0 t 60 0"/>
          <path d="M 1180 820 q 30 -10 60 0 t 60 0"/>
          <path d="M 700 770 q 30 -10 60 0 t 60 0"/>
        </g>

        <g>
          <ellipse cx="960" cy="780" rx="380" ry="40" fill="#FFD874" stroke="#173951" strokeWidth="4"/>
          <path d="M 600 780 Q 960 660 1320 780 Z" fill="#FFE9A8" stroke="#173951" strokeWidth="4"/>
        </g>

        <g transform="translate(720,720)">
          <path d="M 0 0 Q -6 -80 8 -160" stroke="#7B4B2A" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <g transform="translate(8,-160)">
            {["M 0 0 Q 60 -20 100 10 Q 60 -5 0 5 Z","M 0 0 Q -60 -20 -100 10 Q -60 -5 0 5 Z","M 0 0 Q 30 -60 70 -90 Q 20 -50 0 -8 Z","M 0 0 Q -30 -60 -70 -90 Q -20 -50 0 -8 Z","M 0 0 Q 80 10 110 50 Q 60 20 0 8 Z","M 0 0 Q -80 10 -110 50 Q -60 20 0 8 Z"].map((d,i)=>(
              <path key={i} d={d} fill="#2BA15C" stroke="#1B7A45" strokeWidth="3" strokeLinejoin="round"/>
            ))}
            <circle cx="0" cy="0" r="8" fill="#1B7A45"/>
            <circle cx="-8" cy="6" r="6" fill="#7B4B2A" stroke="#5C3618" strokeWidth="2"/>
            <circle cx="8" cy="6" r="6" fill="#7B4B2A" stroke="#5C3618" strokeWidth="2"/>
          </g>
        </g>

        <g transform="translate(1180,730)">
          <path d="M 0 0 Q 8 -90 -6 -180" stroke="#7B4B2A" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <g transform="translate(-6,-180)">
            {["M 0 0 Q 60 -20 100 10 Q 60 -5 0 5 Z","M 0 0 Q -60 -20 -100 10 Q -60 -5 0 5 Z","M 0 0 Q 30 -60 70 -90 Q 20 -50 0 -8 Z","M 0 0 Q -30 -60 -70 -90 Q -20 -50 0 -8 Z","M 0 0 Q 80 10 110 50 Q 60 20 0 8 Z","M 0 0 Q -80 10 -110 50 Q -60 20 0 8 Z"].map((d,i)=>(
              <path key={i} d={d} fill="#5BC982" stroke="#1B7A45" strokeWidth="3" strokeLinejoin="round"/>
            ))}
            <circle cx="0" cy="0" r="8" fill="#1B7A45"/>
          </g>
        </g>

        <g transform="translate(380,690)">
          <path d="M -30 0 L 30 0 L 22 14 L -22 14 Z" fill="#FFFDF6" stroke="#173951" strokeWidth="3"/>
          <path d="M 0 -38 L 0 0 L 22 0 Z" fill="#FF8763" stroke="#173951" strokeWidth="3"/>
          <line x1="0" y1="-38" x2="0" y2="0" stroke="#173951" strokeWidth="2.5"/>
        </g>

        <path d="M 0 870 Q 360 855 720 870 T 1440 870 L 1440 900 L 0 900 Z"
          fill="#FFD874" stroke="#173951" strokeWidth="3"/>
      </svg>
    </div>
  )
}

// ─── Input ───────────────────────────────────────────────────────────────────
function TextField({ label, icon, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="pl-1 text-[12px] font-extrabold tracking-[.08em] uppercase text-[#4E6B7E]">{label}</label>
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-[#1F8FCE] pointer-events-none">
            <Icon name={icon} className="w-5 h-5"/>
          </span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 rounded-2xl border-[2.5px] border-[#173951] bg-[#FFFDF6] outline-none
                     pl-[42px] pr-3 font-semibold text-[15px] text-[#173951] placeholder:text-[#93A6B3] placeholder:font-medium
                     transition-[box-shadow,border-color] focus:border-[#1F8FCE] focus:shadow-[0_0_0_4px_rgba(31,143,206,.25)]"
        />
      </div>
    </div>
  )
}

// ─── Question Input ──────────────────────────────────────────────────────────
const QUESTION_COLORS = [
  "bg-[#1F8FCE] text-white",
  "bg-[#2BA15C] text-white",
  "bg-[#E8B547] text-[#173951]",
  "bg-[#FF8763] text-white",
  "bg-[#7A5AE0] text-white",
  "bg-[#E85C42] text-white",
]

function NumberedQuestion({ index, value, onChange, onRemove }) {
  return (
    <div className="flex items-stretch border-[2.5px] border-[#173951] rounded-2xl bg-[#FFFDF6] overflow-hidden
                    transition-[box-shadow,border-color] focus-within:border-[#1F8FCE]
                    focus-within:shadow-[0_0_0_4px_rgba(31,143,206,.25)]">
      <div className={`grid place-items-center w-[52px] flex-shrink-0 font-Fredoka font-bold text-[22px]
                      border-r-[2.5px] border-[#173951] ${QUESTION_COLORS[index % QUESTION_COLORS.length]}`}>
        {index + 1}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Pregunta ${index + 1}…`}
        className="flex-1 h-[52px] border-0 bg-transparent px-3.5 font-semibold text-[15px] text-[#173951]
                   placeholder:text-[#93A6B3] placeholder:font-medium outline-none"
      />
      {index > 0 && (
        <button
          type="button"
          onClick={onRemove}
          className="grid place-items-center w-[52px] flex-shrink-0 border-l-[2.5px] border-[#173951]
                     text-[#E85C42] hover:text-[#C84B35] font-bold text-lg transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  )
}

// ─── Time Card ───────────────────────────────────────────────────────────────
function TimeCard({ minutes, selected, onClick }) {
  const minuteAngle = (minutes / 60) * 360
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={[
        "relative flex flex-col items-center gap-2 px-3.5 py-4 cursor-pointer transition-all",
        "rounded-[18px] border-[3px] border-[#173951] font-Fredoka text-[#173951]",
        selected
          ? "bg-[#FFD874] -translate-y-0.5 shadow-[0_6px_0_#E8B547]"
          : "bg-[#FFFDF6] shadow-[0_4px_0_#173951] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#173951]",
      ].join(" ")}
    >
      {selected && (
        <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-[#2BA15C] text-white
                         border-[2.5px] border-[#173951] grid place-items-center font-bold text-sm
                         shadow-[0_2px_0_#1B7A45]">✓</span>
      )}
      <div className={`relative w-14 h-14 rounded-full border-[3px] border-[#173951] grid place-items-center
                       ${selected ? "bg-white" : "bg-[#FFE9A8]"}`}>
        <span className="absolute w-2 h-2 rounded-full bg-[#173951]"/>
        <span className="absolute bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom rounded-sm bg-[#173951]"
              style={{ width: 3, height: 16, transform: `translateX(-50%) rotate(${minutes * 6}deg)` }}/>
        <span className="absolute bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom rounded-sm bg-[#173951]"
              style={{ width: 3, height: 22, transform: `translateX(-50%) rotate(${minuteAngle}deg)` }}/>
      </div>
      <div className="text-[28px] font-bold leading-none">{minutes} min</div>
      <div className="text-[11px] font-semibold uppercase tracking-[.1em] text-[#4E6B7E]">por pregunta</div>
    </button>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────
function Section({ badge, color = "ocean", title, subtitle, children }) {
  const colorMap = {
    ocean:  "bg-[#1F8FCE] text-white",
    coral:  "bg-[#FF8763] text-white",
    palm:   "bg-[#2BA15C] text-white",
    sand:   "bg-[#FFD874] text-[#173951]",
  }
  return (
    <section className="bg-[#FFFDF6] border-[3px] border-[#173951] rounded-[24px] p-6 sm:p-7
                        shadow-[0_4px_0_#173951,0_16px_36px_-10px_rgba(14,92,138,.3)] mb-6">
      <header className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl border-[2.5px] border-[#173951] grid place-items-center
                        shadow-[0_3px_0_#173951] flex-shrink-0 ${colorMap[color]}`}>
          {badge}
        </div>
        <div>
          <h3 className="font-Fredoka font-bold text-[20px] sm:text-[22px] text-[#173951] leading-none m-0">{title}</h3>
          {subtitle && <p className="mt-1 text-[13.5px] font-semibold text-[#4E6B7E] m-0">{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  )
}

// ─── Stat ────────────────────────────────────────────────────────────────────
function Stat({ value, label }) {
  return (
    <div className="bg-[#FFFDF6] border-[2.5px] border-[#173951] rounded-2xl px-3.5 py-2.5 shadow-[0_3px_0_#173951] min-w-[92px]">
      <div className="font-Fredoka font-bold text-[22px] sm:text-[24px] text-[#0E5C8A] leading-none">{value}</div>
      <div className="mt-1 text-[10px] font-bold tracking-[.1em] uppercase text-[#4E6B7E]">{label}</div>
    </div>
  )
}

// ─── Mascot Corner ───────────────────────────────────────────────────────────
function MascotCorner({ mascotSrc, message }) {
  return (
    <div className="fixed bottom-4 right-5 z-30 flex items-end gap-2.5 pointer-events-none">
      <div className="relative max-w-[220px] pointer-events-auto bg-[#FFFDF6] border-[2.5px] border-[#173951]
                      rounded-2xl px-3.5 py-2.5 shadow-[0_3px_0_#173951]
                      font-Fredoka font-bold text-[13.5px] text-[#173951] isla-anim-speech">
        {message}
        <span className="absolute bottom-3 -right-2.5 w-3.5 h-3.5 bg-[#FFFDF6]
                         border-r-[2.5px] border-b-[2.5px] border-[#173951] -rotate-45"/>
      </div>
      <img src={mascotSrc} alt="Come Dispersión" className="w-[140px] h-[140px] object-contain isla-anim-bob"/>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function NewSession() {
  const navigate = useNavigate()
  const [teacherName, setTeacherName] = useState("Docente")
  const [asignatura, setAsignatura] = useState("")
  const [tema, setTema] = useState("")
  const [questions, setQuestions] = useState([""])
  const [intervalo, setIntervalo] = useState(6)
  const [launching, setLaunching] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.nombre_completo) {
        setTeacherName(user.user_metadata.nombre_completo)
      }
    }
    getUser()
  }, [])

  const initials = useMemo(() => (
    teacherName
      .split(" ")
      .filter((p) => p && p.length > 1)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("")
  ), [teacherName])

  const firstName = teacherName.split(" ")[0] || ""
  const filledCount = questions.filter((q) => q.trim().length > 0).length
  const totalMinutes = filledCount * intervalo
  const canLaunch = asignatura.trim() && tema.trim() && filledCount >= 1

  const updateQuestion = (i, v) => {
    setQuestions((qs) => {
      const next = [...qs]
      next[i] = v
      return next
    })
  }

  const addQuestion = () => {
    setQuestions([...questions, ""])
  }

  const removeQuestion = (i) => {
    setQuestions(questions.filter((_, idx) => idx !== i))
  }

  const handleLaunch = async (estado = "configurada") => {
    if (!canLaunch || launching) return

    setLaunching(true)
    try {
      console.log('[NewSession] Iniciando expedición con estado:', estado)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No hay sesión activa")

      console.log('[NewSession] Usuario ID:', user.id)
      console.log('[NewSession] Datos a guardar:', { asignatura, tema, intervalo, filledCount, estado })

      // Insertar sesión
      console.log('[NewSession] Insertando en classroom_sessions con estado:', estado)
      const { data: sessionData, error: sessionError } = await supabase
        .from("classroom_sessions")
        .insert({
          docente_id: user.id,
          titulo: asignatura,
          intervalo_minutos: intervalo,
          estado: estado,
        })
        .select()
        .single()

      if (sessionError) {
        console.error('[NewSession] Error en INSERT classroom_sessions:', sessionError)
        throw sessionError
      }
      if (!sessionData) throw new Error("No se creó la sesión")

      console.log('[NewSession] Sesión creada:', sessionData.id)

      // Insertar preguntas
      const questionsToInsert = questions
        .map((texto, i) => ({
          session_id: sessionData.id,
          numero_orden: i + 1,
          texto_pregunta: texto.trim(),
        }))
        .filter((q) => q.texto_pregunta.length > 0)

      console.log('[NewSession] Insertando', questionsToInsert.length, 'preguntas...')
      const { error: questionsError } = await supabase
        .from("session_questions")
        .insert(questionsToInsert)

      if (questionsError) {
        console.error('[NewSession] Error en INSERT session_questions:', questionsError)
        throw questionsError
      }

      console.log('[NewSession] Preguntas insertadas exitosamente')

      if (estado === "configurada") {
        setToast("¡Expedición guardada! Puedes iniciarla cuando quieras 🌊")
        setTimeout(() => navigate("/teacher/dashboard"), 1000)
      } else {
        setToast("¡Expedición iniciada exitosamente!")
        setTimeout(() => navigate(`/teacher/live-session/${sessionData.id}`), 1000)
      }
    } catch (error) {
      console.error("[NewSession] Error al lanzar sesión:", error)
      setToast(error.message || "Error al guardar la expedición")
      setTimeout(() => setToast(null), 3000)
    } finally {
      setLaunching(false)
    }
  }

  const mascotMessage = canLaunch
    ? "¡Tu expedición se ve genial, capitán! 🧭"
    : "Cuéntame qué van a aprender hoy en la isla 🌴"

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden font-Nunito text-[#173951]
                    bg-gradient-to-b from-[#87D5EE] via-[#E4F6FB] via-60% to-[#FFF8E7]">
      <style>{ANIMATIONS_CSS}</style>

      <TropicalScene/>

      {/* Header simple */}
      <header className="relative z-20 bg-[#FFFDF6] border-b-[3px] border-[#173951] shadow-[0_2px_0_rgba(14,92,138,.12)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-7 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/teacher/dashboard")}
              className="flex items-center gap-2 font-Fredoka font-bold text-[13.5px] text-[#1F8FCE]
                         hover:text-[#0E5C8A] transition-colors"
            >
              <Icon name="arrow-left" className="w-4 h-4"/> Volver
            </button>
          </div>
          <h1 className="font-Fredoka font-bold text-[18px] text-[#0E5C8A]">Nueva expedición</h1>
          <div className="w-20"/>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-5 sm:px-7 py-8 pb-32">
        {/* Hero */}
        <div className="flex items-end justify-between gap-6 mb-6 flex-wrap">
          <div>
            <h2 className="font-Fredoka font-bold text-[28px] sm:text-[38px] leading-none m-0 text-[#0E5C8A] tracking-tight"
                style={{ textShadow: "2px 2px 0 #FFE9A8" }}>
              ¡Hola{firstName ? `, ${firstName}` : ""}! 🌊
            </h2>
            <p className="mt-2.5 text-[14px] sm:text-[15px] font-semibold text-[#4E6B7E] max-w-xl m-0">
              Prepara la expedición de hoy. Cuando todo esté listo, proyéctalo en clase
              y tus estudiantes se sumarán desde sus dispositivos.
            </p>
          </div>

          <div className="flex gap-2.5">
            <Stat value={filledCount} label="Preguntas"/>
            <Stat value={`${intervalo}m`} label="Por reto"/>
            <Stat value={totalMinutes ? `${totalMinutes}m` : "—"} label="Duración"/>
          </div>
        </div>

        {/* Configurar */}
        <Section
          badge={<Icon name="compass" className="w-5 h-5"/>}
          color="ocean"
          title="Configura tu expedición"
          subtitle="Define la asignatura y el tema que vas a explorar hoy."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Nombre de la asignatura" icon="book" value={asignatura}
              onChange={setAsignatura} placeholder="Ej. Ciencias Naturales"/>
            <TextField label="Tema de la clase de hoy" icon="lightbulb" value={tema}
              onChange={setTema} placeholder="Ej. Los ecosistemas marinos"/>
          </div>
        </Section>

        {/* Preguntas */}
        <Section
          badge={<Icon name="help" className="w-5 h-5"/>}
          color="coral"
          title="Las preguntas de la travesía"
          subtitle="Cada pregunta es una parada en la isla. Añade tantas como necesites."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {questions.map((q, i) => (
              <NumberedQuestion key={i} index={i} value={q} onChange={(v) => updateQuestion(i, v)} onRemove={() => removeQuestion(i)}/>
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="mt-4 w-full py-2.5 rounded-lg border-[2.5px] border-dashed border-[#FF8763]
                       bg-[#FFE0D6] text-[#E85C42] font-Fredoka font-bold text-[14px]
                       hover:bg-[#FFD1C5] transition-all"
          >
            + Añadir pregunta
          </button>

          <div className="mt-3.5 flex items-center gap-2.5 text-[13px] font-bold text-[#4E6B7E]">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2BA15C] border-[2px] border-[#173951]"/>
            {filledCount === 0
              ? "Aún no has escrito preguntas — ¡añade al menos una!"
              : `${filledCount} pregunta${filledCount > 1 ? "s" : ""} lista${filledCount > 1 ? "s" : ""}`}
          </div>
        </Section>

        {/* Tiempo */}
        <Section
          badge={<Icon name="clock" className="w-5 h-5"/>}
          color="sand"
          title="Tiempo entre preguntas"
          subtitle="¿Cuánto tiempo tendrán los estudiantes para responder cada parada?"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5" role="radiogroup">
            {[5, 6, 7].map((m) => (
              <TimeCard key={m} minutes={m} selected={intervalo === m} onClick={() => setIntervalo(m)}/>
            ))}
          </div>
        </Section>

        {/* Action */}
        <div className="mt-2 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5 bg-[#E4F6FB] border-[2.5px] border-[#1F8FCE]
                          rounded-full px-4 py-2.5 font-bold text-[13.5px] text-[#0E5C8A]">
            <Icon name="users" className="w-4 h-4"/>
            {asignatura ? `${asignatura} · ${tema || "—"}` : "Completa la asignatura y el tema"}
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              disabled={!canLaunch || launching}
              onClick={() => handleLaunch("configurada")}
              className={[
                "border-[3px] rounded-[20px] font-Fredoka font-bold text-[16px] sm:text-[18px] tracking-wide",
                "flex items-center gap-2 px-5 sm:px-6 py-3 transition-all",
                canLaunch && !launching
                  ? "bg-[#FFD874] text-[#173951] border-[#173951] shadow-[0_4px_0_#E8B547,0_8px_20px_-2px_rgba(232,181,71,.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#E8B547,0_12px_26px_-2px_rgba(232,181,71,.4)] active:translate-y-1 active:shadow-[0_2px_0_#E8B547]"
                  : "bg-[#C9D2D9] text-[#FFFDF6] border-[#8AA0AE] shadow-[0_5px_0_#8AA0AE] cursor-not-allowed",
              ].join(" ")}
            >
              <Icon name="check" className="w-4 h-4"/>
              {launching ? "Guardando…" : "Guardar expedición"}
            </button>

            <button
              type="button"
              disabled={!canLaunch || launching}
              onClick={() => handleLaunch("iniciada")}
              className={[
                "border-[3px] rounded-[20px] font-Fredoka font-bold text-[18px] sm:text-[22px] tracking-wide",
                "flex items-center gap-2.5 px-7 sm:px-8 py-4 transition-all",
                canLaunch && !launching
                  ? "bg-[#FF8763] text-white border-[#173951] shadow-[0_5px_0_#E85C42,0_8px_20px_-2px_rgba(232,92,66,.5)] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#E85C42,0_12px_26px_-2px_rgba(232,92,66,.55)] active:translate-y-1 active:shadow-[0_2px_0_#E85C42]"
                  : "bg-[#C9D2D9] text-[#FFFDF6] border-[#8AA0AE] shadow-[0_5px_0_#8AA0AE] cursor-not-allowed",
              ].join(" ")}
            >
              <Icon name="play" className="w-5 h-5"/>
              {launching ? "Zarpando…" : "¡Iniciar ahora!"}
            </button>
          </div>
        </div>
      </main>

      <MascotCorner mascotSrc="/images/cookie-normal.png" message={mascotMessage}/>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] isla-anim-toast
                        flex items-center gap-2 px-5 py-3 rounded-full
                        bg-[#2BA15C] text-white border-[2.5px] border-[#0f4f2c]
                        shadow-[0_4px_0_#0f4f2c] font-Fredoka font-bold text-sm">
          <Icon name="check" className="w-[18px] h-[18px]" strokeWidth={3}/> {toast}
        </div>
      )}

      {/* Launch overlay */}
      {launching && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(14,92,138,0.92)] backdrop-blur-md isla-anim-fadein">
          <div className="bg-[#FFFDF6] border-[4px] border-[#173951] rounded-[28px] shadow-[0_6px_0_#173951]
                          p-9 sm:p-10 text-center max-w-md isla-anim-popin">
            <div className="w-[110px] h-[110px] mx-auto rounded-full isla-anim-spin"
                 style={{ border: "6px solid #FFD874", borderTopColor: "#FF8763" }}/>
            <h3 className="font-Fredoka font-bold text-[28px] sm:text-[32px] text-[#0E5C8A] mt-4 mb-1">¡Zarpamos!</h3>
            <p className="text-[#4E6B7E] font-semibold m-0">Preparando la isla para tus estudiantes…</p>
          </div>
        </div>
      )}
    </div>
  )
}
