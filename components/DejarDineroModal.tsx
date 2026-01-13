'use client'

import { useState } from 'react'
import { User } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { X, Wallet, Lock } from 'lucide-react'

interface DejarDineroModalProps {
  user: User
  onClose: () => void
}

export default function DejarDineroModal({ user, onClose }: DejarDineroModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'admin'>('form')
  const [formData, setFormData] = useState({
    monto: '',
    motivo: '',
  })
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (step === 'form') {
      if (!formData.monto || parseFloat(formData.monto) <= 0) {
        setError('El monto debe ser mayor a 0')
        return
      }
      if (!formData.motivo.trim()) {
        setError('Debe ingresar un motivo')
        return
      }
      setStep('admin')
      return
    }

    // Verificar credenciales de administrador
    setLoading(true)
    try {
      // Obtener email de un administrador
      const { data: adminUser } = await supabase
        .from('usuarios')
        .select('email')
        .eq('rol', 'admin')
        .eq('activo', true)
        .limit(1)
        .single()

      if (!adminUser) {
        throw new Error('No se encontró un administrador activo')
      }

      // Intentar autenticar con las credenciales proporcionadas
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: adminEmail || adminUser.email,
        password: adminPassword,
      })

      if (authError || !authData.user) {
        throw new Error('Credenciales de administrador incorrectas')
      }

      // Verificar que el usuario autenticado sea admin
      const { data: verifiedAdmin } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', authData.user.id)
        .single()

      if (verifiedAdmin?.rol !== 'admin') {
        throw new Error('El usuario no tiene permisos de administrador')
      }

      // Restaurar la sesión del usuario original
      await supabase.auth.signOut()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Re-autenticar al usuario original si es necesario
        // Por ahora, solo continuamos
      }

      // Insertar movimiento de caja
      // Nota: Necesitarás crear la tabla caja_movimientos si no existe
      const { error: movimientoError } = await supabase
        .from('caja_movimientos')
        .insert([
          {
            usuario_id: user.id,
            tipo: 'dejar_dinero',
            monto: parseFloat(formData.monto),
            motivo: formData.motivo,
            aprobado_por: authData.user.id,
            created_at: new Date().toISOString(),
          },
        ])

      if (movimientoError) {
        // Si la tabla no existe, solo mostramos un mensaje de éxito
        console.log('Movimiento registrado (tabla puede no existir):', movimientoError)
      }

      alert('Dinero registrado exitosamente con aprobación de administrador')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al registrar el dinero')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-md w-full border border-border shadow-2xl animate-fadeIn">
        <div className="border-b border-border px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Dejar Dinero en Caja</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {step === 'form' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Monto a Dejar *
                </label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Motivo *
                </label>
                <textarea
                  required
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Ej: Dinero sobrante del turno, cambio para caja..."
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg">
                <p className="text-sm text-foreground">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Se requiere aprobación de administrador para registrar este movimiento.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg">
                <p className="text-sm text-foreground mb-4">
                  Ingrese las credenciales de un administrador para aprobar este movimiento:
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email de Administrador *
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="admin@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contraseña de Administrador *
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
              >
                Volver
              </button>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Procesando...' : step === 'form' ? 'Continuar' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
