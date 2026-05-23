import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";

// ─── Animaciones que no existen en Tailwind por defecto ─────────────────────
const ANIMATIONS_CSS = `
@keyframes isla-mascotPeek { 0%,100% { transform: rotate(-4deg) translateY(0); } 50% { transform: rotate(2deg) translateY(-6px); } }
@keyframes isla-floaty     { 0%,100% { transform: translateY(0) rotate(-2deg); }  50% { transform: translateY(-10px) rotate(2deg); } }
@keyframes isla-popIn      { from { transform: translateX(-50%) translateY(20px) scale(.85); opacity: 0; } to { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; } }
@keyframes isla-fly        { from { transform: translateX(0); } to { transform: translateX(120vw); } }
.isla-anim-mascot { animation: isla-mascotPeek 4s ease-in-out infinite; transform-origin: bottom left; }
.isla-anim-floaty { animation: isla-floaty 5s ease-in-out infinite; }
.isla-anim-pop    { animation: isla-popIn .35s cubic-bezier(.2,1.4,.4,1); }
.isla-anim-fly    { animation: isla-fly 24s linear infinite; }
`;

// ─── Iconos compactos ───────────────────────────────────────────────────────
function Icon({ name, className = "w-5 h-5", strokeWidth = 2.2 }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "mail":  return <svg viewBox="0 0 24 24" className={className}><rect x="3" y="5" width="18" height="14" rx="3" {...p}/><path d="M3 7l9 7 9-7" {...p}/></svg>;
    case "lock":  return <svg viewBox="0 0 24 24" className={className}><rect x="4" y="11" width="16" height="10" rx="2.5" {...p}/><path d="M8 11V8a4 4 0 018 0v3" {...p}/></svg>;
    case "eye":   return <svg viewBox="0 0 24 24" className={className}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" {...p}/><circle cx="12" cy="12" r="3" {...p}/></svg>;
    case "eye-off": return <svg viewBox="0 0 24 24" className={className}><path d="M3 3l18 18" {...p}/><path d="M10.6 6.2A10 10 0 0112 6c6.5 0 10 7 10 7a17 17 0 01-3.4 4.3M6.5 7.5A17 17 0 012 13s3.5 7 10 7a10 10 0 005-1.3" {...p}/></svg>;
    case "user":  return <svg viewBox="0 0 24 24" className={className}><circle cx="12" cy="8" r="4" {...p}/><path d="M4 21c1-4 5-6 8-6s7 2 8 6" {...p}/></svg>;
    case "users": return <svg viewBox="0 0 24 24" className={className}><circle cx="9" cy="9" r="3.5" {...p}/><circle cx="17" cy="10" r="2.5" {...p}/><path d="M3 19c.8-3 3.5-4.5 6-4.5s5.2 1.5 6 4.5M15.5 15c1.5 0 4.5 1 5.5 4" {...p}/></svg>;
    case "book":  return <svg viewBox="0 0 24 24" className={className}><path d="M4 5a2 2 0 012-2h12v18H6a2 2 0 01-2-2V5z" {...p}/><path d="M6 19h12M9 7h6" {...p}/></svg>;
    case "school": return <svg viewBox="0 0 24 24" className={className}><path d="M3 10l9-5 9 5-9 5-9-5z" {...p}/><path d="M7 12v5c0 1 2 2.5 5 2.5s5-1.5 5-2.5v-5" {...p}/></svg>;
    case "compass": return <svg viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="9" {...p}/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" {...p}/></svg>;
    case "sparkle": return <svg viewBox="0 0 24 24" className={className}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" {...p} fill="currentColor"/></svg>;
    case "warn":  return <svg viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="9" {...p}/><path d="M12 7v6M12 16.5v.5" {...p}/></svg>;
    case "check": return <svg viewBox="0 0 24 24" className={className}><path d="M5 12l5 5 9-10" {...p}/></svg>;
    case "arrow-left": return <svg viewBox="0 0 24 24" className={className}><path d="M14 6l-6 6 6 6M20 12H8" {...p}/></svg>;
    default: return null;
  }
}

