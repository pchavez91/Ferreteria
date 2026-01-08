'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Producto } from '@/lib/types'
import { X } from 'lucide-react'

interface MovimientoModalProps {
  productos: Producto[]
  onClose: () => void
}

export default function MovimientoModal({ productos, onClose }: MovimientoModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    producto_id: '',
    tipo: 'entrada',
    cantidad: '',
    motivo: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Usuario no autenticado')

      // Crear movimiento
      const { error: movimientoError } = await supabase
        .from('movimientos_bodega')
        .insert([
          {
            producto_id: formData.producto_id,
            tipo: formData.tipo,
            cantidad: parseInt(formData.cantidad),
            motivo: formData.motivo,
            usuario_id: user.id,
          },
        ])

      if (movimientoError) throw movimientoError

      // Actualizar stock del producto
      const producto = productos.find((p) => p.id === formData.producto_id)
      if (!producto) throw new Error('Producto no encontrado')

      let nuevoStock = producto.stock
      if (formData.tipo === 'entrada') {
        nuevoStock += parseInt(formData.cantidad)
      } else if (formData.tipo === 'salida') {
        nuevoStock -= parseInt(formData.cantidad)
      } else if (formData.tipo === 'ajuste') {
        nuevoStock = parseInt(formData.cantidad)
      }

      const { error: productoError } = await supabase
        .from('productos')
        .update({ stock: nuevoStock })
        .eq('id', formData.producto_id)

      if (productoError) throw productoError

      onClose()
    } catch (error: any) {
      console.error('Error al crear movimiento:', error)
      alert(error.message || 'Error al crear movimiento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Nuevo Movimiento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producto *
              </label>
              <select
                required
                value={formData.producto_id}
                onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Seleccionar producto</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} (Stock: {producto.stock} {producto.unidad_medida})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Movimiento *
              </label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste de Inventario</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo *
              </label>
              <textarea
                required
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Ej: Compra a proveedor, Venta, Ajuste por inventario físico..."
              />
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
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
