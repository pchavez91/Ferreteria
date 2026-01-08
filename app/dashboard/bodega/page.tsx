'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MovimientoBodega, Producto } from '@/lib/types'
import { Plus, Package, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react'
import MovimientoModal from '@/components/MovimientoModal'

export default function BodegaPage() {
  const [movimientos, setMovimientos] = useState<MovimientoBodega[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadMovimientos()
    loadProductos()
  }, [])

  const loadMovimientos = async () => {
    try {
      const { data, error } = await supabase
        .from('movimientos_bodega')
        .select(`
          *,
          producto:productos(*),
          usuario:usuarios(*)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setMovimientos(data || [])
    } catch (error) {
      console.error('Error al cargar movimientos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'salida':
        return <TrendingDown className="w-5 h-5 text-red-600" />
      case 'ajuste':
        return <RotateCcw className="w-5 h-5 text-blue-600" />
      default:
        return <Package className="w-5 h-5" />
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'Entrada'
      case 'salida':
        return 'Salida'
      case 'ajuste':
        return 'Ajuste'
      default:
        return tipo
    }
  }

  if (loading) {
    return <div className="text-center py-12">Cargando movimientos...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Bodega</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          Nuevo Movimiento
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : (
                movimientos.map((movimiento) => (
                  <tr key={movimiento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(movimiento.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTipoIcon(movimiento.tipo)}
                        <span className="text-sm font-medium text-gray-900">
                          {getTipoLabel(movimiento.tipo)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {(movimiento.producto as any)?.nombre || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`font-semibold ${
                          movimiento.tipo === 'entrada'
                            ? 'text-green-600'
                            : movimiento.tipo === 'salida'
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {movimiento.tipo === 'entrada' ? '+' : movimiento.tipo === 'salida' ? '-' : '±'}
                        {movimiento.cantidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {movimiento.motivo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(movimiento.usuario as any)?.nombre || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <MovimientoModal
          productos={productos}
          onClose={() => {
            setIsModalOpen(false)
            loadMovimientos()
            loadProductos()
          }}
        />
      )}
    </div>
  )
}