// ─── Ilustración tropical (cielo, sol, nubes, mar, palmeras, velero) ───────
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
  );
}

// ─── Input reutilizable ─────────────────────────────────────────────────────
function TextField({ label, type = "text", value, onChange, placeholder, icon, error, autoComplete }) {
  const [showPw, setShowPw] = useState(false);
  const isPw = type === "password";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="pl-1 text-[11px] font-extrabold tracking-[.08em] uppercase text-[#4E6B7E]">{label}</label>
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-[#1F8FCE] pointer-events-none">
            <Icon name={icon} className="w-5 h-5"/>
          </span>
        )}
        <input
          type={isPw && showPw ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={[
            "w-full h-[46px] rounded-2xl border-[2.5px] bg-[#FFFDF6] outline-none",
            "pl-[42px] pr-3 font-semibold text-[15px] text-[#173951] placeholder:text-[#93A6B3] placeholder:font-medium",
            "transition-[box-shadow,border-color]",
            error
              ? "border-[#E85C42] shadow-[0_0_0_4px_rgba(232,92,66,.18)]"
              : "border-[#173951] focus:border-[#1F8FCE] focus:shadow-[0_0_0_4px_rgba(31,143,206,.25)]",
          ].join(" ")}
        />
        {isPw && (
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            aria-label="Mostrar u ocultar contraseña"
            className="absolute right-2 grid place-items-center w-8 h-8 rounded-lg text-[#4E6B7E] hover:bg-[#173951]/5 hover:text-[#173951]"
          >
            <Icon name={showPw ? "eye-off" : "eye"} className="w-[18px] h-[18px]"/>
          </button>
        )}
      </div>
      {error && (
        <div className="pl-1 flex items-center gap-1 text-xs font-bold text-[#E85C42]">
          <Icon name="warn" className="w-3.5 h-3.5"/> {error}
        </div>
      )}
    </div>
  );
}

// ─── Validar contraseña ────────────────────────────────────────────────────────
function validatePassword(pw) {
  if (!pw) return "Escribe tu nueva contraseña";
  if (pw.length < 8) return "Mínimo 8 caracteres";
  if (!/[A-Z]/.test(pw)) return "Necesita al menos una mayúscula";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) return "Necesita al menos un carácter especial";
  return "";
}

