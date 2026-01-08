'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Categoria } from '@/lib/types'
import { Plus, Search, Edit, Trash2, Settings } from 'lucide-react'
import CategoriaModal from '@/components/CategoriaModal'

export default function ConfiguracionPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null)

  useEffect(() => {
    loadCategorias()
  }, [])

  const loadCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre')

      if (error) throw error
      setCategorias(data || [])
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (categoria: Categoria) => {
    setSelectedCategoria(categoria)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar esta categoría?')) return

    try {
      const { error } = await supabase
        .from('categorias')
        .update({ activa: false })
        .eq('id', id)

      if (error) throw error
      loadCategorias()
    } catch (error) {
      console.error('Error al desactivar categoría:', error)
      alert('Error al desactivar categoría')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedCategoria(null)
    loadCategorias()
  }

  const filteredCategorias = categorias.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-12">Cargando configuración...</div>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
      </div>

      <div className="space-y-8">
        {/* Sección de Categorías */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Categorías de Productos</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              Nueva Categoría
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategorias.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No se encontraron categorías
                      </td>
                    </tr>
                  ) : (
                    filteredCategorias.map((categoria) => (
                      <tr key={categoria.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {categoria.nombre}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {categoria.descripcion || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              categoria.activa
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {categoria.activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(categoria)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(categoria.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CategoriaModal categoria={selectedCategoria} onClose={handleModalClose} />
      )}
    </div>
  )
}
