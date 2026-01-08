'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Empresa } from '@/lib/types'
import { X } from 'lucide-react'

interface EmpresaModalProps {
  empresa: Empresa | null
  onClose: () => void
}

export default function EmpresaModal({ empresa, onClose }: EmpresaModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto: '',
    activa: true,
  })

  useEffect(() => {
    if (empresa) {
      setFormData({
        nombre: empresa.nombre || '',
        nit: empresa.nit || '',
        direccion: empresa.direccion || '',
        telefono: empresa.telefono || '',
        email: empresa.email || '',
        contacto: empresa.contacto || '',
        activa: empresa.activa ?? true,
      })
    }
  }, [empresa])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (empresa) {
        // Actualizar
        const { error } = await supabase
          .from('empresas')
          .update(formData)
          .eq('id', empresa.id)

        if (error) throw error
      } else {
        // Crear
        const { error } = await supabase.from('empresas').insert([formData])

        if (error) throw error
      }

      onClose()
    } catch (error: any) {
      console.error('Error al guardar empresa:', error)
      alert(error.message || 'Error al guardar empresa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {empresa ? 'Editar Empresa' : 'Nueva Empresa'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa *
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
                NIT *
              </label>
              <input
                type="text"
                required
                value={formData.nit}
                onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contacto
              </label>
              <input
                type="text"
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <textarea
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.activa}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Empresa Activa</span>
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
              {loading ? 'Guardando...' : empresa ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
