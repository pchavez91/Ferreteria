'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { X, Clock, User as UserIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface CierreTurnoModalProps {
  user: User
  onClose: () => void
  onConfirmLogout: () => void
}

export default function CierreTurnoModal({ user, onClose, onConfirmLogout }: CierreTurnoModalProps) {
  const [loading, setLoading] = useState(true)
  const [horaConexion, setHoraConexion] = useState<string | null>(null)
  const [horaFin, setHoraFin] = useState<string>(new Date().toISOString())

  useEffect(() => {
    const loadData = async () => {
      try {
        // Obtener hora de conexión
        const { data: sesion } = await supabase
          .from('sesiones_usuarios')
          .select('hora_conexion')
          .eq('usuario_id', user.id)
          .single()

        if (sesion?.hora_conexion) {
          setHoraConexion(sesion.hora_conexion)
        }
      } catch (error) {
        // Error silencioso
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user.id])


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="bg-card rounded-xl max-w-2xl w-full border border-border shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto my-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Resumen de Turno</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información del Usuario */}
              <div className="flex items-center gap-4 p-5 bg-primary/10 rounded-xl border border-primary/30">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{user.nombre}</p>
                </div>
              </div>

              {/* Hora de Inicio */}
              <div className="flex items-center gap-4 p-5 bg-accent/30 rounded-xl border border-border/50">
                <Clock className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Hora de Inicio</p>
                  <p className="text-base font-semibold text-foreground">
                    {horaConexion 
                      ? format(new Date(horaConexion), "PPpp", { locale: es })
                      : 'No disponible'
                    }
                  </p>
                </div>
              </div>

              {/* Hora de Fin */}
              <div className="flex items-center gap-4 p-5 bg-accent/30 rounded-xl border border-border/50">
                <Clock className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Hora de Fin</p>
                  <p className="text-base font-semibold text-foreground">
                    {format(new Date(horaFin), "PPpp", { locale: es })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmLogout}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}
