'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Categoria } from '@/lib/types'
import { X } from 'lucide-react'

interface CategoriaModalProps {
  categoria: Categoria | null
  onClose: () => void
}

export default function CategoriaModal({ categoria, onClose }: CategoriaModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activa: true,
  })

  useEffect(() => {
    if (categoria) {
      setFormData({
        nombre: categoria.nombre || '',
        descripcion: categoria.descripcion || '',
        activa: categoria.activa ?? true,
      })
    }
  }, [categoria])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (categoria) {
        // Actualizar
        const { error } = await supabase
          .from('categorias')
          .update(formData)
          .eq('id', categoria.id)

        if (error) throw error
      } else {
        // Crear
        const { error } = await supabase.from('categorias').insert([formData])

        if (error) throw error
      }

      onClose()
    } catch (error: any) {
      console.error('Error al guardar categoría:', error)
      alert(error.message || 'Error al guardar categoría')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
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
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.activa}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Categoría Activa</span>
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
              {loading ? 'Guardando...' : categoria ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
