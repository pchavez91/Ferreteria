'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/types'
import { LogOut, Clock, DollarSign } from 'lucide-react'
import InicioTurnoModal from '@/components/InicioTurnoModal'
import CierreTurnoModal from '@/components/CierreTurnoModal'
import Footer from '@/components/Footer'

export default function InicioTurnoPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInicioTurnoModal, setShowInicioTurnoModal] = useState(false)
  const [showCierreTurnoModal, setShowCierreTurnoModal] = useState(false)
  const [turnoActivo, setTurnoActivo] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    checkTurnoActivo()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!usuario || usuario.rol !== 'caja' || !usuario.activo) {
        await supabase.auth.signOut()
        router.push('/login')
        return
      }

      setUser(usuario)
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const checkTurnoActivo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: turno } = await supabase
        .from('turnos_caja')
        .select('*')
        .eq('usuario_id', session.user.id)
        .eq('estado', 'activo')
        .order('fecha_inicio', { ascending: false })
        .limit(1)
        .single()

      if (turno) {
        setTurnoActivo(turno)
        // Si hay turno activo, redirigir a POS
        router.push('/pos')
      }
    } catch (error) {
      // No hay turno activo, mostrar formulario de inicio
      console.log('No hay turno activo')
    }
  }

  const handleIniciarTurno = () => {
    setShowInicioTurnoModal(true)
  }

  const handleTurnoIniciado = () => {
    router.push('/pos')
  }

  const handleLogout = () => {
    setShowCierreTurnoModal(true)
  }

  const handleConfirmLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Inicio de Turno</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg font-medium transition-all duration-200 hover:shadow-md border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full bg-card rounded-xl shadow-2xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
              <DollarSign className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Bienvenido, {user.nombre}</h2>
            <p className="text-muted-foreground">Para comenzar tu turno, completa el formulario de inicio</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-accent/30 p-4 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">Instrucciones:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Completa todos los datos solicitados</li>
                <li>Indica el monto inicial en caja (billetes y monedas)</li>
                <li>Verifica que todos los datos sean correctos antes de iniciar</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleIniciarTurno}
            className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg text-lg flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5" />
            Iniciar Turno
          </button>
        </div>
      </div>

      <Footer />

      {showInicioTurnoModal && user && (
        <InicioTurnoModal
          user={user}
          onClose={() => setShowInicioTurnoModal(false)}
          onTurnoIniciado={handleTurnoIniciado}
        />
      )}

      {showCierreTurnoModal && user && (
        <CierreTurnoModal
          user={user}
          onClose={() => setShowCierreTurnoModal(false)}
          onConfirmLogout={handleConfirmLogout}
        />
      )}
    </div>
  )
}
