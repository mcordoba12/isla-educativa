import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

function Icon({ name, className = "w-5 h-5" }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" }
  switch (name) {
    case "logout": return <svg viewBox="0 0 24 24" className={className} {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
    case "check": return <svg viewBox="0 0 24 24" className={className} {...p}><path d="M5 12l5 5 9-10"/></svg>
    case "x": return <svg viewBox="0 0 24 24" className={className} {...p}><path d="M18 6l-12 12M6 6l12 12"/></svg>
    default: return null
  }
}

export default function LogoutButton() {
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setToast('¡Hasta pronto, aventurero! 👋')
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (error) {
      setToast('Error al cerrar sesión')
      setTimeout(() => setToast(null), 3000)
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                   bg-[#FF8763] hover:bg-[#E85C42] text-white
                   border-2 border-[#173951]
                   font-[Fredoka] font-bold text-sm
                   shadow-[0_2px_0_#173951]
                   transition-all active:translate-y-[2px] active:shadow-[0_0_0_#173951]"
      >
        <Icon name="logout" className="w-4 h-4" />
        <span>Cerrar sesión</span>
      </button>

      {/* Confirmación modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .modal-enter { animation: slideUp 0.2s cubic-bezier(0.2, 1.4, 0.4, 1); }
          `}</style>
          <div className="bg-[#FFFDF6] border-[3px] border-[#173951] rounded-[24px]
                          shadow-[0_4px_0_0_#173951,0_18px_40px_-8px_rgba(14,92,138,0.45)]
                          p-6 max-w-sm w-full modal-enter">
            <h2 className="font-[Fredoka] font-bold text-xl text-[#173951] mb-2">
              ¿Seguro que quieres abandonar la isla? 🌊
            </h2>
            <p className="text-[#4E6B7E] text-sm mb-6">
              Cuando regreses, tu progreso te estará esperando.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-[#173951]
                          bg-[#F1ECDB] text-[#173951]
                          font-[Fredoka] font-bold text-sm
                          hover:bg-[#E4D9C3] transition-all
                          disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Icon name="x" className="w-4 h-4 inline mr-2" />
                Quedarse
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-[#173951]
                          bg-[#FF8763] text-white
                          font-[Fredoka] font-bold text-sm
                          hover:bg-[#E85C42] transition-all
                          disabled:opacity-60 disabled:cursor-not-allowed
                          shadow-[0_2px_0_#173951]
                          active:translate-y-[2px] active:shadow-[0_0_0_#173951]"
              >
                <Icon name="check" className="w-4 h-4 inline mr-2" />
                {isLoading ? 'Saliendo...' : 'Sí, salir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <>
          <style>{`
            @keyframes slideUpToast {
              from { opacity: 0; transform: translateX(-50%) translateY(20px); }
              to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            .toast-enter { animation: slideUpToast 0.3s ease-out; }
          `}</style>
          <div className="fixed bottom-6 left-1/2 z-[10000]
                          flex items-center gap-2 px-5 py-3 rounded-full
                          bg-[#2BA15C] text-white border-[2.5px] border-[#0f4f2c]
                          shadow-[0_4px_0_#0f4f2c] font-[Fredoka] font-bold text-sm
                          toast-enter">
            <Icon name="check" className="w-[18px] h-[18px]" strokeWidth={3} />
            {toast}
          </div>
        </>
      )}
    </>
  )
}
