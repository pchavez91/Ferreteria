'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/types'
import { Plus, Search, Edit, Trash2, Users, ChevronUp, ChevronDown, Circle } from 'lucide-react'
import UsuarioModal from '@/components/UsuarioModal'

interface UsuarioConSesion extends User {
  esta_activo?: boolean
  ultima_conexion?: string
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioConSesion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<User | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: 'nombre',
    direction: 'asc',
  })

  useEffect(() => {
    loadUsuarios()
    const interval = setInterval(loadUsuarios, 30000) // Actualizar cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  const loadUsuarios = async () => {
    try {
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('*')

      if (usuariosError) throw usuariosError

      const { data: sesionesData, error: sesionesError } = await supabase
        .from('sesiones_usuarios')
        .select('usuario_id, esta_activo, ultima_conexion')

      // Combinar datos de usuarios con sesiones
      const usuariosConSesion: UsuarioConSesion[] = (usuariosData || []).map((usuario) => {
        const sesion = sesionesData?.find((s) => s.usuario_id === usuario.id)
        return {
          ...usuario,
          esta_activo: sesion?.esta_activo || false,
          ultima_conexion: sesion?.ultima_conexion || null,
        }
      })

      setUsuarios(usuariosConSesion)
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' }
        if (prev.direction === 'desc') return { key, direction: null }
        return { key, direction: 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const sortedUsuarios = [...usuarios].sort((a, b) => {
    if (!sortConfig.direction) return 0

    let aValue: any = a[sortConfig.key as keyof UsuarioConSesion]
    let bValue: any = b[sortConfig.key as keyof UsuarioConSesion]

    if (sortConfig.key === 'esta_activo') {
      aValue = a.esta_activo ? 1 : 0
      bValue = b.esta_activo ? 1 : 0
    }

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue, 'es', { numeric: true })
      return sortConfig.direction === 'asc' ? comparison : -comparison
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    }

    if (aValue instanceof Date || typeof aValue === 'string') {
      const aDate = new Date(aValue)
      const bDate = new Date(bValue)
      const comparison = aDate.getTime() - bDate.getTime()
      return sortConfig.direction === 'asc' ? comparison : -comparison
    }

    return 0
  })

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


  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Cargando usuarios...</p>
      </div>
    )
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
        <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-lg hover-lift"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
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
                <th
                  onClick={() => handleSort('nombre')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Nombre
                    {sortConfig.key === 'nombre' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Email
                    {sortConfig.key === 'email' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('rol')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Rol
                    {sortConfig.key === 'rol' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('esta_activo')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Conexión
                    {sortConfig.key === 'esta_activo' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('activo')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Estado
                    {sortConfig.key === 'activo' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('created_at')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Fecha de Registro
                    {sortConfig.key === 'created_at' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedUsuarios.filter(
                (u) =>
                  u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p>No se encontraron usuarios</p>
                  </td>
                </tr>
              ) : (
                sortedUsuarios.filter(
                  (u) =>
                    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-accent/30 transition-all hover:scale-[1.01] cursor-pointer">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {usuario.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {usuario.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-primary/20 text-primary border border-primary/30">
                        {getRolLabel(usuario.rol)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Circle
                          className={`w-2 h-2 ${usuario.esta_activo ? 'text-green-400 fill-green-400' : 'text-gray-400'}`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {usuario.esta_activo ? 'Conectado' : 'Desconectado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded border ${
                          usuario.activo
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}
                      >
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(usuario.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="text-primary hover:text-primary-400 transition-colors hover:scale-110"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id)}
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

      {isModalOpen && (
        <UsuarioModal usuario={selectedUsuario} onClose={handleModalClose} />
      )}
    </div>
  )
}