// ─── Modal para recuperar contraseña (2 pasos) ──────────────────────────────────
function ForgotPasswordModal({ onClose, onSubmit, isLoading }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [resetPin, setResetPin] = useState("");
  const [userPin, setUserPin] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);

  // PASO 1: Verificar identidad
  const handleVerifyIdentity = async () => {
    console.log("[ForgotPassword] ✓✓✓ handleVerifyIdentity ejecutado");
    setError("");

    if (!email) {
      setError("Escribe tu correo");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Correo no válido");
      return;
    }
    if (!fullName.trim()) {
      setError("Escribe tu nombre completo");
      return;
    }

    try {
      console.log("[ForgotPassword] ========================================");
      console.log("[ForgotPassword] PASO 1: Verificar identidad");
      console.log("[ForgotPassword] Email a buscar:", email);
      console.log("[ForgotPassword] Nombre a buscar:", fullName.trim());

      // Primero, traer TODOS los usuarios para debugging
      console.log("[ForgotPassword] Listando TODOS los usuarios de BD...");
      const { data: allUsers, error: allError } = await supabase
        .from("users")
        .select("id, email, nombre_completo");

      if (allUsers) {
        console.log("[ForgotPassword] Usuarios en BD:");
        allUsers.forEach(u => {
          console.log(`  - Email: "${u.email}" | Nombre: "${u.nombre_completo}"`);
        });
      }

      // Ahora buscar el usuario específico con búsqueda flexible
      const { data, error: queryError } = await supabase
        .from("users")
        .select("id")
        .ilike("email", `%${email}%`)
        .ilike("nombre_completo", `%${fullName.trim()}%`)
        .single();

      console.log("[ForgotPassword] Respuesta de Supabase:");
      console.log("[ForgotPassword] Data:", data);
      console.log("[ForgotPassword] Error:", queryError);

      if (queryError) {
        console.error("[ForgotPassword] ❌ Error en consulta a BD:", queryError);
        console.error("[ForgotPassword] Código de error:", queryError?.code);
        console.error("[ForgotPassword] Mensaje:", queryError?.message);

        // Mostrar error más descriptivo
        if (queryError.code === 'PGRST116') {
          setError("El usuario no existe. Verifica email y nombre completo.");
        } else if (queryError.code === 'PGRST100') {
          setError("Error de autenticación. Necesitas una política RLS.");
        } else {
          setError(`No encontramos esa cuenta. (Error: ${queryError.code})`);
        }
        return;
      }

      if (!data) {
        console.error("[ForgotPassword] ❌ Usuario no encontrado");
        setError("No encontramos esa cuenta. Verifica email y nombre completo.");
        return;
      }

      console.log("[ForgotPassword] ✅ Usuario verificado: " + data.id);

      // Generar PIN temporal de 6 dígitos
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("[ForgotPassword] PIN generado:", pin);

      setUserId(data.id);
      setResetPin(pin);
      setStep(2);
    } catch (err) {
      console.error("[ForgotPassword] ❌ Error detectando:", err);
      setError(err.message || "Error al verificar identidad");
    }
  };

  // PASO 2: Cambiar contraseña
  const handleChangePassword = async () => {
    setError("");

    if (!userPin) {
      setError("Copia el código de arriba y pégalo aquí");
      return;
    }

    if (userPin !== resetPin) {
      setError("Código de verificación incorrecto");
      return;
    }

    if (!newPw) {
      setError("Escribe tu nueva contraseña");
      return;
    }

    const pwError = validatePassword(newPw);
    if (pwError) {
      setError(pwError);
      return;
    }

    if (newPw !== confirmPw) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    try {
      console.log("[ForgotPassword] Código verificado, cambiando contraseña para usuario:", userId);

      // Llamar a Supabase Function para cambiar contraseña
      const response = await fetch(
        'https://zukvgusyfhwlawbsxtdi.functions.supabase.co/reset-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            password: newPw,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("[ForgotPassword] Error de función:", result);
        setError(result.error || "Error al cambiar contraseña");
        return;
      }

      console.log("[ForgotPassword] ✅ Contraseña cambiada exitosamente");
      setSuccess(true);
      setTimeout(() => onClose?.(), 2500);
    } catch (err) {
      console.error("[ForgotPassword] Error:", err);
      setError(err.message || "Error al cambiar contraseña");
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4">
        <div className="bg-[#FFFDF6] border-[3px] border-[#173951] rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className="text-5xl mb-4">🌊</div>
          <p className="text-[#0E5C8A] font-bold text-[18px] mb-2">¡Contraseña actualizada!</p>
          <p className="text-[#4E6B7E] text-sm">¡Aventurero, ya puedes zarpar con tu nueva contraseña!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#FFFDF6] border-[3px] border-[#173951] rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-1.5 rounded-full" style={{
            background: step === 1 ? "#1F8FCE" : "#E4F6FB",
            transition: "all 0.3s ease"
          }}/>
          <div className="flex-1 h-1.5 rounded-full" style={{
            background: step === 2 ? "#1F8FCE" : "#E4F6FB",
            transition: "all 0.3s ease"
          }}/>
        </div>

        {step === 1 ? (
          <>
            <h3 className="font-[Fredoka] font-bold text-lg text-[#173951] mb-2">Verificar identidad</h3>
            <p className="text-[12px] text-[#4E6B7E] mb-4 font-semibold">PASO 1 de 2</p>
            <div className="flex flex-col gap-3">
              <TextField
                label="Correo"
                type="email"
                icon="mail"
                value={email}
                onChange={setEmail}
                placeholder="tu@correo.com"
                error={error}
              />
              <TextField
                label="Nombre completo"
                type="text"
                icon="user"
                value={fullName}
                onChange={setFullName}
                placeholder="Tu nombre como lo registraste"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border-[2.5px] border-[#173951] text-[#173951] font-bold text-sm hover:bg-[#F1ECDB] transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleVerifyIdentity}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#1F8FCE] text-white font-bold text-sm hover:bg-[#0E5C8A] disabled:opacity-60 transition shadow-[0_3px_0_#0E5C8A]"
                >
                  {isLoading ? "Verificando..." : "Verificar identidad"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-[Fredoka] font-bold text-lg text-[#173951] mb-2">Nueva contraseña</h3>
            <p className="text-[12px] text-[#4E6B7E] mb-4 font-semibold">PASO 2 de 2</p>

            <div className="bg-[#E4F6FB] border-[2.5px] border-[#1F8FCE] rounded-lg p-3 mb-3">
              <p className="text-[12px] font-bold text-[#0E5C8A] mb-1">🔐 Tu código de verificación:</p>
              <p className="font-mono text-[24px] font-bold text-[#173951] tracking-wider text-center">{resetPin}</p>
              <p className="text-[11px] text-[#4E6B7E] mt-1">Cópialo y pégalo abajo para continuar</p>
            </div>

            <div className="flex flex-col gap-3">
              <TextField
                label="Código de verificación"
                type="text"
                icon="lock"
                value={userPin}
                onChange={setUserPin}
                placeholder="Copia el código de arriba"
                error={error && error.includes("código") ? error : ""}
              />
              <TextField
                label="Nueva contraseña"
                type="password"
                icon="lock"
                value={newPw}
                onChange={setNewPw}
                placeholder="••••••••"
                error={error && error.includes("nueva") ? error : ""}
              />
              <TextField
                label="Confirmar nueva"
                type="password"
                icon="lock"
                value={confirmPw}
                onChange={setConfirmPw}
                placeholder="••••••••"
                error={error && error.includes("coinciden") ? error : ""}
              />
              <div className="bg-[#FFE0D6] border-[2px] border-[#FF8763] rounded-lg p-3 text-[11px] font-semibold text-[#C84B35] space-y-1">
                <div>✓ Mínimo 8 caracteres</div>
                <div>✓ Una mayúscula (A-Z)</div>
                <div>✓ Un carácter especial (!@#$%...)</div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(""); setNewPw(""); setConfirmPw(""); }}
                  className="flex-1 px-4 py-2.5 rounded-lg border-[2.5px] border-[#173951] text-[#173951] font-bold text-sm hover:bg-[#F1ECDB] transition"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#2BA15C] text-white font-bold text-sm hover:bg-[#1B7A45] disabled:opacity-60 transition shadow-[0_3px_0_#1B7A45]"
                >
                  {isLoading ? "Cambiando..." : "Cambiar contraseña"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Login form ─────────────────────────────────────────────────────────────
function LoginForm({ role, onGoRegister, onSubmit, isLoading }) {
  const isEstu = role === "estudiante";
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [remember, setRemember] = useState(true);
  const [errs, setErrs] = useState({});
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!email) next.email = "Escribe tu correo";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Correo no válido";
    if (!pw) next.pw = "Escribe tu contraseña";
    else if (pw.length < 4) next.pw = "Al menos 4 caracteres";
    setErrs(next);
    if (!Object.keys(next).length) onSubmit?.({ email, pw, remember, role });
  };

  const handleForgotPassword = async ({ userId, password }) => {
    setForgotLoading(true);
    try {
      console.log("[LoginForm] Cambiando contraseña para usuario:", userId);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        console.error("[LoginForm] Error en updateUser:", error);
        throw error;
      }
      console.log("[LoginForm] Contraseña cambiada exitosamente");
    } catch (err) {
      console.error("[LoginForm] Error:", err);
      throw new Error(err.message || "Error al cambiar contraseña");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-3.5" onSubmit={submit} noValidate>
      <TextField
        label="Correo" type="email" icon="mail" autoComplete="email"
        value={email}
        onChange={(v) => { setEmail(v); if (errs.email) setErrs({ ...errs, email: undefined }); }}
        placeholder={isEstu ? "marina@miescuela.edu" : "docente@miescuela.edu"}
        error={errs.email}
      />
      <TextField
        label="Contraseña" type="password" icon="lock" autoComplete="current-password"
        value={pw}
        onChange={(v) => { setPw(v); if (errs.pw) setErrs({ ...errs, pw: undefined }); }}
        placeholder="••••••••"
        error={errs.pw}
      />

      <div className="flex items-center justify-between -mt-1">
        <label className="flex items-center gap-2 text-[13px] font-semibold text-[#4E6B7E] cursor-pointer select-none">
          <input
            type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
            className="appearance-none hidden peer"
          />
          <span className="w-5 h-5 rounded-md bg-[#FFFDF6] border-[2.5px] border-[#173951] grid place-items-center transition peer-checked:bg-[#1F8FCE]
                          relative
                          peer-checked:after:content-[''] peer-checked:after:w-[10px] peer-checked:after:h-[6px]
                          peer-checked:after:border-l-[2.5px] peer-checked:after:border-b-[2.5px] peer-checked:after:border-white
                          peer-checked:after:rotate-[-45deg] peer-checked:after:translate-x-[1px] peer-checked:after:-translate-y-[1px]"/>
          Recordarme
        </label>
        <button
          type="button"
          onClick={() => setShowForgotModal(true)}
          className="text-[13px] font-bold text-[#0E5C8A] hover:text-[#E85C42] hover:underline px-0.5 py-1"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {showForgotModal && (
        <ForgotPasswordModal
          onClose={() => setShowForgotModal(false)}
          onSubmit={handleForgotPassword}
          isLoading={forgotLoading}
        />
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={[
          "mt-1 h-[54px] rounded-2xl border-[3px] border-[#173951] text-[#FFFDF6]",
          "font-[Fredoka] font-bold text-[18px] tracking-wide",
          "flex items-center justify-center gap-2 transition-all",
          "active:translate-y-[3px] disabled:opacity-60 disabled:cursor-not-allowed",
          isEstu
            ? "bg-[#2BA15C] shadow-[0_4px_0_#1B7A45,0_6px_14px_-2px_rgba(43,161,92,.4)] hover:-translate-y-px hover:shadow-[0_5px_0_#1B7A45,0_8px_18px_-2px_rgba(43,161,92,.5)] active:shadow-[0_1px_0_#1B7A45]"
            : "bg-[#FF8763] shadow-[0_4px_0_#E85C42,0_6px_14px_-2px_rgba(232,92,66,.4)] hover:-translate-y-px hover:shadow-[0_5px_0_#E85C42,0_8px_18px_-2px_rgba(232,92,66,.5)] active:shadow-[0_1px_0_#E85C42]",
        ].join(" ")}
      >
        <Icon name="compass" className="w-5 h-5"/>
        {isLoading ? "Navegando..." : "¡Zarpar a la isla!"}
      </button>

      <div className="flex items-center gap-2.5 text-[#4E6B7E] text-[12px] font-bold tracking-[.12em] mt-1
                      before:content-[''] before:h-0.5 before:bg-[#E5DCC0] before:flex-1 before:rounded-full
                      after:content-[''] after:h-0.5 after:bg-[#E5DCC0] after:flex-1 after:rounded-full">
        <span>O</span>
      </div>

      <div className="text-center text-sm font-semibold text-[#4E6B7E] mt-1">
        ¿Aún no tienes cuenta?
        <button
          type="button"
          onClick={onGoRegister}
          className="ml-1.5 px-4 py-2 rounded-full border-[2.5px] border-[#173951] bg-[#FFD874] text-[#173951]
                     font-[Fredoka] font-bold text-sm shadow-[0_3px_0_#E8B547]
                     hover:-translate-y-px hover:shadow-[0_4px_0_#E8B547] active:translate-y-[2px] active:shadow-[0_1px_0_#E8B547] transition-all"
        >
          Crea tu pasaporte
        </button>
      </div>
    </form>
  );
}

// ─── Register form ──────────────────────────────────────────────────────────
function RegisterForm({ role, onBack, onSubmit, isLoading }) {
  const isEstu = role === "estudiante";
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [code, setCode] = useState("");
  const [accept, setAccept] = useState(false);
  const [errs, setErrs] = useState({});

  const validatePassword = (password) => {
    if (password.length < 8) return "Mínimo 8 caracteres";
    if (!/[A-Z]/.test(password)) return "Necesita una mayúscula";
    if (!/[!@#$%^&*]/.test(password)) return "Necesita un carácter especial (!@#$%^&*)";
    return null;
  };

  const submit = (e) => {
    e.preventDefault();
    const n = {};
    if (!nombre) n.nombre = "Falta el nombre";
    // Apellido es opcional
    if (!email) n.email = "Escribe tu correo";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) n.email = "Correo no válido";
    if (!pw) n.pw = "Crea una contraseña";
    else {
      const pwErr = validatePassword(pw);
      if (pwErr) n.pw = pwErr;
    }
    if (pw2 !== pw) n.pw2 = "No coinciden";
    if (!accept) n.accept = "Acepta los términos";
    setErrs(n);
    if (!Object.keys(n).length) onSubmit?.({ nombre, apellido, email, pw, role });
  };

  return (
    <form className="flex flex-col gap-3.5" onSubmit={submit} noValidate>
      <button
        type="button" onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] font-bold text-[#0E5C8A] hover:text-[#E85C42] mb-1 p-0 bg-transparent"
      >
        <Icon name="arrow-left" className="w-3.5 h-3.5"/> Volver al acceso
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextField label="Nombre" icon="user" value={nombre}
          onChange={(v) => { setNombre(v); if (errs.nombre) setErrs({ ...errs, nombre: undefined }); }}
          placeholder="Marina" error={errs.nombre}/>
        <TextField label="Apellido (opcional)" icon="user" value={apellido}
          onChange={(v) => { setApellido(v); if (errs.apellido) setErrs({ ...errs, apellido: undefined }); }}
          placeholder="Pérez" error={errs.apellido}/>
      </div>

      <TextField label="Correo" type="email" icon="mail" value={email}
        onChange={(v) => { setEmail(v); if (errs.email) setErrs({ ...errs, email: undefined }); }}
        placeholder="tu@correo.com" error={errs.email}/>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextField label="Contraseña" type="password" icon="lock" value={pw}
          onChange={(v) => { setPw(v); if (errs.pw) setErrs({ ...errs, pw: undefined }); }}
          placeholder="••••••••" error={errs.pw}/>
        <TextField label="Repetir" type="password" icon="lock" value={pw2}
          onChange={(v) => { setPw2(v); if (errs.pw2) setErrs({ ...errs, pw2: undefined }); }}
          placeholder="••••••••" error={errs.pw2}/>
      </div>

      {!isEstu && (
        <TextField label="Institución" icon="school" value={code}
          onChange={(v) => setCode(v)}
          placeholder="Colegio Las Palmeras"/>
      )}

      <label className="flex items-start gap-2 leading-relaxed text-[13px] font-semibold text-[#4E6B7E] cursor-pointer select-none">
        <input
          type="checkbox" checked={accept}
          onChange={(e) => { setAccept(e.target.checked); if (errs.accept) setErrs({ ...errs, accept: undefined }); }}
          className="appearance-none hidden peer"
        />
        <span className="mt-0.5 shrink-0 w-5 h-5 rounded-md bg-[#FFFDF6] border-[2.5px] border-[#173951] grid place-items-center transition peer-checked:bg-[#1F8FCE]
                        relative
                        peer-checked:after:content-[''] peer-checked:after:w-[10px] peer-checked:after:h-[6px]
                        peer-checked:after:border-l-[2.5px] peer-checked:after:border-b-[2.5px] peer-checked:after:border-white
                        peer-checked:after:rotate-[-45deg] peer-checked:after:translate-x-[1px] peer-checked:after:-translate-y-[1px]"/>
        <span>
          Acepto los <button type="button" className="inline p-0 text-[#0E5C8A] font-bold hover:text-[#E85C42] hover:underline">términos</button> y la <button type="button" className="inline p-0 text-[#0E5C8A] font-bold hover:text-[#E85C42] hover:underline">privacidad</button> de la isla.
        </span>
      </label>
      {errs.accept && (
        <div className="pl-1 flex items-center gap-1 text-xs font-bold text-[#E85C42]">
          <Icon name="warn" className="w-3.5 h-3.5"/> {errs.accept}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={[
          "mt-1 h-[54px] rounded-2xl border-[3px] border-[#173951] text-[#FFFDF6]",
          "font-[Fredoka] font-bold text-[18px] tracking-wide",
          "flex items-center justify-center gap-2 transition-all active:translate-y-[3px] disabled:opacity-60 disabled:cursor-not-allowed",
          isEstu
            ? "bg-[#2BA15C] shadow-[0_4px_0_#1B7A45,0_6px_14px_-2px_rgba(43,161,92,.4)] hover:-translate-y-px hover:shadow-[0_5px_0_#1B7A45,0_8px_18px_-2px_rgba(43,161,92,.5)] active:shadow-[0_1px_0_#1B7A45]"
            : "bg-[#FF8763] shadow-[0_4px_0_#E85C42,0_6px_14px_-2px_rgba(232,92,66,.4)] hover:-translate-y-px hover:shadow-[0_5px_0_#E85C42,0_8px_18px_-2px_rgba(232,92,66,.5)] active:shadow-[0_1px_0_#E85C42]",
        ].join(" ")}
      >
        <Icon name="sparkle" className="w-5 h-5"/>
        {isLoading ? "Creando..." : "Crear mi pasaporte"}
      </button>
    </form>
  );
}

// ─── Componente principal ───────────────────────────────────────────────────
export default function IslaEducativaLogin({
  mascotSrc = "/come-dispersion.png",
  defaultRole = "estudiante",
  title = "Isla Educativa",
  onLogin,
  onRegister,
  showFloatingChips = true,
  showMascot = true,
}) {
  const [role, setRole] = useState(defaultRole);
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEstu = role === "estudiante";

  const handleLogin = async (data) => {
    setIsLoading(true);
    try {
      await onLogin?.(data);
      setToast(`¡Bienvenid@ a la isla, ${data.email.split("@")[0]}!`);
      setTimeout(() => setToast(null), 2400);
    } catch (err) {
      setToast(err.message || "Error al iniciar sesión");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data) => {
    setIsLoading(true);
    try {
      await onRegister?.(data);
      setToast(`¡Bienvenid@ a la isla, ${data.nombre}! 🌴`);
      // No cambiar de modo, la redirección maneja todo
      setTimeout(() => setToast(null), 2800);
    } catch (err) {
      setToast(err.message || "Error al registrarse");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const [first, ...rest] = title.split(" ");
  const second = rest.join(" ");

  return (
    <div className="relative min-h-screen grid place-items-center overflow-x-hidden font-[Nunito]
                    bg-gradient-to-b from-[#87D5EE] via-[#BCEAF7] to-[#E4F6FB]
                    py-8 px-5 text-[#173951]">
      <style>{ANIMATIONS_CSS}</style>

      <TropicalScene/>

      {/* Floating chips (esquinas) */}
      {showFloatingChips && (
        <>
          <FloatingChip className="top-[8%] left-[6%] [animation-delay:-1.5s]" icon="book"    color="#1F8FCE" label="+120 misiones"/>
          <FloatingChip className="top-[18%] right-[7%] [animation-delay:-3s]"  icon="sparkle" color="#E85C42" label="Premios diarios"/>
          <FloatingChip className="bottom-[14%] left-[5%] [animation-delay:-2.2s]" icon="users" color="#2BA15C" label="Clase en vivo"/>
          <FloatingChip className="bottom-[22%] right-[6%] [animation-delay:-.8s]" icon="compass" color="#E8B547" label="24 islas"/>
        </>
      )}

      <div className="relative z-20 w-full max-w-[440px]">
        {/* Mascota — el PNG que vas a poner tú */}
        {showMascot && (
          <img
            src={mascotSrc}
            alt="Come Dispersión, la mascota azul peluda de Isla Educativa"
            className="absolute -top-[86px] -right-[38px] w-[180px] h-[180px] z-30 pointer-events-none isla-anim-mascot
                       sm:-right-[38px] max-sm:w-[140px] max-sm:h-[140px] max-sm:-top-[68px] max-sm:-right-[20px]"
          />
        )}

        {/* Card */}
        <div className="relative bg-[#FFFDF6] border-[3px] border-[#173951] rounded-[28px]
                        shadow-[0_4px_0_0_#173951,0_18px_40px_-8px_rgba(14,92,138,0.45)]
                        p-7 sm:p-8 pb-7">
          {/* Brand */}
          <header className="text-center mb-4 relative">
            <p className="font-[Fredoka] font-medium text-[13px] tracking-[.22em] uppercase text-[#1F8FCE] mb-1.5">
              App educativa
            </p>
            <h1 className="font-[Fredoka] font-bold text-[36px] sm:text-[44px] leading-[0.95] m-0 text-[#0E5C8A] tracking-tight"
                style={{ textShadow: "2px 2px 0 #FFE9A8, 4px 4px 0 rgba(14,92,138,0.12)" }}>
              {first} <span className="text-[#FF8763]">{second}</span>
            </h1>
            <p className="text-[13.5px] font-semibold text-[#4E6B7E] mt-2">
              {mode === "login"
                ? "¡Naveguemos juntos hacia el aprendizaje!"
                : "Diseña tu pasaporte y empieza la aventura."}
            </p>
          </header>

          {/* Tabs */}
          <div role="tablist" aria-label="Tipo de usuario"
            className="grid grid-cols-2 gap-0.5 bg-[#F1ECDB] border-[2.5px] border-[#173951] rounded-full p-1 mb-5">
            <TabPill
              active={!isEstu} role="docente"
              icon="users" label="Soy Docente"
              onClick={() => setRole("docente")}
              disabled={mode === "login"}
            />
            <TabPill
              active={isEstu} role="estudiante"
              icon="book" label="Soy Estudiante"
              onClick={() => setRole("estudiante")}
              disabled={mode === "login"}
            />
          </div>

          {mode === "login" ? (
            <LoginForm role={role} onSubmit={handleLogin} onGoRegister={() => setMode("register")} isLoading={isLoading}/>
          ) : (
            <RegisterForm role={role} onBack={() => setMode("login")} onSubmit={handleRegister} isLoading={isLoading}/>
          )}
        </div>

        <p className="text-center mt-4 text-xs font-semibold text-[#0E5C8A]/70 relative z-10">
          © 2026 Isla Educativa · Una aventura para aprender 🌊
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] isla-anim-pop
                        flex items-center gap-2 px-5 py-3 rounded-full
                        bg-[#2BA15C] text-white border-[2.5px] border-[#0f4f2c]
                        shadow-[0_4px_0_#0f4f2c] font-[Fredoka] font-bold text-sm">
          <Icon name="check" className="w-[18px] h-[18px]" strokeWidth={3}/> {toast}
        </div>
      )}
    </div>
  );
}

// ─── Subcomponentes pequeños ────────────────────────────────────────────────
function TabPill({ active, role, icon, label, onClick, disabled }) {
  const activeClasses = active
    ? (role === "estudiante"
      ? "bg-[#2BA15C] text-[#FFFDF6] shadow-[0_2px_0_#1B7A45,inset_0_1px_0_rgba(255,255,255,.25)]"
      : "bg-[#1F8FCE] text-[#FFFDF6] shadow-[0_2px_0_#0E5C8A,inset_0_1px_0_rgba(255,255,255,.25)]")
    : "text-[#4E6B7E] hover:text-[#173951]";

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      role="tab" aria-selected={active} onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full
                  font-[Fredoka] font-semibold text-[14.5px] tracking-tight
                  transition-colors ${activeClasses} ${disabledClasses}`}
    >
      <Icon name={icon} className="w-4 h-4"/>
      {label}
    </button>
  );
}

function FloatingChip({ className = "", icon, color, label }) {
  return (
    <div className={`hidden sm:flex absolute z-10 isla-anim-floaty items-center gap-2
                     bg-[#FFFDF6] border-[2.5px] border-[#173951] rounded-2xl px-3.5 py-2
                     font-[Fredoka] font-bold text-[13px] text-[#173951]
                     shadow-[0_3px_0_#173951] ${className}`}>
      <span style={{ color }}><Icon name={icon} className="w-4 h-4"/></span>
      {label}
    </div>
  );
}
