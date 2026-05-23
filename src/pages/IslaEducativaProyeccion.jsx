import { useState, useEffect, useMemo } from 'react'

// ─── Estilos de animaciones ──────────────────────────────────────────────────
const ANIMATIONS_CSS = `
  @keyframes isla-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  @keyframes isla-bounce { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-16px) scale(1.08); } }
  @keyframes isla-sadbob { 0%, 100% { transform: translateY(0) rotateZ(-2deg); } 50% { transform: translateY(-8px) rotateZ(2deg); } }
  @keyframes isla-cloud-float { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -8px); } }
  @keyframes isla-shake { 0%, 100% { transform: translateX(0); } 10% { transform: translateX(-3px); } 20% { transform: translateX(3px); } 30% { transform: translateX(-3px); } 40% { transform: translateX(3px); } }
  @keyframes isla-confetti-fall { to { transform: translateY(100vh) rotateZ(720deg); opacity: 0; } }
  @keyframes isla-rain-fall { to { transform: translateY(100vh); opacity: 0; } }
  @keyframes isla-mascot-fadeout { 0% { opacity: 1; } 100% { opacity: 0; } }
  @keyframes isla-star-pop { 0% { transform: scale(0) rotate(-180deg); opacity: 1; } 50% { opacity: 1; } 100% { transform: scale(1.4) rotate(0deg); opacity: 0; } }
  @keyframes isla-slideup { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes isla-bubble { 0% { transform: scale(0.95); opacity: 0; } 50% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }
  .isla-anim-bob { animation: isla-bob 2.4s cubic-bezier(.37,.0,.63,1) infinite; }
  .isla-anim-bounce { animation: isla-bounce 0.5s cubic-bezier(.34,1.56,.64,1) both; }
  .isla-anim-sadbob { animation: isla-sadbob 2.8s cubic-bezier(.37,.0,.63,1) infinite; }
  .isla-cloud-float { animation: isla-cloud-float 3.2s cubic-bezier(.37,.0,.63,1) infinite; }
  .isla-anim-shake { animation: isla-shake 0.5s ease-in-out; }
  .isla-confetti-fall { animation: isla-confetti-fall forwards cubic-bezier(.25,.46,.45,.94); }
  .isla-rain-fall { animation: isla-rain-fall forwards linear; }
  .isla-star-pop { animation: isla-star-pop 1.2s cubic-bezier(.34,1.56,.64,1) both; }
  .isla-anim-slideup { animation: isla-slideup 0.4s cubic-bezier(.25,.46,.45,.94); }
  .isla-anim-bubble { animation: isla-bubble 0.4s cubic-bezier(.34,1.56,.64,1); }
  .isla-anim-mascot-fadeout { animation: isla-mascot-fadeout 2.5s ease-in-out forwards; }
`

