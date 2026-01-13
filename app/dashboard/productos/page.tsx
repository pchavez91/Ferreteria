'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Producto, Categoria, User } from '@/lib/types'
import { Plus, Search, Edit, Trash2, Package, ChevronUp, ChevronDown, X } from 'lucide-react'
import ProductoModal from '@/components/ProductoModal'
import CategoriaModal from '@/components/CategoriaModal'

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: 'nombre',
    direction: 'asc',
  })

  useEffect(() => {
    loadUser()
    loadProductos()
    loadCategorias()
  }, [])

  const loadUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (usuario) setUser(usuario)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categoria:categorias(*),
          proveedor:proveedores(*)
        `)
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      // Error silencioso
    } finally {
      setLoading(false)
    }
  }

  const loadCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('activa', true)
        .order('nombre')

      if (error) throw error
      setCategorias(data || [])
    } catch (error) {
      // Error silencioso
    }
  }

  const handleEdit = (producto: Producto) => {
    setSelectedProducto(producto)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      const { error } = await supabase
        .from('productos')
        .update({ activo: false })
        .eq('id', id)

      if (error) throw error
      loadProductos()
    } catch (error: any) {
      alert('Error al eliminar producto: ' + (error.message || 'Error desconocido'))
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedProducto(null)
    loadProductos()
  }

  const handleEditCategoria = (categoria: Categoria) => {
    setSelectedCategoria(categoria)
  }

  const handleDeleteCategoria = async (id: string) => {
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

  const handleCategoriaModalClose = () => {
    setIsCategoriaModalOpen(false)
    setSelectedCategoria(null)
    loadCategorias()
  }

  const isAdmin = user?.rol === 'admin'

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

  const filteredProductos = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedProductos = [...filteredProductos].sort((a, b) => {
    if (!sortConfig.direction) return 0

    let aValue: any
    let bValue: any

    if (sortConfig.key === 'categoria') {
      aValue = (a.categoria as any)?.nombre || ''
      bValue = (b.categoria as any)?.nombre || ''
    } else {
      aValue = a[sortConfig.key as keyof Producto]
      bValue = b[sortConfig.key as keyof Producto]
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

    return 0
  })

  if (loading) {
    return <div className="text-center py-12">Cargando productos...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Productos</h1>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={() => setIsCategoriaModalOpen(true)}
              className="flex items-center gap-2 bg-accent text-foreground px-4 py-2 rounded-lg hover:bg-accent/80 transition-colors border border-border"
            >
              <Plus className="w-5 h-5" />
              Gestionar Categorías
            </button>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o código de barras..."
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
                  onClick={() => handleSort('codigo_barras')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Código
                    {sortConfig.key === 'codigo_barras' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
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
                  onClick={() => handleSort('categoria')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Categoría
                    {sortConfig.key === 'categoria' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('precio_unitario')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Precio Unitario
                    {sortConfig.key === 'precio_unitario' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('precio_mayor')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Precio Mayor
                    {sortConfig.key === 'precio_mayor' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('stock')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Stock
                    {sortConfig.key === 'stock' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unidad_medida')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Unidad
                    {sortConfig.key === 'unidad_medida' && (
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
              {sortedProductos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p>{productos.length === 0 ? 'No hay productos registrados' : 'No se encontraron productos con ese criterio'}</p>
                  </td>
                </tr>
              ) : (
                sortedProductos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-accent/30 transition-all hover:scale-[1.01] cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {producto.codigo_barras || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {producto.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {(producto.categoria as any)?.nombre || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(Number(producto.precio_unitario))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(Number(producto.precio_mayor))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          producto.stock <= producto.stock_minimo
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}
                      >
                        {producto.stock} {producto.unidad_medida}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {producto.unidad_medida}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(producto)}
                          className="text-primary hover:text-primary-400 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(producto.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
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
        <ProductoModal
          producto={selectedProducto}
          categorias={categorias}
          onClose={handleModalClose}
        />
      )}

      {isCategoriaModalOpen && user?.rol === 'admin' && (
        <GestionCategoriasModal
          categorias={categorias}
          onClose={handleCategoriaModalClose}
          onEdit={handleEditCategoria}
          onDelete={handleDeleteCategoria}
        />
      )}
    </div>
  )
}

// Componente para gestionar categorías
function GestionCategoriasModal({
  categorias,
  onClose,
  onEdit,
  onDelete,
}: {
  categorias: Categoria[]
  onClose: () => void
  onEdit: (categoria: Categoria) => void
  onDelete: (id: string) => void
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategorias = categorias.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (categoria: Categoria) => {
    setSelectedCategoria(categoria)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedCategoria(null)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] border border-border shadow-2xl flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center flex-shrink-0">
            <h2 className="text-2xl font-bold text-foreground">Gestionar Categorías</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X size={20} className="text-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Buscar categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus size={20} />
                Nueva Categoría
              </button>
            </div>

            <div className="bg-accent/30 rounded-lg overflow-hidden border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-accent/50">
                    <th className="text-left p-3 text-sm font-semibold text-foreground">Nombre</th>
                    <th className="text-left p-3 text-sm font-semibold text-foreground">Descripción</th>
                    <th className="text-left p-3 text-sm font-semibold text-foreground">Estado</th>
                    <th className="text-left p-3 text-sm font-semibold text-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategorias.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        No se encontraron categorías
                      </td>
                    </tr>
                  ) : (
                    filteredCategorias.map((categoria) => (
                      <tr key={categoria.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                        <td className="p-3 font-medium text-foreground">{categoria.nombre}</td>
                        <td className="p-3 text-muted-foreground">{categoria.descripcion || '-'}</td>
                        <td className="p-3">
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
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(categoria)}
                              className="text-primary hover:text-primary-400 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => onDelete(categoria.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={16} />
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
    </>
  )
}
