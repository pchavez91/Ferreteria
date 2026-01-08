'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PagoFactura, Venta } from '@/lib/types'
import { Plus, Search, DollarSign, CheckCircle, XCircle } from 'lucide-react'
import PagoFacturaModal from '@/components/PagoFacturaModal'

export default function FacturasPage() {
  const [pagos, setPagos] = useState<PagoFactura[]>([])
  const [ventasFactura, setVentasFactura] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadPagos()
    loadVentasFactura()
  }, [])

  const loadPagos = async () => {
    try {
      const { data, error } = await supabase
        .from('pagos_facturas')
        .select(`
          *,
          venta:ventas(*),
          empresa:empresas(*)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setPagos(data || [])
    } catch (error) {
      console.error('Error al cargar pagos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadVentasFactura = async () => {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          empresa:empresas(*),
          usuario:usuarios(*)
        `)
        .eq('tipo_pago', 'factura')
        .eq('estado', 'completada')
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) throw error
      setVentasFactura(data || [])
    } catch (error) {
      console.error('Error al cargar ventas a factura:', error)
    }
  }

  const filteredPagos = pagos.filter(
    (p) =>
      (p.venta as any)?.numero_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.empresa as any)?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-12">Cargando facturas...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Facturas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          Registrar Pago
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por número de factura o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Resumen de facturas pendientes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Facturas Pendientes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {ventasFactura.filter((v) => {
                  const pagosVenta = pagos.filter((p) => p.factura_id === v.id)
                  const totalPagado = pagosVenta.reduce((sum, p) => sum + Number(p.monto), 0)
                  return totalPagado < Number(v.total)
                }).length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pendiente</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                $
                {ventasFactura
                  .reduce((sum, v) => {
                    const pagosVenta = pagos.filter((p) => p.factura_id === v.id)
                    const totalPagado = pagosVenta.reduce((s, p) => s + Number(p.monto), 0)
                    return sum + Math.max(0, Number(v.total) - totalPagado)
                  }, 0)
                  .toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pagado</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${pagos.reduce((sum, p) => sum + Number(p.monto), 0).toLocaleString()}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPagos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron pagos registrados
                  </td>
                </tr>
              ) : (
                filteredPagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(pago.venta as any)?.numero_factura || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {(pago.empresa as any)?.nombre || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ${Number(pago.monto).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pago.fecha_pago).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pago.metodo_pago}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pago.referencia || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          pago.estado === 'pagado'
                            ? 'bg-green-100 text-green-800'
                            : pago.estado === 'pendiente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {pago.estado.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <PagoFacturaModal
          ventas={ventasFactura}
          onClose={() => {
            setIsModalOpen(false)
            loadPagos()
            loadVentasFactura()
          }}
        />
      )}
    </div>
  )
}
