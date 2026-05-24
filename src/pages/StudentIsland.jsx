import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import IslaEducativaEstudiante from "./IslaEducativaEstudiante";

export default function StudentIsland() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("Aventurero");
  const [missions, setMissions] = useState([]);
  const [linkedTeachers, setLinkedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showTeachersModal, setShowTeachersModal] = useState(false);
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [joiningClass, setJoiningClass] = useState(false);
  const [toast, setToast] = useState(null);

  // Cargar datos del estudiante y sus misiones
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/");
          return;
        }

        setStudentId(user.id);

        // Obtener nombre del estudiante
        const fullName = user.user_metadata?.full_name || user.user_metadata?.nombre_completo || "Aventurero";
        setStudentName(fullName);
        console.log("[StudentIsland] Nombre:", fullName);

        // Obtener docentes vinculados
        const { data: teacherLinks, error: linksError } = await supabase
          .from("teacher_students")
          .select("docente_id")
          .eq("estudiante_id", user.id);

        if (linksError) throw linksError;

        if (!teacherLinks || teacherLinks.length === 0) {
          console.log("[StudentIsland] Sin docentes vinculados");
          setMissions([]);
          setLoading(false);
          return;
        }

        const teacherIds = teacherLinks.map(t => t.docente_id);
        console.log("[StudentIsland] Docentes vinculados:", teacherIds.length);

        // Obtener info de los docentes
        const { data: docentesData } = await supabase
          .from("users")
          .select("id, nombre_completo")
          .in("id", teacherIds);

        // Obtener misiones activas de esos docentes (TODAS JUNTAS)
        const { data: missionsData, error: missionsError } = await supabase
          .from("missions")
          .select("*")
          .in("docente_id", teacherIds)
          .eq("estado", "activa")
          .order("created_at", { ascending: false });

        if (missionsError) throw missionsError;

        console.log("[StudentIsland] Misiones obtenidas:", missionsData?.length || 0);

        // Obtener estado de cada misión para este estudiante
        const { data: studentMissionsData, error: smError } = await supabase
          .from("student_missions")
          .select("*")
          .eq("estudiante_id", user.id);

        if (smError) throw smError;

        // Mapear misiones con su estado y nombre del docente
        const formattedMissions = (missionsData || []).map(m => {
          const docente = docentesData?.find(d => d.id === m.docente_id);
          return {
            id: m.id,
            subject: m.titulo,
            topic: m.descripcion,
            descripcion: m.descripcion,
            texto_reto: m.texto_reto,
            retroalimentacion_exito: m.retroalimentacion_exito,
            retroalimentacion_fallo: m.retroalimentacion_fallo,
            completada: studentMissionsData?.some(
              sm => sm.mision_id === m.id && sm.estado === "completada"
            ) || false,
            isNew: !studentMissionsData?.some(sm => sm.mision_id === m.id),
            docenteNombre: docente?.nombre_completo || "Profesor",
          };
        });

        setMissions(formattedMissions);
        console.log("[StudentIsland] Misiones formateadas:", formattedMissions.length);

        // Obtener docentes vinculados
        const { data: teachersData, error: teachersError } = await supabase
          .from("teacher_students")
          .select("docente_id")
          .eq("estudiante_id", user.id)
          .order("fecha_inscripcion", { ascending: true });

        if (teachersError) {
          console.error("[StudentIsland] Error obteniendo docentes:", teachersError);
        } else if (teachersData && teachersData.length > 0) {
          const teacherIds = teachersData.map(ts => ts.docente_id);
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("id, nombre_completo")
            .in("id", teacherIds);

          if (usersError) {
            console.error("[StudentIsland] Error obteniendo nombres de docentes:", usersError);
          } else {
            const teachers = usersData || [];
            console.log("[StudentIsland] Docentes vinculados:", teachers.length);
            setLinkedTeachers(teachers);
          }
        } else {
          setLinkedTeachers([]);
        }
      } catch (error) {
        console.error("[StudentIsland] Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Suscribirse a cambios en tiempo real de misiones
  useEffect(() => {
    if (!studentId) return;

    const reloadMissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: vinculados } = await supabase
          .from("teacher_students")
          .select("docente_id")
          .eq("estudiante_id", user.id);

        if (!vinculados || vinculados.length === 0) {
          setMissions([]);
          return;
        }

        const docenteIds = vinculados.map(v => v.docente_id);

        const { data: docentesData } = await supabase
          .from("users")
          .select("id, nombre_completo")
          .in("id", docenteIds);

        const { data: missionsData } = await supabase
          .from("missions")
          .select("*")
          .in("docente_id", docenteIds)
          .eq("estado", "activa")
          .order("created_at", { ascending: false });

        const { data: studentMissionsData } = await supabase
          .from("student_missions")
          .select("*")
          .eq("estudiante_id", user.id);

        const formattedMissions = (missionsData || []).map(m => {
          const docente = docentesData?.find(d => d.id === m.docente_id);
          return {
            id: m.id,
            subject: m.titulo,
            topic: m.descripcion,
            descripcion: m.descripcion,
            texto_reto: m.texto_reto,
            retroalimentacion_exito: m.retroalimentacion_exito,
            retroalimentacion_fallo: m.retroalimentacion_fallo,
            completada: studentMissionsData?.some(
              sm => sm.mision_id === m.id && sm.estado === "completada"
            ) || false,
            isNew: !studentMissionsData?.some(sm => sm.mision_id === m.id),
            docenteNombre: docente?.nombre_completo || "Profesor",
          };
        });

        setMissions(formattedMissions);
        console.log("[StudentIsland] Misiones recargadas en tiempo real:", formattedMissions.length);

        // Recargar también docentes vinculados
        const { data: teachersData } = await supabase
          .from("teacher_students")
          .select("docente_id, users!inner(id, nombre_completo)")
          .eq("estudiante_id", user.id)
          .order("created_at", { ascending: true });

        const teachers = teachersData?.map(ts => ({
          id: ts.docente_id,
          nombre_completo: ts.users?.nombre_completo || "Profesor"
        })) || [];
        setLinkedTeachers(teachers);
      } catch (error) {
        console.error("[StudentIsland] Error recargando misiones en tiempo real:", error);
      }
    };

    // Suscribirse a cambios en la tabla missions Y student_missions
    const channel = supabase.channel(`student-${studentId}`);

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "missions",
        },
        (payload) => {
          console.log("[StudentIsland] Cambio detectado en missions:", payload.eventType);
          reloadMissions();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "student_missions",
          filter: `estudiante_id=eq.${studentId}`,
        },
        (payload) => {
          console.log("[StudentIsland] Cambio detectado en student_missions:", payload.eventType);
          reloadMissions();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [studentId]);

  const handleAnswer = async ({ misionId, respuesta }) => {
    if (!studentId) return;

    try {
      console.log("[StudentIsland] Guardando respuesta para misión:", misionId);

      const { error } = await supabase
        .from("student_missions")
        .upsert(
          {
            estudiante_id: studentId,
            mision_id: misionId,
            respuesta_estudiante: respuesta,
            estado: "completada",
            fecha_completacion: new Date().toISOString(),
          },
          { onConflict: "estudiante_id,mision_id" }
        );

      if (error) throw error;
      console.log("[StudentIsland] Respuesta guardada exitosamente");

      // Actualizar estado local de la misión
      setMissions(prev => prev.map(m =>
        m.id === misionId ? { ...m, completada: true } : m
      ));
    } catch (error) {
      console.error("[StudentIsland] Error guardando respuesta:", error);
      throw error;
    }
  };

  const handleUnirseAClase = async () => {
    console.log("[StudentIsland] Botón unirse clickeado");

    if (!codigoIngresado.trim()) {
      showToastMessage("Por favor ingresa el código");
      return;
    }

    console.log("[StudentIsland] Intentando unirse con código:", codigoIngresado);
    setJoiningClass(true);
    try {
      if (!studentId) throw new Error("No hay sesión activa");

      // Llamar función RPC para unirse a clase
      const { data, error } = await supabase.rpc('join_class', {
        p_codigo_clase: codigoIngresado.toUpperCase()
      });

      console.log("[StudentIsland] Respuesta RPC completa:", { data, error });
      console.log("[StudentIsland] data:", JSON.stringify(data));
      console.log("[StudentIsland] error:", JSON.stringify(error));

      if (error) {
        console.error("[StudentIsland] Error RPC:", error);
        throw error;
      }

      if (!data || !data.success) {
        showToastMessage(data?.message || "Error al unirse a la clase");
        return;
      }

      // Éxito
      console.log("[StudentIsland] Unión exitosa");
      showToastMessage(`${data.message} 🎉`);
      setCodigoIngresado("");
      setShowJoinModal(false);

      // Recargar misiones
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: vinculados } = await supabase
        .from("teacher_students")
        .select("docente_id")
        .eq("estudiante_id", user.id);

      if (vinculados && vinculados.length > 0) {
        const docenteIds = vinculados.map(v => v.docente_id);

        // Obtener info de docentes
        const { data: docentesData } = await supabase
          .from("users")
          .select("id, nombre_completo")
          .in("id", docenteIds);

        // Obtener todas las misiones activas (TODAS JUNTAS)
        const { data: missionsData } = await supabase
          .from("missions")
          .select("*")
          .in("docente_id", docenteIds)
          .eq("estado", "activa")
          .order("created_at", { ascending: false });

        const { data: studentMissionsData } = await supabase
          .from("student_missions")
          .select("*")
          .eq("estudiante_id", user.id);

        const formattedMissions = (missionsData || []).map(m => {
          const docente = docentesData?.find(d => d.id === m.docente_id);
          return {
            id: m.id,
            subject: m.titulo,
            topic: m.descripcion,
            descripcion: m.descripcion,
            texto_reto: m.texto_reto,
            retroalimentacion_exito: m.retroalimentacion_exito,
            retroalimentacion_fallo: m.retroalimentacion_fallo,
            completada: studentMissionsData?.some(
              sm => sm.mision_id === m.id && sm.estado === "completada"
            ) || false,
            isNew: !studentMissionsData?.some(sm => sm.mision_id === m.id),
            docenteNombre: docente?.nombre_completo || "Profesor",
          };
        });

        setMissions(formattedMissions);

        // Recargar docentes vinculados
        const { data: teachersData } = await supabase
          .from("teacher_students")
          .select("docente_id, users!inner(id, nombre_completo)")
          .eq("estudiante_id", user.id)
          .order("created_at", { ascending: true });

        const teachers = teachersData?.map(ts => ({
          id: ts.docente_id,
          nombre_completo: ts.users?.nombre_completo || "Profesor"
        })) || [];
        setLinkedTeachers(teachers);
      }
    } catch (error) {
      console.error("[StudentIsland] Error uniéndose a clase:", error);
      showToastMessage(error.message || "Código inválido 🔍");
    } finally {
      setJoiningClass(false);
    }
  };

  const showToastMessage = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("[StudentIsland] Error cerrando sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#87D5EE] to-[#E4F6FB]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F8FCE] mb-4"></div>
          <p className="text-[#4E6B7E] font-semibold">Cargando tu isla...</p>
        </div>
      </div>
    );
  }

  // Wrapper para agregar header y modal
  const missionsWithBadge = missions.map(m => ({
    ...m,
    docenteBadge: m.docenteNombre,
  }));

  return (
    <div className="relative">

      {/* Modal de docentes */}
      {showTeachersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-[#FFFDF6] border-[3px] border-[#173951] rounded-[22px] p-6 w-full max-w-[420px] shadow-[0_6px_0_#173951]">
            <h3 className="font-[Fredoka] font-bold text-[20px] text-[#173951] mb-4">Tus profes</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
              {linkedTeachers.map(teacher => (
                <div key={teacher.id} className="bg-[#E4F6FB] border-[2px] border-[#1F8FCE] rounded-lg px-4 py-3 font-semibold text-[14px] text-[#173951]">
                  👨‍🏫 {teacher.nombre_completo}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowTeachersModal(false)}
              className="w-full h-10 bg-[#1F8FCE] text-white border-[2px] border-[#173951] rounded-lg font-[Fredoka] font-bold text-[13px] shadow-[0_2px_0_#0E5C8A] hover:bg-[#0E5C8A] transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal para unirse a clase */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-[#FFFDF6] border-[3px] border-[#173951] rounded-[22px] p-6 w-full max-w-[420px] shadow-[0_6px_0_#173951]">
            <h3 className="font-[Fredoka] font-bold text-[20px] text-[#173951] mb-4">Unirme a una clase</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[12px] font-bold text-[#4E6B7E] block mb-2 uppercase tracking-[.08em]">Código</label>
                <input
                  type="text"
                  value={codigoIngresado}
                  onChange={(e) => setCodigoIngresado(e.target.value.toUpperCase())}
                  placeholder="Ej. ISLA-A1B2"
                  className="w-full h-11 rounded-lg border-[2.5px] border-[#173951] bg-[#FFFDF6] px-3
                             font-semibold text-[14px] text-[#173951] placeholder:text-[#93A6B3] outline-none
                             focus:border-[#1F8FCE] focus:shadow-[0_0_0_3px_rgba(31,143,206,.2)]
                             transition-[box-shadow,border-color]"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setCodigoIngresado("");
                  }}
                  className="h-10 rounded-lg border-[2px] border-[#173951] bg-white text-[#173951]
                             font-[Fredoka] font-bold text-[13px] shadow-[0_2px_0_#173951]
                             hover:bg-[#F4F0E0] active:translate-y-0.5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUnirseAClase}
                  disabled={joiningClass || !codigoIngresado.trim()}
                  className="h-10 rounded-lg border-[2px] border-[#173951] bg-[#2BA15C] text-white
                             font-[Fredoka] font-bold text-[13px] shadow-[0_2px_0_#1B7A45]
                             hover:bg-[#23864e] active:translate-y-0.5 disabled:opacity-50
                             disabled:cursor-not-allowed transition-all"
                >
                  {joiningClass ? "..." : "Unirme"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Componente IslaEducativaEstudiante con misiones (TODAS JUNTAS) */}
      <IslaEducativaEstudiante
        studentName={studentName}
        mascotNormal="/images/cookie-normal.png"
        mascotCelebra="/images/cookie-celebra.png"
        mascotTriste="/images/cookie-triste.png"
        missions={missionsWithBadge}
        onAnswer={handleAnswer}
        onLogout={handleLogout}
        onJoinClick={() => setShowJoinModal(true)}
        linkedTeachersCount={linkedTeachers.length}
        onTeachersClick={() => setShowTeachersModal(true)}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[10000] -translate-x-1/2
                        flex items-center gap-2 px-5 py-3 rounded-full
                        bg-[#2BA15C] text-white border-[2.5px] border-[#1B7A45]
                        shadow-[0_4px_0_#1B7A45] font-[Fredoka] font-bold text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