// ─── Escena tropical (idéntica al login) ────────────────────────────────────
function TropicalScene() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
        <defs>
          <linearGradient id="isla-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7FCFEC"/>
            <stop offset="55%" stopColor="#BCEAF7"/>
            <stop offset="100%" stopColor="#E4F6FB"/>
          </linearGradient>
          <linearGradient id="isla-ocean" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4FB5E5"/>
            <stop offset="100%" stopColor="#1F8FCE"/>
          </linearGradient>
          <radialGradient id="isla-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE9A8"/>
            <stop offset="70%" stopColor="#FFD874"/>
            <stop offset="100%" stopColor="#E8B547"/>
          </radialGradient>
        </defs>

        {/* Cielo */}
        <rect width="1440" height="900" fill="url(#isla-sky)"/>

        {/* Sol con rayos */}
        <g>
          <circle cx="1180" cy="220" r="120" fill="#FFE9A8" opacity="0.55"/>
          <circle cx="1180" cy="220" r="80"  fill="url(#isla-sun)" stroke="#173951" strokeWidth="4"/>
          {[0,45,90,135,180,225,270,315].map((a) => (
            <rect key={a} x="1176" y="80" width="8" height="20" rx="3"
              fill="#FFD874" stroke="#173951" strokeWidth="3"
              transform={`rotate(${a} 1180 220)`}/>
          ))}
        </g>

        {/* Nubes */}
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

        {/* Isla lejana */}
        <g opacity="0.5">
          <ellipse cx="220" cy="640" rx="160" ry="22" fill="#1F8FCE"/>
          <path d="M 90 640 Q 220 555 350 640 Z" fill="#5BC982" stroke="#1B7A45" strokeWidth="3"/>
        </g>

        {/* Mar */}
        <path d="M 0 640 Q 360 615 720 640 T 1440 640 L 1440 900 L 0 900 Z" fill="url(#isla-ocean)"/>

        {/* Líneas de olas */}
        <g stroke="#FFFDF6" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7">
          <path d="M 60 720 q 30 -10 60 0 t 60 0"/>
          <path d="M 980 700 q 30 -10 60 0 t 60 0"/>
          <path d="M 300 800 q 30 -10 60 0 t 60 0"/>
          <path d="M 1180 820 q 30 -10 60 0 t 60 0"/>
          <path d="M 700 770 q 30 -10 60 0 t 60 0"/>
        </g>

        {/* Isla principal (arena) */}
        <g>
          <ellipse cx="960" cy="780" rx="380" ry="40" fill="#FFD874" stroke="#173951" strokeWidth="4"/>
          <path d="M 600 780 Q 960 660 1320 780 Z" fill="#FFE9A8" stroke="#173951" strokeWidth="4"/>
          <g fill="#E8B547">
            <circle cx="780" cy="755" r="3"/>
            <circle cx="900" cy="745" r="2.5"/>
            <circle cx="1020" cy="740" r="3"/>
            <circle cx="1140" cy="755" r="2.5"/>
          </g>
        </g>

        {/* Palmera izquierda */}
        <g transform="translate(720,720)">
          <path d="M 0 0 Q -6 -80 8 -160" stroke="#7B4B2A" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <path d="M 0 0 Q -6 -80 8 -160" stroke="#5C3618" strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray="4 22" opacity="0.55"/>
          <g transform="translate(8,-160)">
            {[
              "M 0 0 Q 60 -20 100 10 Q 60 -5 0 5 Z",
              "M 0 0 Q -60 -20 -100 10 Q -60 -5 0 5 Z",
              "M 0 0 Q 30 -60 70 -90 Q 20 -50 0 -8 Z",
              "M 0 0 Q -30 -60 -70 -90 Q -20 -50 0 -8 Z",
              "M 0 0 Q 80 10 110 50 Q 60 20 0 8 Z",
              "M 0 0 Q -80 10 -110 50 Q -60 20 0 8 Z",
            ].map((d,i)=>(
              <path key={i} d={d} fill="#2BA15C" stroke="#1B7A45" strokeWidth="3" strokeLinejoin="round"/>
            ))}
            <circle cx="0" cy="0" r="8" fill="#1B7A45"/>
            <circle cx="-8" cy="6" r="6" fill="#7B4B2A" stroke="#5C3618" strokeWidth="2"/>
            <circle cx="8"  cy="6" r="6" fill="#7B4B2A" stroke="#5C3618" strokeWidth="2"/>
          </g>
        </g>

        {/* Palmera derecha */}
        <g transform="translate(1180,730)">
          <path d="M 0 0 Q 8 -90 -6 -180" stroke="#7B4B2A" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <path d="M 0 0 Q 8 -90 -6 -180" stroke="#5C3618" strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray="4 22" opacity="0.55"/>
          <g transform="translate(-6,-180)">
            {[
              "M 0 0 Q 60 -20 100 10 Q 60 -5 0 5 Z",
              "M 0 0 Q -60 -20 -100 10 Q -60 -5 0 5 Z",
              "M 0 0 Q 30 -60 70 -90 Q 20 -50 0 -8 Z",
              "M 0 0 Q -30 -60 -70 -90 Q -20 -50 0 -8 Z",
              "M 0 0 Q 80 10 110 50 Q 60 20 0 8 Z",
              "M 0 0 Q -80 10 -110 50 Q -60 20 0 8 Z",
            ].map((d,i)=>(
              <path key={i} d={d} fill="#5BC982" stroke="#1B7A45" strokeWidth="3" strokeLinejoin="round"/>
            ))}
            <circle cx="0" cy="0" r="8" fill="#1B7A45"/>
          </g>
        </g>

        {/* Palmera pequeña */}
        <g transform="translate(280,760)">
          <path d="M 0 0 Q -4 -50 6 -100" stroke="#7B4B2A" strokeWidth="10" fill="none" strokeLinecap="round"/>
          <g transform="translate(6,-100)">
            {[
              "M 0 0 Q 40 -14 70 8 Q 40 -4 0 4 Z",
              "M 0 0 Q -40 -14 -70 8 Q -40 -4 0 4 Z",
              "M 0 0 Q 18 -40 50 -60 Q 14 -34 0 -6 Z",
              "M 0 0 Q -18 -40 -50 -60 Q -14 -34 0 -6 Z",
            ].map((d,i)=>(
              <path key={i} d={d} fill="#2BA15C" stroke="#1B7A45" strokeWidth="2.5" strokeLinejoin="round"/>
            ))}
            <circle cx="0" cy="0" r="6" fill="#1B7A45"/>
          </g>
        </g>

        {/* Velero */}
        <g transform="translate(380,690)">
          <path d="M -30 0 L 30 0 L 22 14 L -22 14 Z" fill="#FFFDF6" stroke="#173951" strokeWidth="3"/>
          <path d="M 0 -38 L 0 0 L 22 0 Z" fill="#FF8763" stroke="#173951" strokeWidth="3"/>
          <line x1="0" y1="-38" x2="0" y2="0" stroke="#173951" strokeWidth="2.5"/>
        </g>

        {/* Pez */}
        <g transform="translate(1080,830)" opacity="0.8">
          <ellipse cx="0" cy="0" rx="14" ry="8" fill="#FF8763" stroke="#173951" strokeWidth="2.5"/>
          <path d="M 12 0 L 22 -8 L 22 8 Z" fill="#FF8763" stroke="#173951" strokeWidth="2.5" strokeLinejoin="round"/>
          <circle cx="-5" cy="-2" r="2" fill="#173951"/>
        </g>

        {/* Cresta de arena en frente */}
        <path d="M 0 870 Q 360 855 720 870 T 1440 870 L 1440 900 L 0 900 Z"
          fill="#FFD874" stroke="#173951" strokeWidth="3"/>
      </svg>
    </div>
  )
}

// ─── Icon helper (simple SVG icons) ──────────────────────────────────────────
function Icon({ name, className = '', strokeWidth = 2, ...props }) {
  const icons = {
    sparkle: <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={strokeWidth} {...props}><path d="M12 3v6m0 6v6M3 12h6m6 0h6"/></svg>,
    close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} {...props}><path d="M18 6L6 18M6 6l12 12"/></svg>,
    skip: <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M5 3v18l11-9L5 3z"/></svg>,
    pause: <svg viewBox="0 0 24 24" fill="currentColor" {...props}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
    play: <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M5 3v18l15-9L5 3z"/></svg>,
    check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} {...props}><path d="M20 6L9 17l-5-5"/></svg>,
    x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} {...props}><path d="M18 6L6 18M6 6l12 12"/></svg>,
    trophy: <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M6 9h12v2H6V9zm1-5h10v3H7V4zm3 14h4v3h-4v-3z"/></svg>,
    'heart-broken': <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  };
  return <span className={className}>{icons[name] || null}</span>
}

