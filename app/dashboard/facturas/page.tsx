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
  const [filtroPendientes, setFiltroPendientes] = useState<boolean | null>(null)

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

  const filteredPagos = pagos.filter((p) => {
    const matchSearch =
      (p.venta as any)?.numero_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.empresa as any)?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())

    if (filtroPendientes === true) {
      // Mostrar solo facturas pendientes
      const venta = ventasFactura.find((v) => v.id === p.factura_id)
      if (!venta) return false
      const pagosVenta = pagos.filter((pag) => pag.factura_id === venta.id)
      const totalPagado = pagosVenta.reduce((sum, pag) => sum + Number(pag.monto), 0)
      return totalPagado < Number(venta.total) && matchSearch
    }

    if (filtroPendientes === false) {
      // Mostrar solo facturas pagadas
      const venta = ventasFactura.find((v) => v.id === p.factura_id)
      if (!venta) return false
      const pagosVenta = pagos.filter((pag) => pag.factura_id === venta.id)
      const totalPagado = pagosVenta.reduce((sum, pag) => sum + Number(pag.monto), 0)
      return totalPagado >= Number(venta.total) && matchSearch
    }

    return matchSearch
  })

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Cargando facturas...</p>
      </div>
    )
  }

  const formatearPeso = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(valor)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Gestión de Facturas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-lg hover-lift"
        >
          <Plus className="w-5 h-5" />
          Registrar Pago
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por número de factura o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Resumen de facturas pendientes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setFiltroPendientes(filtroPendientes === true ? null : true)}
          className={`bg-card rounded-xl border shadow-lg p-4 hover-lift hover-glow card-interactive transition-all ${
            filtroPendientes === true ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Facturas Pendientes</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {ventasFactura.filter((v) => {
                  const pagosVenta = pagos.filter((p) => p.factura_id === v.id)
                  const totalPagado = pagosVenta.reduce((sum, p) => sum + Number(p.monto), 0)
                  return totalPagado < Number(v.total)
                }).length}
              </p>
            </div>
            <XCircle className={`w-8 h-8 ${filtroPendientes === true ? 'text-primary' : 'text-yellow-500'}`} />
          </div>
        </button>

        <div className="bg-card rounded-xl border border-border shadow-lg p-4 hover-lift hover-glow card-interactive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pendiente</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {formatearPeso(
                  ventasFactura.reduce((sum, v) => {
                    const pagosVenta = pagos.filter((p) => p.factura_id === v.id)
                    const totalPagado = pagosVenta.reduce((s, p) => s + Number(p.monto), 0)
                    return sum + Math.max(0, Number(v.total) - totalPagado)
                  }, 0)
                )}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-lg p-4 hover-lift hover-glow card-interactive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pagado</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {formatearPeso(pagos.reduce((sum, p) => sum + Number(p.monto), 0))}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden hover-glow transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Fecha de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPagos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No se encontraron pagos registrados
                  </td>
                </tr>
              ) : (
                filteredPagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-accent/30 transition-all hover:scale-[1.01] cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {(pago.venta as any)?.numero_factura || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {(pago.empresa as any)?.nombre || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                      {formatearPeso(Number(pago.monto))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(pago.fecha_pago).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {pago.metodo_pago}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {pago.referencia || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded border ${
                          pago.estado === 'pagado'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : pago.estado === 'pendiente'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
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
