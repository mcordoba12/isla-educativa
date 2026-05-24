import React, { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

// ─── Animaciones ─────────────────────────────────────────────────────────────
const ANIMATIONS_CSS = `
@keyframes isla-mascot-bob { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-8px) rotate(3deg); } }
@keyframes isla-speech-pop { from { transform: scale(.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes isla-toast-pop  { from { transform: translateX(-50%) translateY(20px) scale(.85); opacity: 0; } to { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; } }
@keyframes isla-card-in    { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.isla-anim-bob    { animation: isla-mascot-bob 2.6s ease-in-out infinite; transform-origin: bottom center; }
.isla-anim-speech { animation: isla-speech-pop .4s cubic-bezier(.2,1.4,.4,1); }
.isla-anim-toast  { animation: isla-toast-pop .35s cubic-bezier(.2,1.4,.4,1); }
.isla-anim-cardin { animation: isla-card-in .4s cubic-bezier(.2,1.4,.4,1) both; }
`

// ─── Iconos ──────────────────────────────────────────────────────────────────
function Icon({ name, className = "w-5 h-5", strokeWidth = 2.2 }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" }
  switch (name) {
    case "logout":   return <svg viewBox="0 0 24 24" className={className}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" {...p}/></svg>
    case "compass":  return <svg viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="9" {...p}/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" {...p}/></svg>
    case "play":     return <svg viewBox="0 0 24 24" className={className}><path d="M7 5l13 7-13 7V5z" {...p} fill="currentColor"/></svg>
    case "check":    return <svg viewBox="0 0 24 24" className={className}><path d="M5 12l5 5 9-10" {...p}/></svg>
    case "help":     return <svg viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="9" {...p}/><path d="M9.5 9a2.5 2.5 0 015 .3c0 1.7-2.5 1.7-2.5 3.7M12 17v.5" {...p}/></svg>
    case "file":     return <svg viewBox="0 0 24 24" className={className}><path d="M7 3h8l4 4v14a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" {...p}/><path d="M15 3v4h4" {...p}/></svg>
    case "clock":    return <svg viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="9" {...p}/><path d="M12 7v5l3 2" {...p}/></svg>
    case "edit":     return <svg viewBox="0 0 24 24" className={className}><path d="M4 20h4l11-11-4-4L4 16v4z" {...p}/><path d="M14 6l4 4" {...p}/></svg>
    case "copy":     return <svg viewBox="0 0 24 24" className={className}><rect x="8" y="8" width="12" height="12" rx="2" {...p}/><path d="M4 16V6a2 2 0 012-2h10" {...p}/></svg>
    case "trash":    return <svg viewBox="0 0 24 24" className={className}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" {...p}/><path d="M10 11v6M14 11v6" {...p}/></svg>
    case "calendar": return <svg viewBox="0 0 24 24" className={className}><rect x="3" y="5" width="18" height="16" rx="2" {...p}/><path d="M3 9h18M8 3v4M16 3v4" {...p}/></svg>
    case "plus":     return <svg viewBox="0 0 24 24" className={className}><path d="M12 5v14M5 12h14" {...p}/></svg>
    case "sparkle":  return <svg viewBox="0 0 24 24" className={className}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" {...p} fill="currentColor"/></svg>
    default: return null
  }
}

// ─── Fondo tropical ──────────────────────────────────────────────────────────
function TropicalScene() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none opacity-55" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
        <defs>
          <linearGradient id="ile-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7FCFEC"/>
            <stop offset="55%" stopColor="#BCEAF7"/>
            <stop offset="100%" stopColor="#E4F6FB"/>
          </linearGradient>
          <linearGradient id="ile-ocean" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4FB5E5"/>
            <stop offset="100%" stopColor="#1F8FCE"/>
          </linearGradient>
          <radialGradient id="ile-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE9A8"/>
            <stop offset="70%" stopColor="#FFD874"/>
            <stop offset="100%" stopColor="#E8B547"/>
          </radialGradient>
        </defs>

        <rect width="1440" height="900" fill="url(#ile-sky)"/>
        <g><circle cx="1180" cy="220" r="120" fill="#FFE9A8" opacity="0.55"/><circle cx="1180" cy="220" r="80" fill="url(#ile-sun)" stroke="#173951" strokeWidth="4"/>{[0,45,90,135,180,225,270,315].map((a) => (<rect key={a} x="1176" y="80" width="8" height="20" rx="3" fill="#FFD874" stroke="#173951" strokeWidth="3" transform={`rotate(${a} 1180 220)`}/>))}</g>
        <g fill="#FFFDF6" stroke="#173951" strokeWidth="3.5"><g transform="translate(180,160)"><ellipse cx="0" cy="0" rx="55" ry="22"/><ellipse cx="35" cy="-10" rx="32" ry="18"/><ellipse cx="-30" cy="-6" rx="28" ry="16"/></g><g transform="translate(720,90)"><ellipse cx="0" cy="0" rx="48" ry="20"/><ellipse cx="30" cy="-8" rx="28" ry="16"/><ellipse cx="-26" cy="-4" rx="24" ry="14"/></g><g transform="translate(420,260)"><ellipse cx="0" cy="0" rx="40" ry="16"/><ellipse cx="25" cy="-7" rx="22" ry="13"/><ellipse cx="-22" cy="-3" rx="20" ry="12"/></g></g>
        <g opacity="0.5"><ellipse cx="220" cy="640" rx="160" ry="22" fill="#1F8FCE"/><path d="M 90 640 Q 220 555 350 640 Z" fill="#5BC982" stroke="#1B7A45" strokeWidth="3"/></g>
        <path d="M 0 640 Q 360 615 720 640 T 1440 640 L 1440 900 L 0 900 Z" fill="url(#ile-ocean)"/>
        <g stroke="#FFFDF6" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"><path d="M 60 720 q 30 -10 60 0 t 60 0"/><path d="M 980 700 q 30 -10 60 0 t 60 0"/><path d="M 300 800 q 30 -10 60 0 t 60 0"/><path d="M 1180 820 q 30 -10 60 0 t 60 0"/><path d="M 700 770 q 30 -10 60 0 t 60 0"/></g>
        <g><ellipse cx="960" cy="780" rx="380" ry="40" fill="#FFD874" stroke="#173951" strokeWidth="4"/><path d="M 600 780 Q 960 660 1320 780 Z" fill="#FFE9A8" stroke="#173951" strokeWidth="4"/></g>
        <path d="M 0 870 Q 360 855 720 870 T 1440 870 L 1440 900 L 0 900 Z" fill="#FFD874" stroke="#173951" strokeWidth="3"/>
      </svg>
    </div>
  )
}

