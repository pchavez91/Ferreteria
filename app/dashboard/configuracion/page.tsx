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
      // Error silencioso
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
    } catch (error: any) {
      alert('Error al desactivar categoría: ' + (error.message || 'Error desconocido'))
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
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Cargando configuración...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
      </div>

      <div className="space-y-8">
        {/* Sección de Categorías */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">Categorías de Productos</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-lg hover-lift"
            >
              <Plus className="w-5 h-5" />
              Nueva Categoría
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden hover-glow transition-shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent/50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCategorias.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                        No se encontraron categorías
                      </td>
                    </tr>
                  ) : (
                    filteredCategorias.map((categoria) => (
                      <tr key={categoria.id} className="hover:bg-accent/30 transition-all hover:scale-[1.01] cursor-pointer">
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {categoria.nombre}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {categoria.descripcion || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded border ${
                              categoria.activa
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}
                          >
                            {categoria.activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(categoria)}
                              className="text-primary hover:text-primary-400 transition-colors hover:scale-110"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(categoria.id)}
                              className="text-red-400 hover:text-red-300 transition-colors hover:scale-110"
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
