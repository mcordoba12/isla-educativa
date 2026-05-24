// IslaEducativaEstudiante.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Pantalla principal del estudiante para "Isla Educativa" — React + Tailwind CSS.
//
// 100% self-contained: animaciones, fondo tropical SVG inline, tarjetas de
// misiones, modal de respuesta y retroalimentación del personaje.
//
// Requisitos:
//   • React 18+
//   • Tailwind CSS 3+
//   • Fuentes Google: Fredoka (500/600/700) + Nunito (500/600/700/800/900)
//     <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@500;600;700;800;900&display=swap" rel="stylesheet"/>
//
// Uso (con Supabase):
//
//   import IslaEducativaEstudiante from "./IslaEducativaEstudiante";
//
//   <IslaEducativaEstudiante
//     studentName="Tomás Quintero"
//     mascotNormal="/images/cookie-normal.png"
//     mascotCelebra="/images/cookie-celebra.png"
//     mascotTriste="/images/cookie-triste.png"
//     missions={[
//       {
//         id: "uuid",
//         subject: "Biología",
//         topic: "La célula",
//         descripcion: "Breve explicación del tema",
//         texto_reto: "¿Qué función cumple la mitocondria?",
//         retroalimentacion_exito: "¡Excelente aventurero!...",
//         retroalimentacion_fallo: "La dispersión está regresando...",
//         completada: false
//       }
//     ]}
//     onAnswer={async ({ misionId, respuesta }) => {
//       await supabase.from('student_missions').upsert({
//         estudiante_id: user.id,
//         mision_id: misionId,
//         respuesta_estudiante: respuesta,
//         estado: 'completada',
//         fecha_completacion: new Date().toISOString()
//       });
//     }}
//     onLogout={async () => {
//       await supabase.auth.signOut();
//       navigate('/');
//     }}
//   />
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";

// ─── Animaciones CSS internas ────────────────────────────────────────────────
const ANIMATIONS_CSS = `
@keyframes isla-bob {
  0%,100% { transform: translateX(-50%) translateY(0) rotate(-2deg); }
  50%     { transform: translateX(-50%) translateY(-8px) rotate(2deg); }
}
@keyframes isla-heartbeat {
  0%,90%,100% { transform: scale(1); }
  8%,24%      { transform: scale(1.15); }
}
@keyframes isla-sticker {
  0%,100% { transform: rotate(8deg); }
  50%     { transform: rotate(-4deg); }
}
@keyframes isla-pop {
  from { transform: translateX(-50%) translateY(20px) scale(.85); opacity: 0; }
  to   { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
}
@keyframes isla-modal-in {
  from { transform: translateY(30px) scale(.96); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes isla-celebrate {
  0%,100% { transform: translateY(0) scale(1) rotate(-2deg); }
  30%     { transform: translateY(-18px) scale(1.08) rotate(3deg); }
  60%     { transform: translateY(-10px) scale(1.05) rotate(-2deg); }
}
@keyframes isla-sad {
  0%,100% { transform: translateY(0) rotate(-3deg) scale(.96); }
  50%     { transform: translateY(4px) rotate(-3deg) scale(.94); }
}
@keyframes isla-confetti {
  0%   { transform: translateY(-40px) rotate(0); opacity: 0; }
  8%   { opacity: 1; }
  100% { transform: translateY(100vh) rotate(540deg); opacity: .8; }
}
.isla-bob       { animation: isla-bob 3.2s ease-in-out infinite; transform-origin: bottom center; }
.isla-celebrate { animation: isla-celebrate .6s cubic-bezier(.2,1.5,.4,1) infinite; }
.isla-sad       { animation: isla-sad 5s ease-in-out infinite; }
.isla-heartbeat { animation: isla-heartbeat 1.8s ease-in-out infinite; }
.isla-sticker   { animation: isla-sticker 3s ease-in-out infinite; }
.isla-pop       { animation: isla-pop .35s cubic-bezier(.2,1.4,.4,1); }
.isla-modal-in  { animation: isla-modal-in .4s cubic-bezier(.2,1.4,.4,1); }
.isla-confetti  { animation: isla-confetti linear forwards; }
`;

// ─── Colores por asignatura ──────────────────────────────────────────────────
const SUBJ_COLORS = {
  bio:  { band: "from-[#5BC982] to-[#2BA15C]",  text: "text-white" },
  mate: { band: "from-[#FFB199] to-[#FF8763]",  text: "text-white" },
  leng: { band: "from-[#B9A5F2] to-[#7A5AE0]",  text: "text-white" },
  soc:  { band: "from-[#FFE9A8] to-[#E8B547]",  text: "text-[#173951]" },
  ing:  { band: "from-[#4FB5E5] to-[#1F8FCE]",  text: "text-white" },
  fis:  { band: "from-[#FF9DCB] to-[#FF6FB5]",  text: "text-white" },
  default: { band: "from-[#4FB5E5] to-[#1F8FCE]", text: "text-white" },
};

