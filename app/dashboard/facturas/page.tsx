'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PagoFactura, Venta } from '@/lib/types'
import { Plus, Search, DollarSign, CheckCircle, XCircle, ChevronUp, ChevronDown } from 'lucide-react'
import PagoFacturaModal from '@/components/PagoFacturaModal'

export default function FacturasPage() {
  const [pagos, setPagos] = useState<PagoFactura[]>([])
  const [ventasFactura, setVentasFactura] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filtroPendientes, setFiltroPendientes] = useState<boolean | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: 'created_at',
    direction: 'desc',
  })

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
      // Error silencioso
    } finally {
      setLoading(false)
    }
  }

  const loadVentasFactura = async () => {
    try {
      // Obtener ventas sin relaciones para evitar error de relaciones múltiples
      const { data: ventasData, error: ventasError } = await supabase
        .from('ventas')
        .select('*')
        .eq('tipo_pago', 'factura')
        .eq('estado', 'completada')
        .order('created_at', { ascending: false })
        .limit(200)

      if (ventasError) throw ventasError

      // Obtener empresas y usuarios por separado
      const empresaIds = [...new Set((ventasData || []).map(v => v.empresa_id).filter(Boolean))]
      const { data: empresasData } = await supabase
        .from('empresas')
        .select('*')
        .in('id', empresaIds)

      const usuarioIds = [...new Set([
        ...(ventasData || []).map(v => v.usuario_id).filter(Boolean),
        ...(ventasData || []).map(v => v.vendedor_id).filter(Boolean)
      ])]
      const { data: usuariosData } = await supabase
        .from('usuarios')
        .select('*')
        .in('id', usuarioIds)

      // Combinar datos
      const ventasConDatos = (ventasData || []).map(venta => ({
        ...venta,
        empresa: empresasData?.find(e => e.id === venta.empresa_id) || null,
        usuario: usuariosData?.find(u => u.id === venta.vendedor_id || u.id === venta.usuario_id) || null,
      }))

      setVentasFactura(ventasConDatos as any)
    } catch (error) {
      // Error silencioso
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

  const sortedPagos = [...filteredPagos].sort((a, b) => {
    if (!sortConfig.direction) return 0

    let aValue: any
    let bValue: any

    if (sortConfig.key === 'factura') {
      aValue = (a.venta as any)?.numero_factura || ''
      bValue = (b.venta as any)?.numero_factura || ''
    } else if (sortConfig.key === 'empresa') {
      aValue = (a.empresa as any)?.nombre || ''
      bValue = (b.empresa as any)?.nombre || ''
    } else if (sortConfig.key === 'fecha_pago') {
      aValue = new Date(a.fecha_pago)
      bValue = new Date(b.fecha_pago)
    } else {
      aValue = a[sortConfig.key as keyof PagoFactura]
      bValue = b[sortConfig.key as keyof PagoFactura]
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

    if (aValue instanceof Date || bValue instanceof Date) {
      const aDate = new Date(aValue)
      const bDate = new Date(bValue)
      const comparison = aDate.getTime() - bDate.getTime()
      return sortConfig.direction === 'asc' ? comparison : -comparison
    }

    return 0
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
                <th
                  onClick={() => handleSort('factura')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Factura
                    {sortConfig.key === 'factura' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('empresa')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Empresa
                    {sortConfig.key === 'empresa' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('monto')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Monto
                    {sortConfig.key === 'monto' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('fecha_pago')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Fecha de Pago
                    {sortConfig.key === 'fecha_pago' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('metodo_pago')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Método
                    {sortConfig.key === 'metodo_pago' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('referencia')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Referencia
                    {sortConfig.key === 'referencia' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('estado')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Estado
                    {sortConfig.key === 'estado' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedPagos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    {pagos.length === 0 ? 'No hay pagos registrados' : 'No se encontraron pagos con ese criterio'}
                  </td>
                </tr>
              ) : (
                sortedPagos.map((pago) => (
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
