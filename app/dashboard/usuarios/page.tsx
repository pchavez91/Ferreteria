'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/types'
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react'
import UsuarioModal from '@/components/UsuarioModal'

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<User | null>(null)

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nombre')

      if (error) throw error
      setUsuarios(data || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (usuario: User) => {
    setSelectedUsuario(usuario)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar este usuario?')) return

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: false })
        .eq('id', id)

      if (error) throw error
      loadUsuarios()
    } catch (error) {
      console.error('Error al desactivar usuario:', error)
      alert('Error al desactivar usuario')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedUsuario(null)
    loadUsuarios()
  }

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-12">Cargando usuarios...</div>
  }

  const getRolLabel = (rol: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      bodega: 'Bodega',
      caja: 'Caja',
      contabilidad: 'Contabilidad',
    }
    return labels[rol] || rol
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
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
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No se encontraron usuarios</p>
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {usuario.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-primary-100 text-primary-800">
                        {getRolLabel(usuario.rol)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          usuario.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(usuario.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id)}
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
        <UsuarioModal usuario={selectedUsuario} onClose={handleModalClose} />
      )}
    </div>
  )
}
