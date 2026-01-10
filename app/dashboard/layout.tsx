'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
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
        console.error('Error al obtener usuario:', error)
        router.push('/login')
        return
      }

      // Verificar si el usuario está activo
      if (!usuario.activo) {
        await supabase.auth.signOut()
        router.push('/login')
        return
      }

      // Actualizar sesión del usuario como activo
      await supabase
        .from('sesiones_usuarios')
        .upsert({
          usuario_id: usuario.id,
          ultima_conexion: new Date().toISOString(),
          esta_activo: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'usuario_id'
        })

      setUser(usuario)
      
      // Redirigir usuarios de caja directamente a POS
      if (usuario.rol === 'caja' && pathname !== '/pos' && !pathname.startsWith('/pos')) {
        router.push('/pos')
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
          // Actualizar sesión como activa
          await supabase
            .from('sesiones_usuarios')
            .upsert({
              usuario_id: session.user.id,
              ultima_conexion: new Date().toISOString(),
              esta_activo: true,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'usuario_id'
            })
        }
      }
    })

    return () => {
      subscription.unsubscribe()
      // Marcar sesión como inactiva al desmontar
      if (user) {
        supabase
          .from('sesiones_usuarios')
          .update({ esta_activo: false, updated_at: new Date().toISOString() })
          .eq('usuario_id', user.id)
      }
    }
  }, [router, pathname])

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

  // Si es usuario de caja y no está en POS, mostrar loading mientras redirige
  if (user.rol === 'caja' && pathname !== '/pos' && !pathname.startsWith('/pos')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Layout especial para POS (sin sidebar)
  if (pathname === '/pos' || pathname.startsWith('/pos')) {
    return (
      <div className="h-screen bg-background overflow-hidden">
        <Header user={user} />
        {children}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar user={user} currentPath={pathname || ''} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