// ─── Topbar ──────────────────────────────────────────────────────────────────
function Topbar({ teacherName, initials, onLogout }) {
  return (
    <header className="relative z-20 bg-[#FFFDF6] border-b-[3px] border-[#173951] shadow-[0_4px_0_rgba(14,92,138,.12)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-7 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#1F8FCE] text-white border-[2.5px] border-[#173951]
                          shadow-[0_3px_0_#0E5C8A] grid place-items-center font-Fredoka font-bold text-[22px] flex-shrink-0">🌴</div>
          <div>
            <h1 className="font-Fredoka font-bold text-[20px] sm:text-[22px] text-[#0E5C8A] m-0 leading-none">Isla Educativa</h1>
            <p className="hidden sm:block text-[11px] font-bold tracking-[.14em] uppercase text-[#4E6B7E] mt-0.5 m-0">Panel docente</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 bg-[#FFE9A8] border-[2.5px] border-[#173951]
                          rounded-full pl-1.5 pr-4 py-1 shadow-[0_3px_0_#E8B547]">
            <span className="w-9 h-9 rounded-full bg-[#FF8763] text-white border-[2.5px] border-[#173951]
                             grid place-items-center font-Fredoka font-bold text-sm">{initials}</span>
            <span className="leading-tight">
              <span className="block font-extrabold text-[14px] text-[#173951]">{teacherName}</span>
              <span className="block text-[11px] font-bold tracking-[.1em] uppercase text-[#4E6B7E]">Docente</span>
            </span>
          </div>

          <button
            onClick={onLogout}
            className="bg-[#FFFDF6] text-[#173951] border-[2.5px] border-[#173951] rounded-full px-4 py-2
                       font-Fredoka font-bold text-[13.5px] flex items-center gap-1.5 shadow-[0_3px_0_#173951]
                       hover:bg-[#FF8763] hover:text-white hover:border-[#E85C42] hover:-translate-y-px hover:shadow-[0_4px_0_#E85C42]
                       active:translate-y-0.5 active:shadow-[0_1px_0_#173951] transition-all"
          >
            <Icon name="logout" className="w-4 h-4"/> Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  )
}

// ─── Stat ────────────────────────────────────────────────────────────────────
function Stat({ icon, iconColor, bgClass, value, label }) {
  return (
    <div className="flex items-center gap-2.5 bg-[#FFFDF6] border-[2.5px] border-[#173951]
                    rounded-2xl px-3.5 py-2.5 shadow-[0_3px_0_#173951] min-w-[110px]">
      <div className={`w-8 h-8 rounded-[10px] grid place-items-center flex-shrink-0 border-[2px] ${bgClass}`}>
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <div>
        <div className="font-Fredoka font-bold text-[20px] sm:text-[22px] text-[#173951] leading-none">{value}</div>
        <div className="mt-0.5 text-[10px] font-bold tracking-[.1em] uppercase text-[#4E6B7E]">{label}</div>
      </div>
    </div>
  )
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────
const FILTER_LABELS = { todas: "Todas", configurada: "Configuradas", iniciada: "En progreso" }
function FilterTabs({ value, onChange }) {
  return (
    <div role="tablist" className="flex gap-1.5 bg-[#F1ECDB] border-[2.5px] border-[#173951] rounded-full p-1 overflow-x-auto">
      {Object.entries(FILTER_LABELS).map(([key, label]) => (
        <button
          key={key} role="tab" aria-selected={value === key} onClick={() => onChange(key)}
          className={[
            "px-3.5 py-1.5 rounded-full font-Fredoka font-bold text-[13px] whitespace-nowrap transition-colors",
            value === key
              ? "bg-[#1F8FCE] text-white shadow-[0_2px_0_#0E5C8A]"
              : "text-[#4E6B7E] hover:text-[#173951]"
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Banner Deco ──────────────────────────────────────────────────────────────
function BannerDeco({ theme }) {
  return (
    <svg className="absolute -right-4 -top-4 opacity-40" width="140" height="120" viewBox="0 0 140 120">
      <circle cx="100" cy="20" r="22" fill="#FFE9A8"/>
      <path d="M-10 90 Q 35 70 70 90 T 150 90 L 150 130 L -10 130 Z" fill="#FFFDF6" opacity="0.6"/>
    </svg>
  )
}

const BANNER_BG = {
  configurada: "bg-gradient-to-br from-[#FFE9A8] to-[#E8B547]",
  iniciada:   "bg-gradient-to-br from-[#5BC982] to-[#2BA15C]",
  finalizada: "bg-gradient-to-br from-[#4FB5E5] to-[#1F8FCE]",
}

const STATUS_STYLE = {
  configurada: { label: "Borrador",    dot: "bg-[#E8B547]", text: "text-[#8A5A0E]" },
  iniciada:    { label: "Activa",      dot: "bg-[#2BA15C]", text: "text-[#1B7A45]" },
  finalizada:  { label: "Completada",  dot: "bg-[#1F8FCE]", text: "text-[#0E5C8A]" },
}

// ─── Icon Button ──────────────────────────────────────────────────────────────
function IconBtn({ title, onClick, children, primary = false }) {
  return (
    <button
      title={title} aria-label={title} onClick={onClick}
      className={[
        "border-[2px] border-[#173951] rounded-lg grid place-items-center cursor-pointer transition-all",
        primary
          ? "bg-[#FF8763] text-white border-[#E85C42] px-3 h-8 gap-1 font-Fredoka font-bold text-[12px] shadow-[0_2px_0_#E85C42] hover:-translate-y-px hover:shadow-[0_3px_0_#E85C42]"
          : "bg-white text-[#173951] w-8 h-8 shadow-[0_2px_0_#173951] hover:-translate-y-px hover:shadow-[0_3px_0_#173951]",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

// ─── New Session Card ────────────────────────────────────────────────────────
function NewSessionCard({ onClick }) {
  return (
    <div
      role="button" tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.() }}
      className="relative isla-anim-cardin overflow-hidden min-h-[260px] cursor-pointer
                 flex flex-col items-center justify-center gap-2 p-6 text-center
                 bg-gradient-to-br from-[#FFE9A8] to-[#FFD874]
                 border-[3px] border-dashed border-[#173951] rounded-[22px]
                 hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(232,181,71,.5)] transition-all"
    >
      <span className="absolute -top-7 -right-7 w-20 h-20 rounded-full bg-white/40"/>
      <span className="absolute -bottom-7 -left-7 w-20 h-20 rounded-full bg-white/40"/>
      <div className="relative z-10 w-20 h-20 rounded-full bg-[#FF8763] text-white border-[3px] border-[#173951]
                      shadow-[0_5px_0_#E85C42] grid place-items-center font-Fredoka font-bold text-[48px] leading-none">+</div>
      <h3 className="relative z-10 font-Fredoka font-bold text-[22px] text-[#0E5C8A] m-0 mt-2">Nueva expedición</h3>
      <p className="relative z-10 text-[13px] font-bold text-[#8A5A0E] m-0 max-w-[220px]">Configura una clase nueva en minutos</p>
    </div>
  )
}

// ─── Session Card ────────────────────────────────────────────────────────────
function SessionCard({ session, onLaunch, onEdit }) {
  return (
    <article className="bg-[#FFFDF6] border-[3px] border-[#173951] rounded-[22px] p-5
                        shadow-[0_4px_0_#173951,0_14px_30px_-10px_rgba(14,92,138,.25)] isla-anim-cardin
                        hover:-translate-y-0.5 hover:shadow-[0_7px_0_#173951,0_18px_36px_-10px_rgba(14,92,138,.3)] transition-all
                        flex flex-col gap-4">

      {/* Título y tema */}
      <div>
        <h3 className="font-Fredoka font-bold text-[20px] text-[#0E5C8A] m-0">{session.titulo}</h3>
        <p className="text-[14px] text-[#4E6B7E] font-semibold m-0 mt-1">{session.tema || 'Tema no especificado'}</p>
      </div>

      {/* Detalles */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#E4F6FB] border-[2px] border-[#1F8FCE] rounded-lg p-3">
          <p className="text-[11px] font-bold text-[#4E6B7E] uppercase mb-1">Preguntas</p>
          <p className="font-Fredoka font-bold text-[18px] text-[#0E5C8A]">{session.num_preguntas || '—'}</p>
        </div>
        <div className="bg-[#FFF0E4] border-[2px] border-[#FF8763] rounded-lg p-3">
          <p className="text-[11px] font-bold text-[#4E6B7E] uppercase mb-1">Duración</p>
          <p className="font-Fredoka font-bold text-[18px] text-[#FF8763]">{session.intervalo_minutos} min</p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-2">
        <button
          onClick={() => onLaunch?.(session)}
          className="flex-1 bg-[#1F8FCE] text-white border-[2.5px] border-[#173951] rounded-[14px]
                     px-4 py-2.5 font-Fredoka font-bold text-[14px]
                     shadow-[0_3px_0_#0E5C8A]
                     hover:-translate-y-0.5 hover:shadow-[0_5px_0_#0E5C8A]
                     active:translate-y-0.5 active:shadow-[0_1px_0_#0E5C8A] transition-all">
          <Icon name="play" className="w-4 h-4 inline mr-1"/>
          Iniciar
        </button>
        <button
          onClick={() => onEdit?.(session)}
          className="flex-1 bg-[#FFFDF6] text-[#173951] border-[2.5px] border-[#173951] rounded-[14px]
                     px-4 py-2.5 font-Fredoka font-bold text-[14px]
                     shadow-[0_3px_0_#173951]
                     hover:-translate-y-0.5 hover:shadow-[0_5px_0_#173951]
                     active:translate-y-0.5 active:shadow-[0_1px_0_#173951] transition-all">
          <Icon name="edit" className="w-4 h-4 inline mr-1"/>
          Editar
        </button>
      </div>
    </article>
  )
}

function Chip({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1.5 border-[2px] border-[#1F8FCE] rounded-full px-2.5 py-0.5
                     font-Fredoka font-bold text-[12px] bg-[#E4F6FB] text-[#0E5C8A]">
      <Icon name={icon} className="w-3 h-3"/> {text}
    </span>
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
export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [teacherName, setTeacherName] = useState("Docente")
  const [classCode, setClassCode] = useState("")
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState("expediciones")
  const [missions, setMissions] = useState([])
  const [linkedStudents, setLinkedStudents] = useState([])
  const [showStudentsList, setShowStudentsList] = useState(false)
  const [showMissionForm, setShowMissionForm] = useState(false)
  const [editingMissionId, setEditingMissionId] = useState(null)
  const [missionForm, setMissionForm] = useState({
    asignatura: "",
    tema: "",
    explicacion: "",
    reto: "",
    exito: "¡Excelente aventurero! Has protegido la isla educativa de la dispersión.",
    fallo: "La dispersión está regresando, vuelve pronto para ayudar a la isla.",
  })
  const [savingMission, setSavingMission] = useState(false)

  // Obtener nombre del docente, código de clase y sesiones
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[TeacherDashboard] Cargando datos del docente...')
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.log('[TeacherDashboard] No hay usuario autenticado')
          navigate("/")
          return
        }

        console.log('[TeacherDashboard] Usuario ID:', user.id)

        if (user.user_metadata?.nombre_completo) {
          setTeacherName(user.user_metadata.nombre_completo)
          console.log('[TeacherDashboard] Nombre:', user.user_metadata.nombre_completo)
        }

        // Obtener código de clase del docente
        console.log('[TeacherDashboard] Obteniendo código de clase...')
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("codigo_clase")
          .eq("id", user.id)
          .single()

        if (userError) {
          console.error('[TeacherDashboard] Error obteniendo código de clase:', userError)
        } else if (userData?.codigo_clase) {
          setClassCode(userData.codigo_clase)
          console.log('[TeacherDashboard] Código de clase:', userData.codigo_clase)
        }

        // Obtener sesiones del docente
        console.log('[TeacherDashboard] Obteniendo classroom_sessions...')
        const { data: sessionsData, error } = await supabase
          .from("classroom_sessions")
          .select("*")
          .eq("docente_id", user.id)
          .order("created_at", { ascending: false })

        // Cargar número de preguntas para cada sesión
        if (sessionsData && sessionsData.length > 0) {
          for (let session of sessionsData) {
            const { count } = await supabase
              .from("session_questions")
              .select("*", { count: "exact", head: true })
              .eq("session_id", session.id)
            session.num_preguntas = count || 0
          }
        }

        if (error) {
          console.error('[TeacherDashboard] Error en GET:', error)
          throw error
        }

        console.log('[TeacherDashboard] Sesiones obtenidas:', sessionsData?.length || 0)
        console.log('[TeacherDashboard] Datos:', sessionsData)
        setSessions(sessionsData || [])

        // Cargar misiones del docente
        console.log('[TeacherDashboard] Obteniendo misiones...')
        const { data: missionsData, error: missionsError } = await supabase
          .from("missions")
          .select("*")
          .eq("docente_id", user.id)
          .order("created_at", { ascending: false })

        if (missionsError) {
          console.error('[TeacherDashboard] Error obteniendo misiones:', missionsError)
        } else {
          console.log('[TeacherDashboard] Misiones obtenidas:', missionsData?.length || 0)
          setMissions(missionsData || [])
        }

        // Obtener estudiantes vinculados
        const { data: studentsData, error: studentsError } = await supabase
          .from("teacher_students")
          .select("estudiante_id")
          .eq("docente_id", user.id)
          .order("fecha_inscripcion", { ascending: false })

        if (studentsError) {
          console.error('[TeacherDashboard] Error obteniendo estudiantes:', studentsError)
        } else if (studentsData && studentsData.length > 0) {
          const studentIds = studentsData.map(ts => ts.estudiante_id)
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("id, nombre_completo")
            .in("id", studentIds)

          if (usersError) {
            console.error('[TeacherDashboard] Error obteniendo nombres:', usersError)
          } else {
            const students = usersData || []
            console.log('[TeacherDashboard] Estudiantes vinculados:', students.length)
            setLinkedStudents(students)
          }
        } else {
          setLinkedStudents([])
        }
      } catch (error) {
        console.error("[TeacherDashboard] Error cargando datos:", error)
        setToast("Error al cargar tus expediciones")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate])

  const initials = useMemo(() => (
    teacherName
      .split(" ")
      .filter((p) => p && p.length > 1)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("")
  ), [teacherName])

  const firstName = teacherName.split(" ")[0] || ""


  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate("/")
    } catch (error) {
      console.error("Error cerrando sesión:", error)
    }
  }

  const copyClassCodeToClipboard = () => {
    if (classCode) {
      navigator.clipboard.writeText(classCode)
      setToast("¡Código copiado al portapapeles! 📋")
      setTimeout(() => setToast(null), 3000)
      console.log('[TeacherDashboard] Código copiado:', classCode)
    }
  }

  const handleSaveMission = async () => {
    // Validar campos requeridos
    if (!missionForm.asignatura.trim() || !missionForm.reto.trim()) {
      setToast("Por favor completa la asignatura y el reto")
      return
    }

    setSavingMission(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No hay sesión activa")

      const missionData = {
        titulo: missionForm.asignatura.trim(),
        descripcion: missionForm.tema.trim(),
        texto_reto: missionForm.reto.trim(),
        retroalimentacion_exito: missionForm.exito.trim(),
        retroalimentacion_fallo: missionForm.fallo.trim(),
      }

      if (editingMissionId) {
        // Modo edición: UPDATE
        console.log('[TeacherDashboard] Actualizando misión:', editingMissionId)
        const { error: updateError } = await supabase
          .from("missions")
          .update(missionData)
          .eq("id", editingMissionId)

        if (updateError) throw updateError

        console.log('[TeacherDashboard] Misión actualizada exitosamente')
        setToast("¡Misión actualizada! Los cambios ya están disponibles 🌊")
      } else {
        // Modo creación: Usar RPC para publicar
        console.log('[TeacherDashboard] Publicando nueva misión con RPC...')
        const { data, error: rpcError } = await supabase.rpc('publish_mission', {
          p_titulo: missionData.titulo,
          p_descripcion: missionData.descripcion,
          p_texto_reto: missionData.texto_reto,
          p_retroalimentacion_exito: missionData.retroalimentacion_exito,
          p_retroalimentacion_fallo: missionData.retroalimentacion_fallo,
        })

        if (rpcError) throw rpcError
        if (!data.success) throw new Error(data.message)

        console.log('[TeacherDashboard] Misión publicada:', data)
        setToast("¡Misión publicada! Tus aventureros ya pueden verla en su isla 🌊")
      }

      // Limpiar formulario y recargar
      setMissionForm({
        asignatura: "",
        tema: "",
        explicacion: "",
        reto: "",
        exito: "¡Excelente aventurero! Has protegido la isla educativa de la dispersión.",
        fallo: "La dispersión está regresando, vuelve pronto para ayudar a la isla.",
      })
      setShowMissionForm(false)
      setEditingMissionId(null)

      // Recargar misiones
      const { data: missionsData } = await supabase
        .from("missions")
        .select("*")
        .eq("docente_id", user.id)
        .order("created_at", { ascending: false })
      setMissions(missionsData || [])

      setTimeout(() => setToast(null), 4000)
    } catch (error) {
      console.error('[TeacherDashboard] Error guardando misión:', error)
      setToast(error.message || "Error al guardar la misión")
      setTimeout(() => setToast(null), 3000)
    } finally {
      setSavingMission(false)
    }
  }

  const handleEditMission = (mission) => {
    console.log('[TeacherDashboard] Editando misión:', mission.id)
    setMissionForm({
      asignatura: mission.titulo,
      tema: mission.descripcion,
      explicacion: mission.descripcion, // Usar descripción como explicación
      reto: mission.texto_reto,
      exito: mission.retroalimentacion_exito,
      fallo: mission.retroalimentacion_fallo,
    })
    setEditingMissionId(mission.id)
    setShowMissionForm(true)
  }

  const handleCancelEdit = () => {
    setShowMissionForm(false)
    setEditingMissionId(null)
    setMissionForm({
      asignatura: "",
      tema: "",
      explicacion: "",
      reto: "",
      exito: "¡Excelente aventurero! Has protegido la isla educativa de la dispersión.",
      fallo: "La dispersión está regresando, vuelve pronto para ayudar a la isla.",
    })
  }

  const stats = {
    total: sessions.length,
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden font-Nunito text-[#173951]
                    bg-gradient-to-b from-[#87D5EE] via-[#E4F6FB] via-60% to-[#FFF8E7]">
      <style>{ANIMATIONS_CSS}</style>
      <TropicalScene/>
      <Topbar teacherName={teacherName} initials={initials} onLogout={handleLogout}/>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-5 sm:px-7 py-8 pb-32">
        {/* Hero */}
        <div className="flex items-end justify-between gap-6 mb-7 flex-wrap">
          <div>
            <h2 className="font-Fredoka font-bold text-[28px] sm:text-[38px] leading-none m-0 text-[#0E5C8A] tracking-tight"
                style={{ textShadow: "2px 2px 0 #FFE9A8" }}>
              ¡Hola{firstName ? `, ${firstName}` : ""}! 🌊
            </h2>
            <p className="mt-2.5 text-[14px] sm:text-[15px] font-semibold text-[#4E6B7E] max-w-xl m-0">
              Estas son tus expediciones. Crea una nueva, o inicia una lista para tus estudiantes.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Stat icon={<Icon name="compass" className="w-4 h-4"/>} iconColor="#0E5C8A"
              bgClass="bg-[#E4F6FB] border-[#1F8FCE]" value={stats.total} label="Expediciones"/>
            <Stat icon={<Icon name="help" className="w-4 h-4"/>} iconColor="#B0202D"
              bgClass="bg-[#FFE0D6] border-[#FF8763]" value={missions.length} label="Misiones"/>
            <button onClick={() => setShowStudentsList(true)}
              className="px-4 py-2 bg-[#DDF3E4] border-[2.5px] border-[#2BA15C] rounded-xl font-Fredoka font-bold text-[13px] sm:text-[14px] text-[#2BA15C] shadow-[0_3px_0_#1B7A45] hover:-translate-y-px hover:shadow-[0_4px_0_#1B7A45] active:translate-y-0.5 active:shadow-[0_1px_0_#1B7A45] transition-all cursor-pointer">
              👨‍🎓 {linkedStudents.length} estudiante{linkedStudents.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>

        {/* Código de clase */}
        {classCode && (
          <div className="mb-6 bg-[#FFFDF6] border-[3px] border-[#1F8FCE] rounded-[22px] p-5 shadow-[0_4px_0_#173951,0_14px_30px_-10px_rgba(31,143,206,.25)]">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-[12px] font-bold tracking-[.1em] uppercase text-[#4E6B7E] m-0 mb-1">Tu código de clase</p>
                <p className="font-Fredoka font-bold text-[24px] sm:text-[28px] text-[#0E5C8A] m-0 font-mono">{classCode}</p>
                <p className="mt-1.5 text-[13px] font-semibold text-[#4E6B7E] m-0">Comparte este código con tus estudiantes para que se registren 🧑‍🎓</p>
              </div>
              <button
                onClick={copyClassCodeToClipboard}
                className="bg-[#1F8FCE] text-white border-[2.5px] border-[#0E5C8A] rounded-full px-5 py-3
                           font-Fredoka font-bold text-[14px] flex items-center gap-2 shadow-[0_3px_0_#0E5C8A]
                           hover:bg-[#1873A5] hover:-translate-y-px hover:shadow-[0_4px_0_#0E5C8A]
                           active:translate-y-0.5 active:shadow-[0_1px_0_#0E5C8A] transition-all flex-shrink-0"
              >
                <Icon name="copy" className="w-4 h-4"/> Copiar
              </button>
            </div>
          </div>
        )}

        {/* Modal de estudiantes */}
        {showStudentsList && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-[#FFFDF6] border-[3px] border-[#173951] rounded-[22px] p-6 w-full max-w-[420px] shadow-[0_6px_0_#173951]">
              <h3 className="font-[Fredoka] font-bold text-[20px] text-[#173951] mb-4">Tus estudiantes</h3>
              {linkedStudents.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
                  {linkedStudents.map(student => (
                    <div key={student.id} className="bg-[#DDF3E4] border-[2px] border-[#2BA15C] rounded-lg px-4 py-3 font-semibold text-[14px] text-[#173951]">
                      👤 {student.nombre_completo}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#4E6B7E] font-semibold mb-4">Aún no hay estudiantes vinculados</p>
              )}
              <button
                onClick={() => setShowStudentsList(false)}
                className="w-full h-10 bg-[#2BA15C] text-white border-[2px] border-[#173951] rounded-lg font-[Fredoka] font-bold text-[13px] shadow-[0_2px_0_#1B7A45] hover:bg-[#23864e] transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b-[3px] border-[#173951] mb-8">
          <button
            onClick={() => {
              setActiveTab("expediciones")
              setShowMissionForm(false)
            }}
            className={`px-4 sm:px-6 py-3 font-Fredoka font-bold text-[15px] sm:text-[16px] transition-all
                       ${activeTab === "expediciones"
              ? "text-[#0E5C8A] border-b-[3px] border-[#0E5C8A] -mb-[3px]"
              : "text-[#4E6B7E] hover:text-[#173951]"}`}
          >
            Mis expediciones
          </button>
          <button
            onClick={() => {
              setActiveTab("misiones")
              setShowMissionForm(false)
            }}
            className={`px-4 sm:px-6 py-3 font-Fredoka font-bold text-[15px] sm:text-[16px] transition-all
                       ${activeTab === "misiones"
              ? "text-[#0E5C8A] border-b-[3px] border-[#0E5C8A] -mb-[3px]"
              : "text-[#4E6B7E] hover:text-[#173951]"}`}
          >
            Misiones para casa
          </button>
        </div>

        {/* Contenido: Expediciones */}
        {activeTab === "expediciones" && (
          <>
            <div className="mb-4">
              <h3 className="font-Fredoka font-bold text-[22px] sm:text-[24px] text-[#173951] m-0 flex items-center gap-2.5">
                Mis expediciones
                <span className="font-Fredoka font-bold text-[12px] bg-[#FFD874] text-[#173951]
                                 border-[2.5px] border-[#173951] rounded-full px-2.5 py-0.5 shadow-[0_2px_0_#E8B547]">
                  {stats.total}
                </span>
              </h3>
            </div>

            {/* Grid de expediciones */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4.5 sm:gap-5">
              <NewSessionCard onClick={() => navigate("/teacher/new-session")}/>

              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-[#FFFDF6] border-[3px] border-[#173951] rounded-[22px] h-[260px] animate-pulse"/>
                ))
                : sessions.length === 0
                  ? (
                    <div className="col-span-full text-center py-10 text-[#4E6B7E] font-semibold text-[14px]">
                      No hay expediciones. ¡Crea una nueva para empezar!
                    </div>
                  )
                  : sessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onLaunch={() => navigate(`/teacher/live-session/${session.id}`)}
                      onEdit={() => navigate(`/teacher/edit-session/${session.id}`)}
                    />
                  ))
              }
            </div>
          </>
        )}

        {/* Contenido: Misiones */}
        {activeTab === "misiones" && (
          <>
            <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-Fredoka font-bold text-[22px] sm:text-[24px] text-[#173951] m-0">
                  Misiones para casa
                </h3>
                <p className="text-[14px] text-[#4E6B7E] font-semibold mt-2">
                  Crea misiones para que tus estudiantes completen en casa
                </p>
              </div>
              <button
                onClick={() => {
                  if (showMissionForm) {
                    handleCancelEdit()
                  } else {
                    setShowMissionForm(true)
                    setEditingMissionId(null)
                    setMissionForm({
                      asignatura: "",
                      tema: "",
                      explicacion: "",
                      reto: "",
                      exito: "¡Excelente aventurero! Has protegido la isla educativa de la dispersión.",
                      fallo: "La dispersión está regresando, vuelve pronto para ayudar a la isla.",
                    })
                  }
                }}
                className="bg-[#2BA15C] hover:bg-[#23864e] text-white border-[2.5px] border-[#173951]
                           rounded-[20px] px-5 py-3 font-Fredoka font-bold text-[15px] sm:text-[16px]
                           shadow-[0_4px_0_#173951] active:translate-y-0.5 active:shadow-[0_1px_0_#173951]
                           transition-all"
              >
                {showMissionForm ? "Cancelar" : "+ Nueva misión"}
              </button>
            </div>

            {/* Formulario de misión */}
            {showMissionForm && (
              <div className="bg-[#FFFDF6] border-[3px] border-[#173951] rounded-[22px] p-6 mb-6 shadow-[0_4px_0_#173951,0_14px_30px_-10px_rgba(31,143,206,.25)]">
                <h4 className="font-Fredoka font-bold text-[20px] text-[#173951] mb-5">
                  {editingMissionId ? "Editar misión" : "Crear nueva misión"}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[12px] font-bold text-[#4E6B7E] block mb-2">Nombre de la asignatura</label>
                    <input
                      type="text"
                      value={missionForm.asignatura}
                      onChange={(e) => setMissionForm({...missionForm, asignatura: e.target.value})}
                      placeholder="Ej. Ciencias Naturales"
                      className="w-full h-11 rounded-lg border-[2.5px] border-[#173951] bg-[#FFFDF6] px-3
                                 font-semibold text-[14px] text-[#173951] placeholder:text-[#93A6B3] outline-none
                                 focus:border-[#1F8FCE] focus:shadow-[0_0_0_3px_rgba(31,143,206,.2)]"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-[#4E6B7E] block mb-2">Tema de la clase</label>
                    <input
                      type="text"
                      value={missionForm.tema}
                      onChange={(e) => setMissionForm({...missionForm, tema: e.target.value})}
                      placeholder="Ej. Los ecosistemas marinos"
                      className="w-full h-11 rounded-lg border-[2.5px] border-[#173951] bg-[#FFFDF6] px-3
                                 font-semibold text-[14px] text-[#173951] placeholder:text-[#93A6B3] outline-none
                                 focus:border-[#1F8FCE] focus:shadow-[0_0_0_3px_rgba(31,143,206,.2)]"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-[12px] font-bold text-[#4E6B7E] block mb-2">Breve explicación del contenido</label>
                  <textarea
                    value={missionForm.explicacion}
                    onChange={(e) => setMissionForm({...missionForm, explicacion: e.target.value})}
                    placeholder="Describe brevemente el contenido de esta lección..."
                    rows={2}
                    className="w-full rounded-lg border-[2.5px] border-[#173951] bg-[#FFFDF6] px-3 py-2
                               font-semibold text-[14px] text-[#173951] placeholder:text-[#93A6B3] outline-none
                               focus:border-[#1F8FCE] focus:shadow-[0_0_0_3px_rgba(31,143,206,.2)] resize-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-[12px] font-bold text-[#4E6B7E] block mb-2">Pregunta o reto para estudiantes *</label>
                  <textarea
                    value={missionForm.reto}
                    onChange={(e) => setMissionForm({...missionForm, reto: e.target.value})}
                    placeholder="¿Qué deben responder o hacer los estudiantes?"
                    rows={2}
                    className="w-full rounded-lg border-[2.5px] border-[#173951] bg-[#FFFDF6] px-3 py-2
                               font-semibold text-[14px] text-[#173951] placeholder:text-[#93A6B3] outline-none
                               focus:border-[#1F8FCE] focus:shadow-[0_0_0_3px_rgba(31,143,206,.2)] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[12px] font-bold text-[#4E6B7E] block mb-2">Mensaje si completa la actividad ✅</label>
                    <textarea
                      value={missionForm.exito}
                      onChange={(e) => setMissionForm({...missionForm, exito: e.target.value})}
                      placeholder="¡Excelente aventurero! Has protegido la isla educativa de la dispersión."
                      rows={2}
                      className="w-full rounded-lg border-[2.5px] border-[#2BA15C] bg-[#DDF3E4] px-3 py-2
                                 font-semibold text-[13px] text-[#1B7A45] placeholder:text-[#5BC982] outline-none
                                 focus:border-[#2BA15C] focus:shadow-[0_0_0_3px_rgba(43,161,92,.2)] resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-[#4E6B7E] block mb-2">Mensaje si no completa ⏳</label>
                    <textarea
                      value={missionForm.fallo}
                      onChange={(e) => setMissionForm({...missionForm, fallo: e.target.value})}
                      placeholder="La dispersión está regresando, vuelve pronto para ayudar a la isla."
                      rows={2}
                      className="w-full rounded-lg border-[2.5px] border-[#FF8763] bg-[#FFE0D6] px-3 py-2
                                 font-semibold text-[13px] text-[#E85C42] placeholder:text-[#FFB199] outline-none
                                 focus:border-[#FF8763] focus:shadow-[0_0_0_3px_rgba(255,135,99,.2)] resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-3 bg-[#E4F6FB] text-[#1F8FCE] border-[2.5px] border-[#173951]
                               rounded-lg font-Fredoka font-bold text-[14px] hover:bg-[#D4ECFB] transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={savingMission || !missionForm.asignatura.trim() || !missionForm.reto.trim()}
                    onClick={handleSaveMission}
                    className="px-6 py-3 bg-[#2BA15C] text-white border-[2.5px] border-[#173951]
                               rounded-lg font-Fredoka font-bold text-[14px] shadow-[0_3px_0_#173951]
                               hover:bg-[#23864e] hover:-translate-y-px hover:shadow-[0_4px_0_#173951]
                               active:translate-y-0.5 active:shadow-[0_1px_0_#173951] transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingMission
                      ? editingMissionId ? "Guardando..." : "Publicando..."
                      : editingMissionId ? "Guardar cambios" : "Publicar misión"}
                  </button>
                </div>
              </div>
            )}

            {/* Lista de misiones */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-[#FFFDF6] border-[3px] border-[#173951] rounded-[22px] h-[180px] animate-pulse"/>
                ))}
              </div>
            ) : missions.length === 0 ? (
              <div className="text-center py-12 text-[#4E6B7E]">
                <p className="text-[15px] font-semibold mb-2">No hay misiones publicadas aún</p>
                <p className="text-[13px]">Crea una misión para que tus estudiantes la completen en casa</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {missions.map((mission) => (
                  <div key={mission.id} className="bg-[#FFFDF6] border-[3px] border-[#173951] rounded-[22px] p-4 shadow-[0_4px_0_#173951] flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-Fredoka font-bold text-[16px] text-[#173951] flex-1">{mission.titulo}</h4>
                      <span className={`text-[11px] font-Fredoka font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0
                                       ${mission.estado === 'activa'
                        ? 'bg-[#DDF3E4] text-[#1B7A45] border-[1.5px] border-[#2BA15C]'
                        : 'bg-[#FFE0D6] text-[#E85C42] border-[1.5px] border-[#FF8763]'}`}>
                        {mission.estado === 'activa' ? 'Activa' : 'Archivada'}
                      </span>
                    </div>

                    {mission.descripcion && (
                      <p className="text-[13px] text-[#4E6B7E] mb-2">{mission.descripcion}</p>
                    )}

                    <p className="text-[12px] font-semibold text-[#173951] mb-3 flex-1 line-clamp-2">{mission.texto_reto}</p>

                    <button
                      onClick={() => handleEditMission(mission)}
                      className="w-full py-2.5 bg-[#1F8FCE] hover:bg-[#1873A5] text-white border-[2.5px] border-[#173951]
                                 rounded-lg font-Fredoka font-bold text-[13px] shadow-[0_2px_0_#173951]
                                 active:translate-y-0.5 active:shadow-[0_0.5px_0_#173951] transition-all"
                    >
                      ✏️ Editar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <MascotCorner mascotSrc="/images/cookie-normal.png"
        message={sessions.length === 0 ? "¡Vamos a crear tu primera expedición! 🌴" : `Tienes ${sessions.length} expedición${sessions.length > 1 ? "es" : ""} 🧭`}/>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] isla-anim-toast
                        flex items-center gap-2 px-5 py-3 rounded-full
                        bg-[#E85C42] text-white border-[2.5px] border-[#C84B35]
                        shadow-[0_4px_0_#C84B35] font-Fredoka font-bold text-sm">
          {toast}
        </div>
      )}
    </div>
  )
}
