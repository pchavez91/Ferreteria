'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { User } from '@/lib/types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error || !usuario) {
        router.push('/login')
        return
      }

      // Verificar si el usuario está activo
      if (!usuario.activo) {
        await supabase.auth.signOut()
        router.push('/login')
        return
      }

      // Verificar si ya existe una sesión activa, si no, establecer hora_conexion
      const { data: sesionExistente } = await supabase
        .from('sesiones_usuarios')
        .select('hora_conexion, esta_activo')
        .eq('usuario_id', usuario.id)
        .single()

      const ahora = new Date().toISOString()
      const horaInicioSesion = sesionExistente?.esta_activo && sesionExistente?.hora_conexion 
        ? sesionExistente.hora_conexion 
        : ahora

      // Actualizar sesión del usuario como activo
      await supabase
        .from('sesiones_usuarios')
        .upsert({
          usuario_id: usuario.id,
          ultima_conexion: ahora,
          hora_conexion: horaInicioSesion,
          esta_activo: true,
          updated_at: ahora,
        }, {
          onConflict: 'usuario_id'
        })

      setUser(usuario)
      
      // Usuarios de caja redirigir a inicio de turno
      if (usuario.rol === 'caja') {
        router.push('/caja/inicio-turno')
        return
      }
      
      setLoading(false)
    }

    checkAuth()

    // Actualizar estado cuando el usuario cierra sesión o se desactiva
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        // Marcar sesión como inactiva si había un usuario
        setUser((currentUser) => {
          if (currentUser) {
            supabase
              .from('sesiones_usuarios')
              .update({ esta_activo: false, updated_at: new Date().toISOString() })
              .eq('usuario_id', currentUser.id)
          }
          return null
        })
        router.push('/login')
      } else {
        // Verificar si el usuario sigue activo
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('activo')
          .eq('id', session.user.id)
          .single()

        if (!usuario?.activo) {
          await supabase.auth.signOut()
          router.push('/login')
        } else {
          // Verificar si ya existe una sesión activa
          const { data: sesionExistente } = await supabase
            .from('sesiones_usuarios')
            .select('hora_conexion, esta_activo')
            .eq('usuario_id', session.user.id)
            .single()

          const ahora = new Date().toISOString()
          const horaInicioSesion = sesionExistente?.esta_activo && sesionExistente?.hora_conexion 
            ? sesionExistente.hora_conexion 
            : ahora

          // Actualizar sesión como activa
          await supabase
            .from('sesiones_usuarios')
            .upsert({
              usuario_id: session.user.id,
              ultima_conexion: ahora,
              hora_conexion: horaInicioSesion,
              esta_activo: true,
              updated_at: ahora,
            }, {
              onConflict: 'usuario_id'
            })
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])

  // Página de caja temporalmente deshabilitada - cerrar sesión si es usuario de caja
  useEffect(() => {
    if (user && user.rol === 'caja') {
      supabase.auth.signOut().then(() => {
        router.push('/login')
      })
    }
  }, [user, router])

  // Efecto separado para manejar desconexión cuando user está disponible
  useEffect(() => {
    if (!user) return
    if (user.rol === 'caja') return // No ejecutar para usuarios de caja

    // Detectar desconexión del navegador/ventana
    const handleBeforeUnload = () => {
      // Usar sendBeacon para enviar la actualización incluso si la página se cierra
      const data = JSON.stringify({
        usuario_id: user.id,
        esta_activo: false,
        updated_at: new Date().toISOString()
      })
      // Nota: sendBeacon requiere un endpoint específico, por ahora usamos una actualización directa
      // En producción, podrías crear un endpoint API route para esto
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sesiones_usuarios?usuario_id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
        },
        body: JSON.stringify({ esta_activo: false, updated_at: new Date().toISOString() }),
        keepalive: true
      }).catch(() => {}) // Ignorar errores en beforeunload
    }

    // Detectar cuando la pestaña/ventana pierde el foco
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Marcar como inactivo cuando la pestaña no está visible
        supabase
          .from('sesiones_usuarios')
          .update({ esta_activo: false, updated_at: new Date().toISOString() })
          .eq('usuario_id', user.id)
          .then(() => {})
      } else {
        // Marcar como activo cuando la pestaña vuelve a estar visible
        supabase
          .from('sesiones_usuarios')
          .update({ 
            esta_activo: true, 
            ultima_conexion: new Date().toISOString(),
            updated_at: new Date().toISOString() 
          })
          .eq('usuario_id', user.id)
          .then(() => {})
      }
    }

    // Heartbeat para mantener la sesión activa mientras el usuario está conectado
    const heartbeatInterval = setInterval(async () => {
      if (!document.hidden && user) {
        await supabase
          .from('sesiones_usuarios')
          .update({ 
            ultima_conexion: new Date().toISOString(),
            esta_activo: true,
            updated_at: new Date().toISOString() 
          })
          .eq('usuario_id', user.id)
      }
    }, 30000) // Cada 30 segundos

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(heartbeatInterval)
      // Marcar sesión como inactiva al desmontar
      if (user) {
        supabase
          .from('sesiones_usuarios')
          .update({ esta_activo: false, updated_at: new Date().toISOString() })
          .eq('usuario_id', user.id)
          .then(() => {})
      }
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Página de caja temporalmente deshabilitada
  // Si es usuario de caja, mostrar mensaje mientras se redirige
  if (user.rol === 'caja') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">La funcionalidad de caja está temporalmente deshabilitada. Redirigiendo...</p>
        </div>
      </div>
    )
  }

  // Layout especial para POS (sin sidebar)
  if (pathname === '/pos' || pathname.startsWith('/pos')) {
    return (
      <div className="h-screen bg-background flex flex-col relative">
        <Header user={user} />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background/50 overflow-hidden">
      <Sidebar user={user} currentPath={pathname || ''} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-background/95">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  )
}