function getSubjKey(subject = "") {
  const s = subject.toLowerCase();
  if (s.includes("bio")) return "bio";
  if (s.includes("mat")) return "mate";
  if (s.includes("len") || s.includes("esp")) return "leng";
  if (s.includes("soc") || s.includes("his")) return "soc";
  if (s.includes("ing")) return "ing";
  if (s.includes("fis") || s.includes("quim")) return "fis";
  return "default";
}

function getSubjEmoji(subject = "") {
  const s = subject.toLowerCase();
  if (s.includes("bio")) return "🌱";
  if (s.includes("mat")) return "➗";
  if (s.includes("len") || s.includes("esp")) return "📖";
  if (s.includes("soc") || s.includes("his")) return "🌎";
  if (s.includes("ing")) return "🗣️";
  if (s.includes("fis") || s.includes("quim")) return "⚗️";
  return "📚";
}

// ─── Iconos ──────────────────────────────────────────────────────────────────
function Icon({ name, className = "w-5 h-5", strokeWidth = 2.2 }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "logout":  return <svg viewBox="0 0 24 24" className={className}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" {...p}/></svg>;
    case "play":    return <svg viewBox="0 0 24 24" className={className}><path d="M7 5l13 7-13 7V5z" {...p} fill="currentColor"/></svg>;
    case "send":    return <svg viewBox="0 0 24 24" className={className}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" {...p}/></svg>;
    case "check":   return <svg viewBox="0 0 24 24" className={className}><path d="M5 12l5 5 9-10" {...p}/></svg>;
    case "sparkle": return <svg viewBox="0 0 24 24" className={className}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" {...p} fill="currentColor"/></svg>;
    case "compass": return <svg viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="9" {...p}/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" {...p}/></svg>;
    case "close":   return <svg viewBox="0 0 24 24" className={className}><path d="M6 6l12 12M18 6L6 18" {...p}/></svg>;
    case "trophy":  return <svg viewBox="0 0 24 24" className={className}><path d="M7 4h10v4a5 5 0 01-10 0V4z" {...p}/><path d="M5 4H3v2a3 3 0 003 3M19 4h2v2a3 3 0 01-3 3M9 14h6l1 5H8l1-5z" {...p}/></svg>;
    case "heart":   return <svg viewBox="0 0 24 24" className={className}><path d="M12 21s-7-4.5-9-9.5C2 7.5 5 4.5 8 5c2 .3 3 1.5 4 3 1-1.5 2-2.7 4-3 3-.5 6 2.5 5 6.5-2 5-9 9.5-9 9.5z" {...p}/></svg>;
    default: return null;
  }
}