// ─── Timer circular ─────────────────────────────────────────────────────────
function CircularTimer({ secondsLeft, secondsTotal, paused }) {
  const R = 56;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, secondsLeft) / Math.max(1, secondsTotal);
  const dash = C * pct;
  const warning = secondsLeft <= 30 && secondsLeft > 0;
  const mm = Math.floor(Math.max(0, secondsLeft) / 60);
  const ss = Math.max(0, secondsLeft) % 60;
  return (
    <div className={`relative w-[124px] h-[124px] grid place-items-center max-md:w-[80px] max-md:h-[80px]
                     ${warning ? "isla-anim-shake" : ""}`}>
      <svg viewBox="0 0 124 124" className="absolute inset-0 -rotate-90">
        <circle cx="62" cy="62" r={R} fill="none" stroke="#173951" strokeWidth="6" opacity="0.15"/>
        <circle cx="62" cy="62" r={R} fill="none" strokeWidth="8" strokeLinecap="round"
          stroke={warning ? "#E85C42" : "#1F8FCE"} strokeDasharray={`${dash} ${C}`}
          style={{ transition: "stroke-dasharray .9s linear" }}/>
      </svg>
      <div className="w-24 h-24 bg-[#FFFDF6] rounded-full border-[3px] border-[#173951] grid place-items-center text-center max-md:w-16 max-md:h-16">
        <div>
          <div className={`font-Fredoka font-bold leading-none tabular-nums text-[30px] max-md:text-[20px]
                          ${warning ? "text-[#E85C42]" : "text-[#173951]"}`}>
            {paused ? "⏸" : `${mm}:${String(ss).padStart(2, "0")}`}
          </div>
          <div className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#4E6B7E] mt-0.5 max-md:hidden">
            {paused ? "pausa" : "siguiente"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Confeti ────────────────────────────────────────────────────────────────
function Confetti({ count = 80 }) {
  const colors = ["#FFD874", "#FF8763", "#2BA15C", "#1F8FCE", "#7A5AE0", "#E85C42", "#FFFDF6"];
  const pieces = useMemo(() => (
    Array.from({ length: count }).map((_, i) => ({
      key: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.6,
      duration: 2.6 + Math.random() * 1.6,
      color: colors[i % colors.length],
      size: 8 + Math.random() * 12,
      rot: Math.random() * 360,
      shape: i % 3,
    }))
  ), [count]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[22]">
      {pieces.map((p) => (
        <span key={p.key} className="absolute -top-10 border-2 border-[#173951] isla-confetti-fall" style={{
          left: p.left + "vw", width: p.size, height: p.size * (1 + Math.random() * 0.8),
          background: p.color, animationDelay: -p.delay + "s", animationDuration: p.duration + "s",
          borderRadius: p.shape === 0 ? "3px" : p.shape === 1 ? "50%" : "0",
          transform: `rotate(${p.rot}deg)`,
        }}/>
      ))}
    </div>
  );
}

// ─── Estrellas ──────────────────────────────────────────────────────────────
function StarBurst() {
  const stars = useMemo(() => ([
    { x: "10%", y: "20%", size: 32, delay: 0 },
    { x: "85%", y: "12%", size: 26, delay: 0.2 },
    { x: "6%",  y: "60%", size: 22, delay: 0.5 },
    { x: "90%", y: "55%", size: 30, delay: 0.7 },
    { x: "20%", y: "78%", size: 20, delay: 0.4 },
    { x: "76%", y: "82%", size: 28, delay: 0.9 },
    { x: "45%", y: "8%",  size: 24, delay: 0.3 },
    { x: "50%", y: "70%", size: 18, delay: 1.1 },
  ]), []);
  return (
    <div className="absolute inset-0 pointer-events-none z-[22]">
      {stars.map((s, i) => (
        <span key={i} className="absolute text-[#FFD874] isla-star-pop" style={{ left: s.x, top: s.y, animationDelay: s.delay + "s" }}>
          <svg viewBox="0 0 24 24" style={{ width: s.size, height: s.size }} fill="currentColor"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/></svg>
        </span>
      ))}
    </div>
  );
}

// ─── Lluvia ─────────────────────────────────────────────────────────────────
function Rain({ count = 50 }) {
  const drops = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    key: i, left: Math.random() * 100, delay: Math.random() * 1.6, duration: 0.8 + Math.random() * 0.8,
  })), [count]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[22]">
      {drops.map((d) => (
        <span key={d.key} className="absolute -top-5 w-[3px] h-3.5 rounded-sm bg-[#4FB5E5] opacity-70 isla-rain-fall" style={{
          left: d.left + "vw", animationDelay: -d.delay + "s", animationDuration: d.duration + "s",
        }}/>
      ))}
    </div>
  );
}

