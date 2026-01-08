'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User, UserRole } from '@/lib/types'
import { X } from 'lucide-react'

interface UsuarioModalProps {
  usuario: User | null
  onClose: () => void
}

export default function UsuarioModal({ usuario, onClose }: UsuarioModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    rol: 'caja' as UserRole,
    activo: true,
  })

  useEffect(() => {
    if (usuario) {
      setFormData({
        email: usuario.email || '',
        password: '',
        nombre: usuario.nombre || '',
        rol: usuario.rol,
        activo: usuario.activo ?? true,
      })
    }
  }, [usuario])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (usuario) {
        // Actualizar usuario existente
        const updateData: any = {
          nombre: formData.nombre,
          rol: formData.rol,
          activo: formData.activo,
        }

        const { error } = await supabase
          .from('usuarios')
          .update(updateData)
          .eq('id', usuario.id)

        if (error) throw error

        // Nota: La actualización de contraseña debe hacerse desde el cliente del usuario
        // o usando funciones serverless. Por ahora, solo actualizamos los datos del usuario.
        if (formData.password) {
          // Para actualizar la contraseña, el usuario debe hacerlo desde su perfil
          // o usar una función serverless/API route
          console.warn('La actualización de contraseña requiere configuración adicional')
        }
      } else {
        // Crear nuevo usuario
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
        })

        if (authError) throw authError

        if (authData.user) {
          const { error } = await supabase.from('usuarios').insert([
            {
              id: authData.user.id,
              email: formData.email,
              nombre: formData.nombre,
              rol: formData.rol,
              activo: formData.activo,
            },
          ])

          if (error) throw error
        }
      }

      onClose()
    } catch (error: any) {
      console.error('Error al guardar usuario:', error)
      alert(error.message || 'Error al guardar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                disabled={!!usuario}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {usuario ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
              </label>
              <input
                type="password"
                required={!usuario}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol *
              </label>
              <select
                required
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value as UserRole })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="admin">Administrador</option>
                <option value="bodega">Bodega</option>
                <option value="caja">Caja</option>
                <option value="contabilidad">Contabilidad</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Usuario Activo</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : usuario ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