// ─── Fondo tropical (hero de la isla) ────────────────────────────────────────
function HeroIsland() {
  return (
    <svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <defs>
        <radialGradient id="ies-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF3C2"/>
          <stop offset="65%" stopColor="#FFD874"/>
          <stop offset="100%" stopColor="#E8B547"/>
        </radialGradient>
        <linearGradient id="ies-ocean" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#4FB5E5"/>
          <stop offset="100%" stopColor="#1F8FCE"/>
        </linearGradient>
        <linearGradient id="ies-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#74CFEE"/>
          <stop offset="100%" stopColor="#BCEAF7"/>
        </linearGradient>
      </defs>

      {/* Cielo */}
      <rect width="800" height="360" fill="url(#ies-sky)"/>

      {/* Sol con sonrisa */}
      <g>
        <circle cx="640" cy="80" r="80" fill="#FFE9A8" opacity="0.5"/>
        {[0,45,90,135,180,225,270,315].map((a,i) => (
          <rect key={i} x="636" y="0" width="8" height="16" rx="3"
            fill="#FFD874" stroke="#173951" strokeWidth="3"
            transform={`rotate(${a} 640 80)`}/>
        ))}
        <circle cx="640" cy="80" r="56" fill="url(#ies-sun)" stroke="#173951" strokeWidth="4"/>
        <ellipse cx="624" cy="72" rx="4" ry="6" fill="#173951"/>
        <ellipse cx="656" cy="72" rx="4" ry="6" fill="#173951"/>
        <circle cx="614" cy="90" r="6" fill="#FF8763" opacity="0.5"/>
        <circle cx="666" cy="90" r="6" fill="#FF8763" opacity="0.5"/>
        <path d="M 622 92 q 18 16 36 0" stroke="#173951" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </g>

      {/* Nubes */}
      <g fill="#FFFDF6" stroke="#173951" strokeWidth="3.5">
        <g transform="translate(120,80)">
          <ellipse cx="0" cy="0" rx="40" ry="16"/>
          <ellipse cx="24" cy="-10" rx="22" ry="14"/>
          <ellipse cx="-22" cy="-6" rx="20" ry="12"/>
        </g>
        <g transform="translate(360,40)">
          <ellipse cx="0" cy="0" rx="34" ry="12"/>
          <ellipse cx="22" cy="-8" rx="20" ry="10"/>
        </g>
      </g>

      {/* Mar */}
      <path d="M 0 230 Q 200 215 400 230 T 800 230 L 800 360 L 0 360 Z" fill="url(#ies-ocean)"/>

      {/* Olas */}
      <g stroke="#FFFDF6" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.65">
        <path d="M 30 260 q 24 -10 48 0 t 48 0"/>
        <path d="M 540 252 q 24 -10 48 0 t 48 0"/>
        <path d="M 220 290 q 24 -10 48 0 t 48 0"/>
        <path d="M 660 300 q 24 -10 48 0 t 48 0"/>
      </g>

      {/* Isla lejana */}
      <g opacity="0.55" transform="translate(640,220)">
        <ellipse cx="0" cy="0" rx="90" ry="12" fill="#1F8FCE"/>
        <path d="M -70 0 Q 0 -50 70 0 Z" fill="#5BC982" stroke="#1B7A45" strokeWidth="3"/>
      </g>

      {/* Arena */}
      <g>
        <ellipse cx="380" cy="320" rx="280" ry="30" fill="#FFD874" stroke="#173951" strokeWidth="4"/>
        <path d="M 130 320 Q 380 220 630 320 Z" fill="#FFE9A8" stroke="#173951" strokeWidth="4"/>
      </g>

      {/* Palmera izquierda */}
      <g transform="translate(190,265)">
        <path d="M 0 0 Q -6 -50 8 -100" stroke="#7B4B2A" strokeWidth="11" fill="none" strokeLinecap="round"/>
        <g transform="translate(8,-100)">
          {["M 0 0 Q 44 -16 76 8 Q 44 -4 0 5 Z","M 0 0 Q -44 -16 -76 8 Q -44 -4 0 5 Z","M 0 0 Q 22 -44 56 -66 Q 16 -38 0 -8 Z","M 0 0 Q -22 -44 -56 -66 Q -16 -38 0 -8 Z","M 0 0 Q 56 8 84 40 Q 44 18 0 10 Z","M 0 0 Q -56 8 -84 40 Q -44 18 0 10 Z"].map((d,i)=>(
            <path key={i} d={d} fill="#2BA15C" stroke="#1B7A45" strokeWidth="2.5" strokeLinejoin="round"/>
          ))}
          <circle cx="0" cy="0" r="6" fill="#1B7A45"/>
          <circle cx="-6" cy="6" r="4.5" fill="#7B4B2A" stroke="#5C3618" strokeWidth="2"/>
          <circle cx="6" cy="8" r="4.5" fill="#7B4B2A" stroke="#5C3618" strokeWidth="2"/>
        </g>
      </g>

      {/* Palmera derecha */}
      <g transform="translate(540,265)">
        <path d="M 0 0 Q 6 -56 -8 -110" stroke="#7B4B2A" strokeWidth="11" fill="none" strokeLinecap="round"/>
        <g transform="translate(-8,-110)">
          {["M 0 0 Q 44 -16 76 8 Q 44 -4 0 5 Z","M 0 0 Q -44 -16 -76 8 Q -44 -4 0 5 Z","M 0 0 Q 22 -44 56 -66 Q 16 -38 0 -8 Z","M 0 0 Q -22 -44 -56 -66 Q -16 -38 0 -8 Z","M 0 0 Q 56 8 84 40 Q 44 18 0 10 Z","M 0 0 Q -56 8 -84 40 Q -44 18 0 10 Z"].map((d,i)=>(
            <path key={i} d={d} fill="#5BC982" stroke="#1B7A45" strokeWidth="2.5" strokeLinejoin="round"/>
          ))}
          <circle cx="0" cy="0" r="6" fill="#1B7A45"/>
        </g>
      </g>

      {/* Velero */}
      <g transform="translate(120,250)">
        <path d="M -20 0 L 20 0 L 14 10 L -14 10 Z" fill="#FFFDF6" stroke="#173951" strokeWidth="3"/>
        <path d="M 0 -28 L 0 0 L 16 0 Z" fill="#FF8763" stroke="#173951" strokeWidth="3"/>
        <line x1="0" y1="-28" x2="0" y2="0" stroke="#173951" strokeWidth="2"/>
      </g>
    </svg>
  );
}

