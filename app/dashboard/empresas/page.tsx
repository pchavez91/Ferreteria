'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Empresa } from '@/lib/types'
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react'
import EmpresaModal from '@/components/EmpresaModal'

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)

  useEffect(() => {
    loadEmpresas()
  }, [])

  const loadEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nombre')

      if (error) throw error
      setEmpresas(data || [])
    } catch (error) {
      console.error('Error al cargar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (empresa: Empresa) => {
    setSelectedEmpresa(empresa)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta empresa?')) return

    try {
      const { error } = await supabase
        .from('empresas')
        .update({ activa: false })
        .eq('id', id)

      if (error) throw error
      loadEmpresas()
    } catch (error) {
      console.error('Error al eliminar empresa:', error)
      alert('Error al eliminar empresa')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedEmpresa(null)
    loadEmpresas()
  }

  const filteredEmpresas = empresas.filter(
    (e) =>
      e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.nit.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-12">Cargando empresas...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          Nueva Empresa
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o NIT..."
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
                  NIT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
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
              {filteredEmpresas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No se encontraron empresas</p>
                  </td>
                </tr>
              ) : (
                filteredEmpresas.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {empresa.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {empresa.nit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {empresa.contacto || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {empresa.telefono || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {empresa.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          empresa.activa
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {empresa.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(empresa)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(empresa.id)}
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

      {isModalOpen && (
        <EmpresaModal empresa={selectedEmpresa} onClose={handleModalClose} />
      )}
    </div>
  )
}
