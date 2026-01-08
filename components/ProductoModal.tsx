'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Producto, Categoria } from '@/lib/types'
import { X } from 'lucide-react'

interface ProductoModalProps {
  producto: Producto | null
  categorias: Categoria[]
  onClose: () => void
}

export default function ProductoModal({ producto, categorias, onClose }: ProductoModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    codigo_barras: '',
    nombre: '',
    descripcion: '',
    categoria_id: '',
    precio_unitario: '',
    precio_mayor: '',
    cantidad_minima_mayor: '1',
    stock: '0',
    stock_minimo: '0',
    unidad_medida: 'unidad',
    proveedor_id: '',
    activo: true,
  })

  useEffect(() => {
    if (producto) {
      setFormData({
        codigo_barras: producto.codigo_barras || '',
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        categoria_id: producto.categoria_id || '',
        precio_unitario: String(producto.precio_unitario) || '',
        precio_mayor: String(producto.precio_mayor) || '',
        cantidad_minima_mayor: String(producto.cantidad_minima_mayor) || '1',
        stock: String(producto.stock) || '0',
        stock_minimo: String(producto.stock_minimo) || '0',
        unidad_medida: producto.unidad_medida || 'unidad',
        proveedor_id: producto.proveedor_id || '',
        activo: producto.activo ?? true,
      })
    }
  }, [producto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        codigo_barras: formData.codigo_barras || null,
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        categoria_id: formData.categoria_id || null,
        precio_unitario: parseFloat(formData.precio_unitario),
        precio_mayor: parseFloat(formData.precio_mayor),
        cantidad_minima_mayor: parseInt(formData.cantidad_minima_mayor),
        stock: parseInt(formData.stock),
        stock_minimo: parseInt(formData.stock_minimo),
        unidad_medida: formData.unidad_medida,
        proveedor_id: formData.proveedor_id || null,
        activo: formData.activo,
      }

      if (producto) {
        // Actualizar
        const { error } = await supabase
          .from('productos')
          .update(data)
          .eq('id', producto.id)

        if (error) throw error
      } else {
        // Crear
        const { error } = await supabase.from('productos').insert([data])

        if (error) throw error
      }

      onClose()
    } catch (error: any) {
      console.error('Error al guardar producto:', error)
      alert(error.message || 'Error al guardar producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Barras
              </label>
              <input
                type="text"
                value={formData.codigo_barras}
                onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
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

            <div className="md:col-span-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.categoria_id}
                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad de Medida
              </label>
              <select
                value={formData.unidad_medida}
                onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="g">Gramo</option>
                <option value="l">Litro</option>
                <option value="ml">Mililitro</option>
                <option value="m">Metro</option>
                <option value="cm">Centímetro</option>
                <option value="m2">Metro cuadrado</option>
                <option value="m3">Metro cúbico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Unitario *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.precio_unitario}
                onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio por Mayor *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.precio_mayor}
                onChange={(e) => setFormData({ ...formData, precio_mayor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad Mínima para Mayor
              </label>
              <input
                type="number"
                value={formData.cantidad_minima_mayor}
                onChange={(e) => setFormData({ ...formData, cantidad_minima_mayor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Actual
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Mínimo
              </label>
              <input
                type="number"
                value={formData.stock_minimo}
                onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Producto Activo</span>
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
              {loading ? 'Guardando...' : producto ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