// ─── Confeti ─────────────────────────────────────────────────────────────────
function Confetti() {
  const pieces = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ["#FF8763","#FFD874","#5BC982","#4FB5E5","#B9A5F2","#FF6FB5","#FFFDF6"][i % 7],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 1.2,
      duration: 2 + Math.random() * 2,
      shape: i % 3,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="isla-confetti absolute"
          style={{
            left: `${p.x}%`,
            top: 0,
            width: p.size,
            height: p.shape === 0 ? p.size : p.size * 1.6,
            borderRadius: p.shape === 2 ? "50%" : p.shape === 1 ? "2px" : "50%",
            background: p.color,
            border: "1.5px solid #173951",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Modal de respuesta ───────────────────────────────────────────────────────
function MissionModal({ mission, mascotNormal, mascotCelebra, mascotTriste, onAnswer, onClose }) {
  const [step, setStep] = useState("reto"); // reto | answering | feedback
  const [answer, setAnswer] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      await onAnswer({ misionId: mission.id, respuesta: answer.trim() });
      setSuccess(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    } catch (e) {
      setSuccess(false);
    } finally {
      setLoading(false);
      setStep("feedback");
    }
  };

  const handleCloseWithoutAnswer = () => {
    setStep("feedback");
    setSuccess(false);
  };

  const mascotSrc = step === "feedback"
    ? (success ? mascotCelebra : mascotTriste)
    : mascotNormal;

  const mascotAnim = step === "feedback"
    ? (success ? "isla-celebrate" : "isla-sad")
    : "isla-bob";

  return (
    <>
      {showConfetti && <Confetti/>}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
           style={{ background: "rgba(14,92,138,0.55)", backdropFilter: "blur(4px)" }}>
        <div className="isla-modal-in bg-[#FFFDF6] border-[3px] border-[#173951] rounded-[28px]
                        shadow-[0_8px_0_#173951,0_24px_50px_-8px_rgba(14,92,138,.5)]
                        w-full max-w-[560px] overflow-hidden">

          {/* Header del modal */}
          <div className={`bg-gradient-to-r ${SUBJ_COLORS[getSubjKey(mission.subject)]?.band || "from-[#4FB5E5] to-[#1F8FCE]"}
                          border-b-[3px] border-[#173951] p-5 flex items-center gap-4`}>
            <div className="w-12 h-12 bg-white border-[2.5px] border-[#173951] rounded-2xl
                            flex items-center justify-center text-2xl shadow-[0_3px_0_rgba(0,0,0,.15)] flex-shrink-0">
              {getSubjEmoji(mission.subject)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[11px] font-extrabold uppercase tracking-[.14em] opacity-80 m-0
                            ${SUBJ_COLORS[getSubjKey(mission.subject)]?.text || "text-white"}`}>
                {mission.subject}
              </p>
              <p className={`font-[Fredoka] font-bold text-[18px] leading-tight m-0 truncate
                            ${SUBJ_COLORS[getSubjKey(mission.subject)]?.text || "text-white"}`}>
                {mission.topic}
              </p>
            </div>
            <button onClick={step === "feedback" ? onClose : handleCloseWithoutAnswer}
              className="w-9 h-9 bg-white border-[2.5px] border-[#173951] rounded-full
                         flex items-center justify-center text-[#173951] hover:bg-[#FF8763]
                         hover:text-white transition-colors shadow-[0_2px_0_#173951] flex-shrink-0">
              <Icon name="close" className="w-4 h-4"/>
            </button>
          </div>

          {/* Mascota */}
          <div className="flex justify-center items-center py-6 min-h-[220px] sm:min-h-[280px]">
            <img
              src={mascotSrc}
              alt="Come Dispersión"
              className={`w-40 h-40 sm:w-52 sm:h-52 object-contain drop-shadow-lg ${mascotAnim}`}
              style={{ transformOrigin: "bottom center" }}
            />
          </div>

          <div className="px-6 pb-6 flex flex-col gap-4">

            {/* PASO: Reto */}
            {step === "reto" && (
              <>
                {mission.descripcion && (
                  <div className="bg-[#E4F6FB] border-[2.5px] border-[#1F8FCE] rounded-2xl p-4">
                    <p className="text-[12px] font-extrabold uppercase tracking-[.1em] text-[#1F8FCE] m-0 mb-1">
                      Contexto
                    </p>
                    <p className="text-[14px] font-semibold text-[#0E5C8A] m-0 leading-relaxed">
                      {mission.descripcion}
                    </p>
                  </div>
                )}

                <div className="bg-[#FFF8E7] border-[2.5px] border-[#173951] rounded-2xl p-4 relative">
                  <span className="absolute left-3 -top-3 bg-[#FFD874] text-[#173951] border-[2px] border-[#173951]
                                   rounded-full px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-[.1em]
                                   shadow-[0_2px_0_#E8B547]">
                    Reto del profe
                  </span>
                  <p className="font-[Fredoka] font-bold text-[#173951] text-[17px] leading-snug m-0 mt-2">
                    {mission.texto_reto}
                  </p>
                </div>

                <button onClick={() => setStep("answering")}
                  className="h-[56px] rounded-2xl border-[3px] border-[#173951] bg-[#FF8763] text-white
                             font-[Fredoka] font-bold text-[18px] flex items-center justify-center gap-2
                             shadow-[0_4px_0_#E85C42] hover:-translate-y-px hover:shadow-[0_5px_0_#E85C42]
                             active:translate-y-[2px] active:shadow-[0_2px_0_#E85C42] transition-all">
                  <Icon name="compass" className="w-5 h-5"/> ¡Aceptar misión!
                </button>
              </>
            )}

            {/* PASO: Responder */}
            {step === "answering" && (
              <>
                <p className="font-[Fredoka] font-bold text-[#173951] text-[18px] m-0">
                  ✍️ Escribe tu respuesta, aventurero:
                </p>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Tu respuesta aquí..."
                  rows={4}
                  className="w-full rounded-2xl border-[2.5px] border-[#173951] bg-[#FFFDF6]
                             p-4 font-semibold text-[16px] text-[#173951] resize-none outline-none
                             focus:border-[#1F8FCE] focus:shadow-[0_0_0_4px_rgba(31,143,206,.2)]
                             transition-[box-shadow,border-color] placeholder:text-[#93A6B3]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setStep("reto")}
                    className="h-[52px] rounded-2xl border-[2.5px] border-[#173951] bg-white text-[#173951]
                               font-[Fredoka] font-bold text-[16px] flex items-center justify-center gap-2
                               shadow-[0_3px_0_#173951] hover:-translate-y-px hover:bg-[#F4F0E0]
                               active:translate-y-[2px] transition-all">
                    Volver
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || loading}
                    className="h-[52px] rounded-2xl border-[2.5px] border-[#173951] bg-[#2BA15C] text-white
                               font-[Fredoka] font-bold text-[16px] flex items-center justify-center gap-2
                               shadow-[0_3px_0_#1B7A45] hover:-translate-y-px disabled:opacity-50
                               disabled:cursor-not-allowed active:translate-y-[2px] transition-all">
                    {loading ? "Enviando..." : <><Icon name="send" className="w-4 h-4"/> Enviar</>}
                  </button>
                </div>
              </>
            )}

            {/* PASO: Retroalimentación */}
            {step === "feedback" && (
              <>
                <div className={`rounded-2xl border-[3px] p-5 text-center
                                ${success
                                  ? "bg-[#E8FFF0] border-[#1B7A45]"
                                  : "bg-[#FFF0EE] border-[#E85C42]"}`}>
                  <p className="font-[Fredoka] font-bold text-[22px] text-[#173951] m-0 leading-snug">
                    {success
                      ? (mission.retroalimentacion_exito || "¡Excelente aventurero! Has protegido la isla educativa de la dispersión.")
                      : (mission.retroalimentacion_fallo || "La dispersión está regresando, vuelve pronto para ayudar a la isla.")}
                  </p>
                </div>
                <button onClick={onClose}
                  className="h-[56px] rounded-2xl border-[3px] border-[#173951]
                             font-[Fredoka] font-bold text-[18px] flex items-center justify-center gap-2
                             transition-all shadow-[0_4px_0_#173951] hover:-translate-y-px
                             active:translate-y-[2px] active:shadow-[0_2px_0_#173951]
                             bg-[#FFD874] text-[#173951] hover:bg-[#FFE9A8]">
                  <Icon name="compass" className="w-5 h-5"/> Continuar aventura
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Tarjeta de misión ────────────────────────────────────────────────────────
function MissionCard({ mission, onStart, onAnswer }) {
  const subjKey = getSubjKey(mission.subject);
  const colors = SUBJ_COLORS[subjKey] || SUBJ_COLORS.default;
  const emoji = getSubjEmoji(mission.subject);
  const isNew = !mission.completada && mission.isNew;
  const done = mission.completada;

  return (
    <article className="bg-[#FFFDF6] border-[3px] border-[#173951] rounded-[22px] overflow-hidden
                        shadow-[0_5px_0_#173951,0_16px_30px_-10px_rgba(14,92,138,.25)]
                        flex flex-col transition-transform hover:-translate-y-1 relative">
      {isNew && (
        <span className="isla-sticker absolute top-3 right-3 z-10 bg-[#FF8763] text-white
                         border-[2.5px] border-[#173951] rounded-full px-3 py-0.5
                         font-[Fredoka] font-extrabold text-[11px] uppercase tracking-[.14em]
                         shadow-[0_2px_0_#E85C42]">
          ¡Nuevo!
        </span>
      )}
      {done && (
        <span className="absolute top-3 right-3 z-10 bg-[#2BA15C] text-white
                         border-[2.5px] border-[#173951] rounded-full px-3 py-0.5
                         font-[Fredoka] font-extrabold text-[11px] uppercase tracking-[.14em]
                         shadow-[0_2px_0_#1B7A45] flex items-center gap-1">
          <Icon name="check" className="w-3 h-3"/> Completada
        </span>
      )}

      {/* Band de asignatura */}
      <div className={`bg-gradient-to-r ${colors.band} border-b-[3px] border-[#173951]
                       px-4 py-3 flex items-center gap-3`}>
        <div className="w-12 h-12 bg-white border-[2.5px] border-[#173951] rounded-[14px]
                        flex items-center justify-center text-2xl shadow-[0_2px_0_rgba(0,0,0,.15)]
                        flex-shrink-0">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          {mission.docenteBadge && (
            <p className={`text-[9px] font-bold uppercase tracking-[.12em] opacity-90 m-0 ${colors.text}`}>
              👨‍🏫 {mission.docenteBadge}
            </p>
          )}
          <p className={`text-[11px] font-extrabold uppercase tracking-[.14em] opacity-80 m-0 ${colors.text}`}>
            Asignatura
          </p>
          <p className={`font-[Fredoka] font-bold text-[18px] m-0 leading-tight ${colors.text}`}>
            {mission.subject}
          </p>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h4 className="font-[Fredoka] font-bold text-[24px] text-[#173951] m-0 leading-tight">
          {mission.topic}
        </h4>

        <div className="bg-[#E4F6FB] border-[2.5px] border-[#1F8FCE] rounded-[14px]
                        p-3 pl-9 relative text-[16px] font-semibold text-[#0E5C8A] leading-snug">
          <span className="absolute left-2 -top-1 font-[Fredoka] text-[42px] font-bold text-[#1F8FCE] leading-none">
            "
          </span>
          <span className="inline-block bg-[#1F8FCE] text-white text-[10px] font-extrabold
                           uppercase tracking-[.12em] px-2 py-0.5 rounded-full border border-[#173951] mb-1">
            Reto del profe
          </span>
          <br/>
          {mission.texto_reto}
        </div>
      </div>

      {/* Footer con botones */}
      <div className="border-t-[2px] border-dashed border-[#ECE2C8] bg-[#FAF6E8]
                      p-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => onStart(mission)}
          disabled={done}
          className="h-[48px] rounded-[14px] border-[2.5px] border-[#173951] bg-[#FF8763] text-white
                     font-[Fredoka] font-bold text-[15px] flex items-center justify-center gap-1.5
                     shadow-[0_4px_0_#E85C42] hover:-translate-y-px hover:shadow-[0_5px_0_#E85C42]
                     active:translate-y-[2px] active:shadow-[0_2px_0_#E85C42] transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
          <Icon name="compass" className="w-4 h-4"/>
          {done ? "Completada" : "Iniciar misión"}
        </button>
        <button
          onClick={() => onAnswer(mission)}
          disabled={done}
          className="h-[48px] rounded-[14px] border-[2.5px] border-[#173951] bg-white text-[#173951]
                     font-[Fredoka] font-bold text-[15px] flex items-center justify-center gap-1.5
                     shadow-[0_4px_0_#173951] hover:-translate-y-px hover:bg-[#F4F0E0]
                     active:translate-y-[2px] active:shadow-[0_2px_0_#173951] transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
          <Icon name="send" className="w-4 h-4"/>
          Responder reto
        </button>
      </div>
    </article>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function IslaEducativaEstudiante({
  studentName = "Aventurero",
  mascotNormal = "/images/cookie-normal.png",
  mascotCelebra = "/images/cookie-celebra.png",
  mascotTriste = "/images/cookie-triste.png",
  missions = [],
  onAnswer,
  onLogout,
  onJoinClick,
  linkedTeachersCount = 0,
  onTeachersClick,
}) {
  const [activeMission, setActiveMission] = useState(null);
  const [toast, setToast] = useState(null);
  const [localMissions, setLocalMissions] = useState(missions);

  const firstName = (studentName || "").split(" ")[0] || "Aventurer@";
  const initials = useMemo(() => {
    return (studentName || "").split(" ").filter(Boolean).slice(0, 2)
      .map(p => p[0].toUpperCase()).join("");
  }, [studentName]);

  const completed = localMissions.filter(m => m.completada).length;
  const pending = localMissions.filter(m => !m.completada).length;
  const islandHearts = Math.min(5, Math.max(0, completed));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleStart = (mission) => {
    setActiveMission(mission);
  };

  const handleAnswer = async ({ misionId, respuesta }) => {
    await onAnswer?.({ misionId, respuesta });
    setLocalMissions(prev =>
      prev.map(m => m.id === misionId ? { ...m, completada: true } : m)
    );
    showToast("¡Misión completada, aventurero! 🌴");
  };

  const handleClose = () => {
    setActiveMission(null);
  };

  return (
    <div className="relative min-h-screen font-[Nunito] text-[#173951]"
         style={{ background: "linear-gradient(180deg,#87D5EE 0%,#BCEAF7 25%,#E4F6FB 55%,#FFF8E7 100%)" }}>
      <style>{ANIMATIONS_CSS}</style>

      {/* TOP BAR */}
      <header className="sticky top-0 z-30 bg-[#FFFDF6]/95 backdrop-blur-sm
                         border-b-[3px] border-[#173951] px-6 py-3
                         flex items-center justify-between gap-4
                         shadow-[0_4px_0_rgba(14,92,138,.08)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-[13px] bg-[#1F8FCE] text-white border-[2.5px] border-[#173951]
                          shadow-[0_3px_0_#0E5C8A] grid place-items-center font-[Fredoka] text-2xl flex-shrink-0">
            🌴
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[.14em] text-[#FF8763] m-0">
              ¡Hola, aventurer@!
            </p>
            <p className="font-[Fredoka] font-bold text-[20px] text-[#173951] m-0 leading-tight truncate">
              {firstName} 🌊
            </p>
          </div>
        </div>

        {/* Vida de la isla */}
        <div className="hidden sm:flex items-center gap-1.5 bg-white border-[2.5px] border-[#173951]
                        rounded-full px-3 py-1.5 shadow-[0_3px_0_#173951]">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 24 24" className={`w-5 h-5 ${i < islandHearts ? "isla-heartbeat text-[#FF8763]" : "text-[#E5DCC0]"}`}
                 style={{ animationDelay: `${i * 0.2}s` }}>
              <path d="M12 21s-7-4.5-9-9.5C2 7.5 5 4.5 8 5c2 .3 3 1.5 4 3 1-1.5 2-2.7 4-3 3-.5 6 2.5 5 6.5-2 5-9 9.5-9 9.5z"
                    fill={i < islandHearts ? "currentColor" : "transparent"}
                    stroke="#173951" strokeWidth="2.2" strokeLinejoin="round"/>
            </svg>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {linkedTeachersCount > 0 && (
            <button
              onClick={onTeachersClick}
              className="flex items-center gap-1 bg-[#1F8FCE] text-white border-[2.5px] border-[#173951]
                         rounded-full px-3 py-1.5 font-[Fredoka] font-bold text-[12px]
                         shadow-[0_3px_0_#173951] hover:bg-[#0E5C8A] transition-colors">
              👨‍🏫 {linkedTeachersCount}
            </button>
          )}
          <button
            onClick={onJoinClick}
            className="flex items-center gap-1 bg-[#2BA15C] text-white border-[2.5px] border-[#173951]
                       rounded-full px-3 py-1.5 font-[Fredoka] font-bold text-[12px]
                       shadow-[0_3px_0_#173951] hover:bg-[#23864e] transition-colors">
            + Unirme
          </button>
          <div className="w-10 h-10 rounded-full bg-[#FF8763] text-white border-[2.5px] border-[#173951]
                          shadow-[0_3px_0_#E85C42] grid place-items-center font-[Fredoka] font-bold text-[15px]">
            {initials}
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-white text-[#173951] border-[2.5px] border-[#173951]
                       rounded-full px-3 py-1.5 font-[Fredoka] font-bold text-[13px]
                       shadow-[0_3php_0_#173951] hover:bg-[#FF8763] hover:text-white
                       hover:border-[#E85C42] hover:shadow-[0_3php_0_#E85C42] transition-colors">
            <Icon name="logout" className="w-3.5 h-3.5"/> Salir
          </button>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-20 pt-6">

        {/* HERO */}
        <section className="relative border-[3px] border-[#173951] rounded-[28px] overflow-hidden
                            mb-7 shadow-[0_6px_0_#173951,0_20px_40px_-10px_rgba(14,92,138,.3)]
                            grid grid-cols-1 sm:grid-cols-2 min-h-[280px] sm:min-h-[320px]">
          {/* Arte de la isla */}
          <div className="relative overflow-hidden min-h-[200px]">
            <HeroIsland/>
            <div className="hero-mascot absolute left-1/2 isla-bob"
                 style={{ width: "clamp(160px,22vw,340px)", aspectRatio: "1", transform: "translateX(-50%)", top: "10%" }}>
              <img src={mascotNormal} alt="Come Dispersión"
                   className="w-full h-full object-contain drop-shadow-lg"/>
            </div>
          </div>

          {/* Texto hero */}
          <div className="p-5 sm:p-8 flex flex-col justify-center gap-3
                          border-t-[3px] sm:border-t-0 sm:border-l-[3px] border-dashed border-[#173951]/25"
               style={{ background: "radial-gradient(circle at 100% 0%,rgba(255,216,116,.4),transparent 60%),linear-gradient(140deg,rgba(255,253,246,.85),rgba(255,253,246,.95))", backdropFilter: "blur(6px)" }}>
            <span className="inline-flex items-center gap-2 bg-[#FFD874] text-[#173951] border-[2.5px] border-[#173951]
                             rounded-full px-3 py-1 font-[Fredoka] font-extrabold text-[12px] uppercase tracking-[.1em]
                             shadow-[0_2px_0_#E8B547] self-start">
              <Icon name="sparkle" className="w-3 h-3"/> Tu isla te espera
            </span>
            <h2 className="font-[Fredoka] font-bold text-[#0E5C8A] m-0 leading-tight"
                style={{ fontSize: "clamp(28px,2.4vw+6px,38px)" }}>
              ¡Listo para una nueva <span className="text-[#FF8763]">aventura</span>, {firstName}?
            </h2>
            <p className="text-[14px] font-semibold text-[#4E6B7E] m-0 leading-relaxed max-w-[34ch]">
              Tienes <strong>{pending} misiones</strong> pendientes y <strong>Come Dispersión</strong> impaciente por jugar contigo.
            </p>

            {/* Stats rápidos */}
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { label: "Pendientes", value: pending, color: "bg-[#FF8763]/10 border-[#FF8763]", val: "#E85C42" },
                { label: "Completadas", value: completed, color: "bg-[#2BA15C]/10 border-[#2BA15C]", val: "#1B7A45" },
                { label: "Total", value: localMissions.length, color: "bg-[#1F8FCE]/10 border-[#1F8FCE]", val: "#0E5C8A" },
              ].map(s => (
                <div key={s.label} className={`${s.color} border-[2px] rounded-[14px] p-2 text-center`}>
                  <p className="text-[11px] font-extrabold uppercase tracking-[.1em] text-[#4E6B7E] m-0">{s.label}</p>
                  <p className="font-[Fredoka] font-bold text-[22px] m-0" style={{ color: s.val }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MISIONES */}
        <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
          <h3 className="font-[Fredoka] font-bold text-[26px] text-[#173951] m-0 flex items-center gap-2">
            Tus misiones activas
            <span className="bg-[#FF8763] text-white border-[2.5px] border-[#173951] rounded-full
                             px-3 py-0.5 text-[14px] shadow-[0_2px_0_#E85C42]">
              {localMissions.length}
            </span>
          </h3>
          <p className="text-[13.5px] font-bold text-[#4E6B7E] m-0">
            {pending > 0 ? `⚡ ${pending} esperándote` : "¡Lo estás haciendo genial!"}
          </p>
        </div>

        {localMissions.length === 0 ? (
          <div className="text-center py-16 border-[3px] border-dashed border-[#173951]/30 rounded-[28px]">
            <p className="font-[Fredoka] font-bold text-[22px] text-[#4E6B7E] m-0">
              🌊 No hay misiones por ahora
            </p>
            <p className="text-[14px] font-semibold text-[#93A6B3] mt-2">
              Tu docente publicará misiones pronto
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {localMissions.map(m => (
              <MissionCard
                key={m.id}
                mission={m}
                onStart={handleStart}
                onAnswer={handleStart}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de misión */}
      {activeMission && (
        <MissionModal
          mission={activeMission}
          mascotNormal={mascotNormal}
          mascotCelebra={mascotCelebra}
          mascotTriste={mascotTriste}
          onAnswer={handleAnswer}
          onClose={handleClose}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[10000] isla-pop
                        flex items-center gap-2 px-5 py-3 rounded-full
                        bg-[#2BA15C] text-white border-[2.5px] border-[#0f4f2c]
                        shadow-[0_4px_0_#0f4f2c] font-[Fredoka] font-bold text-sm">
          <Icon name="check" className="w-4 h-4" strokeWidth={3}/> {toast}
        </div>
      )}
    </div>
  );
}