// ─── Nube de tristeza ───────────────────────────────────────────────────────
function SadCloud() {
  return (
    <svg viewBox="0 0 200 90" className="absolute top-[5vh] left-1/2 -translate-x-1/2 w-[min(280px,28vw)] isla-cloud-float pointer-events-none">
      <g fill="#5C6470" stroke="#173951" strokeWidth="4">
        <ellipse cx="100" cy="50" rx="80" ry="28"/>
        <ellipse cx="60" cy="38" rx="36" ry="22"/>
        <ellipse cx="135" cy="36" rx="40" ry="24"/>
      </g>
      <g stroke="#4FB5E5" strokeWidth="4" strokeLinecap="round">
        {[[60,78,56,86,1.0],[90,80,86,88,0.8],[120,78,116,86,1.2],[150,80,146,88,0.6]].map(([x1,y1,x2,y2,dur],i)=>(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2}><animate attributeName="opacity" values={i%2?"0;1;0":"1;0;1"} dur={`${dur}s`} repeatCount="indefinite"/></line>))}
      </g>
    </svg>
  );
}

// ─── Top bar ────────────────────────────────────────────────────────────────
function TopBar({ subject, topic, currentLabel, progressLabel, secondsLeft, totalSeconds, showTimer, paused, onExit }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between gap-3 px-5 py-4 sm:px-9 sm:py-5 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 sm:gap-4 max-w-[56vw] bg-[#FFFDF6] border-[3px] border-[#173951] rounded-[22px]
                      px-3 py-2 sm:px-5 sm:py-3.5 shadow-[0_5px_0_#173951,0_12px_26px_-6px_rgba(14,92,138,.35)]">
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl bg-[#1F8FCE] text-white border-[2.5px] sm:border-[3px] border-[#173951]
                        shadow-[0_3px_0_#0E5C8A] grid place-items-center font-Fredoka font-bold text-[20px] sm:text-[30px] flex-shrink-0">🌴</div>
        <div className="min-w-0">
          <p className="text-[12px] font-extrabold tracking-[.18em] uppercase text-[#FF8763] m-0 max-sm:hidden">Expedición de hoy</p>
          <p className="font-Fredoka font-bold text-[14px] sm:text-[20px] text-[#0E5C8A] m-0 leading-none truncate">{subject}</p>
          <p className="font-Fredoka font-semibold text-[16px] sm:text-[26px] text-[#173951] mt-0.5 leading-tight truncate">{topic}</p>
        </div>
      </div>

      <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3.5">
        <div className="bg-[#FFFDF6] border-[3px] border-[#173951] rounded-full px-3 py-2 sm:px-4.5 sm:py-2.5
                        font-Fredoka font-bold text-[13px] sm:text-[18px] text-[#173951] shadow-[0_4px_0_#173951]
                        flex items-center gap-2.5">
          <span className="bg-[#FF8763] text-white border-[2px] border-[#173951] rounded-full px-2.5 py-0.5 text-[11px] sm:text-[13px] shadow-[0_2px_0_#E85C42]">{currentLabel}</span>
          <span className="max-sm:hidden">{progressLabel}</span>
        </div>

        {showTimer && <CircularTimer secondsLeft={secondsLeft} secondsTotal={totalSeconds} paused={paused}/>}

        <button onClick={onExit} title="Salir de la proyección"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FFFDF6] text-[#173951] border-[3px] border-[#173951]
                     grid place-items-center cursor-pointer shadow-[0_4px_0_#173951]
                     hover:bg-[#FF8763] hover:text-white hover:border-[#E85C42] hover:shadow-[0_4px_0_#E85C42]
                     active:translate-y-0.5 active:shadow-[0_1px_0_#173951] transition-all">
          <Icon name="close" className="w-5 h-5 sm:w-[22px] sm:h-[22px]"/>
        </button>
      </div>
    </div>
  );
}

// ─── Bocadillo cómic ────────────────────────────────────────────────────────
function SpeechBubble({ characterName, children, variant = "default" }) {
  const variantClasses =
    variant === "correct"
      ? "border-[#1B7A45] shadow-[0_8px_0_#1B7A45,0_24px_60px_-10px_rgba(43,161,92,.6)] bg-gradient-to-b from-[#FFFDF6] to-[#DDF3E4]"
      : variant === "incorrect"
      ? "border-[#B0202D] shadow-[0_8px_0_#B0202D,0_24px_60px_-10px_rgba(230,57,70,.55)] bg-gradient-to-b from-[#FFFDF6] to-[#FFDADA]"
      : "border-[#173951] shadow-[0_8px_0_#173951,0_24px_60px_-10px_rgba(14,92,138,.45)] bg-[#FFFDF6]";

  return (
    <div className="relative pointer-events-auto max-w-[680px] isla-anim-bubble">
      <div className={`relative border-[4px] rounded-[32px] p-8 sm:p-11 ${variantClasses}`}>
        <span className="hidden md:block absolute -left-9 top-[26%] w-0 h-0 border-y-[18px] border-y-transparent border-r-[40px] border-r-[#173951]"/>
        <span className="hidden md:block absolute -left-7 top-[calc(26%+6px)] w-0 h-0 border-y-[14px] border-y-transparent border-r-[32px] border-r-[#FFFDF6]"/>

        {characterName && (
          <div className="inline-flex items-center gap-2 bg-[#FFD874] text-[#173951] border-[2.5px] border-[#173951]
                          rounded-full px-3.5 py-1 shadow-[0_2px_0_#E8B547] font-Fredoka font-bold text-[14px] mb-3.5">
            <Icon name="sparkle" className="w-3.5 h-3.5"/> {characterName}
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}

// ─── Bottom bar ─────────────────────────────────────────────────────────────
function BottomBar({ totalQuestions, currentStep, paused, onTogglePause, onNext, nextLabel }) {
  return (
    <div className="absolute left-0 right-0 bottom-0 z-30 flex items-center justify-between gap-3 sm:gap-5 px-5 py-4 sm:px-9 sm:py-5 pointer-events-none flex-wrap">
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5 bg-[#FFFDF6]/95 border-[3px] border-[#173951]
                      rounded-full px-3 py-2 sm:px-4 sm:py-2.5 shadow-[0_4px_0_#173951]">
        <span className="font-Fredoka font-bold text-[14px] sm:text-[16px] text-[#173951] mr-1.5 max-sm:hidden">Recorrido</span>
        {Array.from({ length: totalQuestions }).map((_, i) => {
          const done = i < currentStep;
          const current = i === currentStep - 1 && currentStep > 0;
          return (
            <span key={i} className={[
              "w-3.5 h-3.5 rounded-full border-[2px] border-[#173951] transition-all",
              done ? "bg-[#2BA15C]" : current ? "bg-[#FF8763] scale-125 shadow-[0_0_0_4px_rgba(255,135,99,.35)]" : "bg-[#E1D3A6]",
            ].join(" ")}/>
          );
        })}
      </div>

      <div className="pointer-events-auto flex gap-2.5 sm:gap-3">
        <button onClick={onTogglePause}
          className="bg-[#FFFDF6] text-[#173951] border-[3px] border-[#173951] rounded-[18px]
                     px-4 py-3 sm:px-5 sm:py-4 font-Fredoka font-bold text-[14px] sm:text-[18px]
                     flex items-center gap-2 shadow-[0_5px_0_#173951]
                     hover:bg-[#FFE9A8] active:translate-y-0.5 active:shadow-[0_2px_0_#173951] transition-all">
          <Icon name={paused ? "play" : "pause"} className="w-4 h-4 sm:w-[18px] sm:h-[18px]"/>
          <span className="max-sm:hidden">{paused ? "Reanudar" : "Pausar"}</span>
        </button>

        <button onClick={onNext}
          className="bg-[#FF8763] text-white border-[3px] border-[#173951] rounded-[20px]
                     px-5 py-3.5 sm:px-7 sm:py-4 font-Fredoka font-bold text-[15px] sm:text-[22px]
                     flex items-center gap-2.5 transition-all
                     shadow-[0_5px_0_#E85C42,0_10px_22px_-2px_rgba(232,92,66,.5)]
                     hover:-translate-y-0.5 hover:shadow-[0_7px_0_#E85C42,0_14px_26px_-2px_rgba(232,92,66,.55)]
                     active:translate-y-1 active:shadow-[0_2px_0_#E85C42]">
          {nextLabel}
          <Icon name="skip" className="w-5 h-5 sm:w-[22px] sm:h-[22px]"/>
        </button>
      </div>
    </div>
  );
}

// ─── Botón de respuesta ─────────────────────────────────────────────────────
function AnswerButton({ variant, onClick, children }) {
  const isCorrect = variant === "correct";
  return (
    <button onClick={onClick}
      className={[
        "border-[4px] border-[#173951] rounded-[22px] px-5 py-4 sm:px-7 sm:py-5",
        "font-Fredoka font-extrabold text-white flex items-center justify-center gap-3.5",
        "transition-all relative overflow-hidden",
        "text-[20px] sm:text-[26px]",
        "active:translate-y-1",
        isCorrect
          ? "bg-gradient-to-b from-[#5BC982] to-[#2BA15C] shadow-[0_6px_0_#1B7A45,0_12px_26px_-2px_rgba(43,161,92,.5)] hover:-translate-y-0.5 hover:shadow-[0_9px_0_#1B7A45,0_16px_30px_-2px_rgba(43,161,92,.55)]"
          : "bg-gradient-to-b from-[#FF6B6B] to-[#E63946] shadow-[0_6px_0_#B0202D,0_12px_26px_-2px_rgba(230,57,70,.5)] hover:-translate-y-0.5 hover:shadow-[0_9px_0_#B0202D,0_16px_30px_-2px_rgba(230,57,70,.55)]",
      ].join(" ")}
      style={{ textShadow: "0 2px 0 rgba(0,0,0,.18)" }}
    >
      <span className={`grid place-items-center bg-white border-[3px] border-[#173951] rounded-full shadow-[0_3px_0_#173951]
                       w-9 h-9 sm:w-12 sm:h-12 ${isCorrect ? "text-[#1B7A45]" : "text-[#B0202D]"}`}>
        <Icon name={isCorrect ? "check" : "x"} className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={3.5}/>
      </span>
      {children}
    </button>
  );
}

// ─── Componente principal ───────────────────────────────────────────────────
export default function IslaEducativaProyeccion({
  mascotNormal  = "/src/assets/images/cookie-normal.png",
  mascotCelebra = "/src/assets/images/cookie-celebra.png",
  mascotTriste  = "/src/assets/images/cookie-triste.png",
  subject        = "Ciencias Naturales",
  topic          = "Los ecosistemas marinos",
  characterName  = "Come Dispersión",
  questions      = [],
  totalQuestions: totalQuestionsProp,
  minutesPerQuestion = 6,
  presentationDialogues,
  state: controlledState,
  onStateChange,
  initialState = "intro",
  onExit      = () => {},
  onAnswer    = () => {},
  onMissionResult = () => {},
  onComplete  = () => {},
}) {
  const totalQuestions = totalQuestionsProp ?? Math.max(1, questions.length || 6);
  const totalSeconds   = Math.max(1, minutesPerQuestion) * 60;

  const [internalState, setInternalState] = useState(initialState);
  const state = controlledState ?? internalState;
  const setState = (s) => {
    if (!controlledState) setInternalState(s);
    onStateChange?.(s);
  };

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [paused, setPaused] = useState(false);
  useEffect(() => { setSecondsLeft(totalSeconds); }, [totalSeconds]);
  useEffect(() => {
    if (paused || (state !== "timer" && state !== "asking")) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [paused, state]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const currentQuestion = questions[questionIndex] ?? `Pregunta ${questionIndex + 1}`;

  const dialogues = [
    <>¡Hola, aventureros de <strong>María Elvinia</strong>! Bienvenidos a esta gran expedición educativa. Yo soy el <strong>Señor Comegalletas</strong>, aunque aquí, en nuestra isla, me conocen como <strong>Come Dispersión</strong>.</>,
    <>Estaré despertando en algunos momentos de la clase para comprobar qué tan <strong>atentos</strong> están y ayudarlos a proteger esta isla de la <strong>dispersión</strong>.</>,
    <>Ustedes son mis <strong>compañeros de aventura</strong> y juntos debemos mantener viva la atención dentro de la isla educativa. Cada vez que respondan <strong>correctamente</strong> mis preguntas, la isla se hará más fuerte y podremos seguir aprendiendo juntos. Pero cuidado… si la dispersión gana, tendré que irme.</>,
    <>Así que prepárense, porque en cualquier momento puedo despertar <strong>¡y necesitaré la ayuda de todos ustedes!</strong> ✨</>,
  ];
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [missionTimeoutId, setMissionTimeoutId] = useState(null);

  useEffect(() => {
    if (state === "timer" || state === "asking") setSecondsLeft(totalSeconds);
    if (state === "intro") setDialogueIdx(0);
  }, [state, totalSeconds]);

  // Limpiar timeout cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (missionTimeoutId) clearTimeout(missionTimeoutId);
    };
  }, [missionTimeoutId]);

  const handleExit = () => onExit?.();
  const handleTogglePause = () => setPaused((p) => !p);

  const handleNext = () => {
    if (state === "intro") {
      if (dialogueIdx < dialogues.length - 1) setDialogueIdx((i) => i + 1);
      else setState("timer");
      return;
    }
    if (state === "timer") { setState("asking"); return; }
    if (state === "asking") {
      if (questionIndex >= totalQuestions - 1) { onComplete?.(); return; }
      setQuestionIndex((i) => i + 1);
      setState("timer");
      return;
    }
    if (state === "correct" || state === "incorrect") {
      if (questionIndex >= totalQuestions - 1) { onComplete?.(); return; }
      setQuestionIndex((i) => i + 1);
      setState("timer");
    }
  };

  const handleAnswer = (isCorrect) => {
    onAnswer?.({ questionIndex, isCorrect });
    setState(isCorrect ? "correct" : "incorrect");
  };

  const handleMission = (result) => {
    onMissionResult?.({ questionIndex, resultado: result });
    const newState = result === "lograda" ? "mission_success" : "mission_fail";
    setState(newState);

    // Auto-avanzar después de 3 segundos
    const timeoutId = setTimeout(() => {
      if (questionIndex >= totalQuestions - 1) {
        onComplete?.();
      } else {
        setQuestionIndex((i) => i + 1);
        setState("timer");
      }
    }, 3000);

    setMissionTimeoutId(timeoutId);
  };

  const showTimer = state === "timer" || state === "asking";
  const currentLabel = state === "intro" ? "Intro" : state === "timer" ? "Próxima" : "Pregunta";
  const progressLabel = state === "intro" ? "¡Comenzamos!" : `${questionIndex + 1} de ${totalQuestions}`;
  const currentStep = (state === "intro") ? 0 : (questionIndex + 1);
  const nextLabel = (state === "intro")
    ? (dialogueIdx < dialogues.length - 1 ? "Siguiente" : "¡Empezar primera pregunta!")
    : (state === "mission_success" || state === "mission_fail")
    ? ""  // No mostrar botón en estos estados (auto-avance)
    : (questionIndex >= totalQuestions - 1 && (state === "correct" || state === "incorrect"))
    ? "Finalizar"
    : (state === "asking" ? "Saltar pregunta" : "Siguiente pregunta");

  const mascotSrc =
    state === "correct"   ? mascotCelebra :
    state === "incorrect" ? mascotTriste  :
    state === "mission_success" ? mascotCelebra :
    state === "mission_fail" ? mascotTriste :
                            mascotNormal;
  const mascotAnimCls =
    state === "correct"   ? "isla-anim-bounce" :
    state === "incorrect" ? "isla-anim-sadbob" :
    state === "mission_success" ? "isla-anim-bounce" :
    state === "mission_fail" ? "isla-anim-sadbob" :
                            "isla-anim-bob";

  const stageTintCls =
    state === "correct"   ? "after:bg-[rgba(43,161,92,0.25)]" :
    state === "incorrect" ? "after:bg-[rgba(180,32,45,0.35)]" :
                            "";

  return (
    <div className={`relative w-screen h-screen overflow-hidden bg-[#0E5C8A] font-Nunito text-[#173951]
                     after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:transition-colors ${stageTintCls}`}>
      <style>{ANIMATIONS_CSS}</style>

      <TropicalScene/>

      <TopBar
        subject={subject} topic={topic}
        currentLabel={currentLabel} progressLabel={progressLabel}
        secondsLeft={secondsLeft} totalSeconds={totalSeconds}
        showTimer={showTimer} paused={paused}
        onExit={handleExit}
      />

      {(state === "correct" || state === "mission_success") && (<><Confetti count={80}/><StarBurst/></>)}
      {(state === "incorrect" || state === "mission_fail") && <Rain count={50}/>}

      <div className="absolute inset-0 z-25 flex items-center gap-4 pointer-events-none
                      px-3 sm:px-6 md:px-8
                      pt-[110px] sm:pt-[14vh] pb-[110px] sm:pb-[18vh]">
        {/* Personaje - 50% del ancho, muy grande */}
        <div className="hidden md:flex w-[50%] items-center justify-center pointer-events-none flex-shrink-0">
          {state === "incorrect" && <SadCloud/>}
          <img
            key={state}
            src={mascotSrc}
            alt={`${characterName} (${state})`}
            className={`object-contain pointer-events-none drop-shadow-[0_30px_24px_rgba(14,92,138,.35)]
                        w-[min(90vw,800px)] aspect-square ${mascotAnimCls}
                        ${state === 'mission_fail' ? 'isla-anim-mascot-fadeout' : ''}`}
          />
        </div>

        {/* Bocadillo - 45% del ancho, centrado verticalmente */}
        <div className="w-full md:w-[45%] pointer-events-auto flex items-center" key={`${state}-${dialogueIdx}`}>
          {state === "intro" && (
            <SpeechBubble characterName={characterName}>
              <p className="font-Fredoka font-bold text-[#173951] leading-[1.32] m-0 text-balance"
                 style={{ fontSize: "clamp(20px, 1.8vw + 1vh + 8px, 32px)" }}>
                {dialogues[dialogueIdx]}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                {dialogues.map((_, i) => (
                  <span key={i} className={`w-2 h-2 rounded-full border border-[#173951]
                                            ${i === dialogueIdx ? "bg-[#FF8763] w-6" : "bg-white"}`}/>
                ))}
              </div>
            </SpeechBubble>
          )}

          {state === "timer" && (
            <SpeechBubble characterName={characterName}>
              <p className="font-Fredoka font-bold text-[#173951] leading-[1.32] m-0 text-balance"
                 style={{ fontSize: "clamp(20px, 1.8vw + 1vh + 8px, 32px)" }}>
                Atentos, aventureros… la pregunta <strong>{questionIndex + 1}</strong> se revela en breve.
              </p>
            </SpeechBubble>
          )}

          {state === "asking" && (
            <div className="flex flex-col gap-4 sm:gap-5">
              <div className="bg-[#FFFDF6] border-[5px] border-[#173951] rounded-[28px] px-6 py-6 sm:px-9 sm:py-8
                              shadow-[0_8px_0_#173951,0_24px_60px_-10px_rgba(14,92,138,.45)]">
                <div className="inline-flex items-center gap-2 bg-[#FFD874] text-[#173951] border-[2.5px] border-[#173951]
                                rounded-full px-3 py-1 shadow-[0_2px_0_#E8B547] font-Fredoka font-bold text-[13px] mb-2.5">
                  <Icon name="sparkle" className="w-3.5 h-3.5"/> {characterName}
                </div>
                <p className="text-[12px] font-extrabold uppercase tracking-[.18em] text-[#FF8763] mb-1.5 m-0">
                  Pregunta {questionIndex + 1}
                </p>
                <h2 className="font-Fredoka font-bold text-[#173951] leading-[1.18] m-0 text-balance"
                    style={{ fontSize: "clamp(20px, 1.8vw + 0.8vh + 10px, 38px)" }}>
                  {currentQuestion}
                </h2>
                <p className="mt-3.5 flex items-center gap-2.5 font-bold text-[#4E6B7E] m-0
                              before:content-[''] before:h-[3px] before:flex-1 before:bg-[#E5DCC0] before:rounded-full
                              after:content-[''] after:h-[3px] after:flex-1 after:bg-[#E5DCC0] after:rounded-full"
                   style={{ fontSize: "clamp(15px, .8vw + .6vh + 6px, 22px)" }}>
                  ¿Será esto correcto?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                <AnswerButton variant="correct" onClick={() => handleAnswer(true)}>Correcto</AnswerButton>
                <AnswerButton variant="incorrect" onClick={() => handleAnswer(false)}>Incorrecto</AnswerButton>
              </div>
            </div>
          )}

          {state === "correct" && (
            <div className="flex flex-col gap-4 sm:gap-5">
              <SpeechBubble variant="correct">
                <div className="inline-flex items-center gap-2 bg-white border-[3px] border-[#1B7A45] text-[#1B7A45]
                                rounded-full px-4 py-1.5 shadow-[0_3px_0_#1B7A45] font-Fredoka font-extrabold text-[14px] uppercase tracking-[.08em] mb-3.5">
                  <Icon name="trophy" className="w-4 h-4"/> ¡Respuesta acertada!
                </div>
                <p className="font-Fredoka font-bold text-[#173951] leading-[1.2] m-0 text-balance text-center"
                   style={{ fontSize: "clamp(20px, 1.6vw + .8vh + 8px, 34px)" }}>
                  ¡Felicitaciones, aventureros! Han superado la prueba de <span className="text-[#0E5C8A]">{characterName}</span>.
                </p>
                <p className="text-center text-[#4E6B7E] font-bold mt-3 m-0"
                   style={{ fontSize: "clamp(14px, .6vw + .6vh + 6px, 18px)" }}>
                  +1 estrella para la clase 🌟  ·  ¡Sigamos navegando!
                </p>
              </SpeechBubble>

              {/* Botones de Misión */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                <button
                  onClick={() => handleMission("lograda")}
                  className="px-5 py-3 sm:px-7 sm:py-4 bg-[#2BA15C] hover:bg-[#23864e] text-white border-[3px] border-[#173951]
                             rounded-2xl font-Fredoka font-bold text-[15px] sm:text-[17px] shadow-[0_4px_0_#173951]
                             transition-all active:shadow-[0_1px_0_#173951] active:translate-y-1"
                >
                  🏆 Misión lograda
                </button>
                <button
                  onClick={() => handleMission("fallida")}
                  className="px-5 py-3 sm:px-7 sm:py-4 bg-[#E85C42] hover:bg-[#d04a2e] text-white border-[3px] border-[#173951]
                             rounded-2xl font-Fredoka font-bold text-[15px] sm:text-[17px] shadow-[0_4px_0_#173951]
                             transition-all active:shadow-[0_1px_0_#173951] active:translate-y-1"
                >
                  💔 Misión fallida
                </button>
              </div>
            </div>
          )}

          {state === "incorrect" && (
            <div className="flex flex-col gap-4 sm:gap-5">
              <SpeechBubble variant="incorrect">
                <div className="inline-flex items-center gap-2 bg-white border-[3px] border-[#B0202D] text-[#B0202D]
                                rounded-full px-4 py-1.5 shadow-[0_3px_0_#B0202D] font-Fredoka font-extrabold text-[14px] uppercase tracking-[.08em] mb-3.5">
                  <Icon name="heart-broken" className="w-4 h-4"/> ¡Ay, no!
                </div>
                <p className="font-Fredoka font-bold text-[#173951] leading-[1.2] m-0 text-balance text-center"
                   style={{ fontSize: "clamp(20px, 1.6vw + .8vh + 8px, 34px)" }}>
                  ¡Oh no! Me iré de la isla por un momento…
                </p>
                <p className="text-center text-[#4E6B7E] font-bold mt-3 m-0"
                   style={{ fontSize: "clamp(14px, .6vw + .6vh + 6px, 18px)" }}>
                  No se preocupen, regreso en la próxima pregunta. ¡Sigan atentos!
                </p>
              </SpeechBubble>

              {/* Botones de Misión */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                <button
                  onClick={() => handleMission("lograda")}
                  className="px-5 py-3 sm:px-7 sm:py-4 bg-[#2BA15C] hover:bg-[#23864e] text-white border-[3px] border-[#173951]
                             rounded-2xl font-Fredoka font-bold text-[15px] sm:text-[17px] shadow-[0_4px_0_#173951]
                             transition-all active:shadow-[0_1px_0_#173951] active:translate-y-1"
                >
                  🏆 Misión lograda
                </button>
                <button
                  onClick={() => handleMission("fallida")}
                  className="px-5 py-3 sm:px-7 sm:py-4 bg-[#E85C42] hover:bg-[#d04a2e] text-white border-[3px] border-[#173951]
                             rounded-2xl font-Fredoka font-bold text-[15px] sm:text-[17px] shadow-[0_4px_0_#173951]
                             transition-all active:shadow-[0_1px_0_#173951] active:translate-y-1"
                >
                  💔 Misión fallida
                </button>
              </div>
            </div>
          )}

          {state === "mission_success" && (
            <SpeechBubble variant="correct">
              <div className="inline-flex items-center gap-2 bg-white border-[3px] border-[#1B7A45] text-[#1B7A45]
                              rounded-full px-4 py-1.5 shadow-[0_3px_0_#1B7A45] font-Fredoka font-extrabold text-[14px] uppercase tracking-[.08em] mb-3.5">
                <Icon name="sparkle" className="w-4 h-4"/> ¡Misión completada!
              </div>
              <p className="font-Fredoka font-bold text-[#173951] leading-[1.2] m-0 text-balance text-center"
                 style={{ fontSize: "clamp(20px, 1.6vw + .8vh + 8px, 34px)" }}>
                ¡Felicitaciones, aventureros! Han superado una pequeña prueba de <span className="text-[#0E5C8A]">{characterName}</span>.
              </p>
              <p className="text-center text-[#4E6B7E] font-bold mt-3 m-0"
                 style={{ fontSize: "clamp(14px, .6vw + .6vh + 6px, 18px)" }}>
                Avanzando a la siguiente pregunta... ⏳
              </p>
            </SpeechBubble>
          )}

          {state === "mission_fail" && (
            <SpeechBubble variant="incorrect">
              <div className="inline-flex items-center gap-2 bg-white border-[3px] border-[#B0202D] text-[#B0202D]
                              rounded-full px-4 py-1.5 shadow-[0_3px_0_#B0202D] font-Fredoka font-extrabold text-[14px] uppercase tracking-[.08em] mb-3.5">
                <Icon name="cloud" className="w-4 h-4"/> Misión no lograda
              </div>
              <p className="font-Fredoka font-bold text-[#173951] leading-[1.2] m-0 text-balance text-center"
                 style={{ fontSize: "clamp(20px, 1.6vw + .8vh + 8px, 34px)" }}>
                ¡Oh no, aventureros! La dispersión está ganando, tendré que abandonar la isla educativa hasta una próxima aventura.
              </p>
              <p className="text-center text-[#4E6B7E] font-bold mt-3 m-0"
                 style={{ fontSize: "clamp(14px, .6vw + .6vh + 6px, 18px)" }}>
                Avanzando a la siguiente pregunta... ⏳
              </p>
            </SpeechBubble>
          )}
        </div>
      </div>

      <BottomBar
        totalQuestions={totalQuestions}
        currentStep={currentStep}
        paused={paused}
        onTogglePause={handleTogglePause}
        onNext={handleNext}
        nextLabel={nextLabel}
      />
    </div>
  );
}
