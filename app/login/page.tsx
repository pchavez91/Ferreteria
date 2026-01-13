'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LogIn, Loader2 } from 'lucide-react'
import Footer from '@/components/Footer'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()

  // Verificar si ya hay una sesión activa al cargar la página
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Si hay sesión, verificar el usuario y redirigir apropiadamente
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (usuario && usuario.activo) {
          // Redirigir según el rol
          // Página de caja temporalmente deshabilitada
          if (usuario.rol === 'caja') {
            // No redirigir, dejar que el usuario vea el formulario de login
            // con un mensaje de que la funcionalidad está deshabilitada
            setCheckingSession(false)
            return
          } else {
            router.push('/dashboard')
          }
          return
        }
      }
      setCheckingSession(false)
    }
    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { data: usuario, error: usuarioError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (usuarioError) {
          throw new Error('Error al obtener datos del usuario')
        }

        // Verificar si el usuario está activo
        if (!usuario || !usuario.activo) {
          // Cerrar sesión si el usuario está inactivo
          await supabase.auth.signOut()
          throw new Error('Tu cuenta ha sido desactivada. Ya no perteneces a esta tienda. Por favor, contacta al administrador.')
        }

        // Actualizar sesión del usuario
        await supabase
          .from('sesiones_usuarios')
          .upsert({
            usuario_id: usuario.id,
            ultima_conexion: new Date().toISOString(),
            hora_conexion: new Date().toISOString(),
            esta_activo: true,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'usuario_id'
          })

        // Redirigir según el rol del usuario
        // Página de caja temporalmente deshabilitada
        if (usuario.rol === 'caja') {
          // Mostrar mensaje de que la funcionalidad está deshabilitada
          setError('La funcionalidad de caja está temporalmente deshabilitada. Por favor, contacta al administrador.')
          setLoading(false)
          return
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  // Mostrar loading mientras se verifica la sesión
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-background to-background"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMzQxNTUiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="max-w-md w-full bg-card rounded-xl shadow-2xl p-8 relative z-10 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-lg">
              <LogIn className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Sistema de Ferretería</h1>
            <p className="text-muted-foreground mt-2">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}
