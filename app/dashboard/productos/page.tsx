'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Producto, Categoria } from '@/lib/types'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'
import ProductoModal from '@/components/ProductoModal'

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)

  useEffect(() => {
    loadProductos()
    loadCategorias()
  }, [])

  const loadProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categoria:categorias(*),
          proveedor:proveedores(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      console.error('Error al cargar productos:', error)
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
      console.error('Error al cargar categorías:', error)
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
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      alert('Error al eliminar producto')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedProducto(null)
    loadProductos()
  }

  const filteredProductos = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-12">Cargando productos...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Unitario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Mayor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProductos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No se encontraron productos</p>
                  </td>
                </tr>
              ) : (
                filteredProductos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.codigo_barras || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {producto.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(producto.categoria as any)?.nombre || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Number(producto.precio_unitario).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Number(producto.precio_mayor).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          producto.stock <= producto.stock_minimo
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {producto.stock} {producto.unidad_medida}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {producto.unidad_medida}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(producto)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(producto.id)}
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
        <ProductoModal
          producto={selectedProducto}
          categorias={categorias}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
