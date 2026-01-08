'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Venta } from '@/lib/types'
import { X } from 'lucide-react'

interface PagoFacturaModalProps {
  ventas: Venta[]
  onClose: () => void
}

export default function PagoFacturaModal({ ventas, onClose }: PagoFacturaModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    factura_id: '',
    empresa_id: '',
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    metodo_pago: 'transferencia',
    referencia: '',
  })

  const ventaSeleccionada = ventas.find((v) => v.id === formData.factura_id)
  const empresaId = ventaSeleccionada?.empresa_id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!empresaId) {
        alert('La factura seleccionada no tiene empresa asociada')
        return
      }

      const { error } = await supabase.from('pagos_facturas').insert([
        {
          factura_id: formData.factura_id,
          empresa_id: empresaId,
          monto: parseFloat(formData.monto),
          fecha_pago: formData.fecha_pago,
          metodo_pago: formData.metodo_pago,
          referencia: formData.referencia || null,
          estado: 'pagado',
        },
      ])

      if (error) throw error

      onClose()
    } catch (error: any) {
      console.error('Error al registrar pago:', error)
      alert(error.message || 'Error al registrar pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Registrar Pago de Factura</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Factura *
              </label>
              <select
                required
                value={formData.factura_id}
                onChange={(e) => setFormData({ ...formData, factura_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Seleccionar factura</option>
                {ventas.map((venta) => (
                  <option key={venta.id} value={venta.id}>
                    {venta.numero_factura} - Total: ${Number(venta.total).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {ventaSeleccionada && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Total de la factura: <span className="font-bold">${Number(ventaSeleccionada.total).toLocaleString()}</span>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto del Pago *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Pago *
              </label>
              <input
                type="date"
                required
                value={formData.fecha_pago}
                onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago *
              </label>
              <select
                required
                value={formData.metodo_pago}
                onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="transferencia">Transferencia</option>
                <option value="cheque">Cheque</option>
                <option value="efectivo">Efectivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referencia (Opcional)
              </label>
              <input
                type="text"
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                placeholder="Número de cheque, transferencia, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
              {loading ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
