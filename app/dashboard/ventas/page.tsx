'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Venta } from '@/lib/types'
import { Search, ChevronUp, ChevronDown, Receipt, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: 'created_at',
    direction: 'desc',
  })
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null)
  const [showBoletaModal, setShowBoletaModal] = useState(false)
  const [detallesVenta, setDetallesVenta] = useState<any[]>([])

  useEffect(() => {
    loadVentas()
  }, [])

  const loadVentas = async () => {
    try {
      // Primero obtener las ventas sin relaciones para evitar el error de relaciones múltiples
      const { data: ventasData, error: ventasError } = await supabase
        .from('ventas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (ventasError) {
        console.error('Error al cargar ventas:', ventasError)
        throw ventasError
      }

      // Obtener empresas únicas
      const empresaIds = [...new Set((ventasData || []).map(v => v.empresa_id).filter(Boolean))]
      const { data: empresasData } = await supabase
        .from('empresas')
        .select('*')
        .in('id', empresaIds)

      // Obtener usuarios únicos (tanto de usuario_id como vendedor_id)
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
      
      console.log('Ventas cargadas:', ventasConDatos.length)
      console.log('Datos de ventas:', ventasConDatos)
      setVentas(ventasConDatos as any)
    } catch (error) {
      console.error('Error al cargar ventas:', error)
      alert('Error al cargar ventas. Revisa la consola para más detalles.')
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

  const sortedVentas = [...ventas].sort((a, b) => {
    if (!sortConfig.direction) return 0

    let aValue: any
    let bValue: any

    if (sortConfig.key === 'empresa') {
      aValue = (a.empresa as any)?.nombre || ''
      bValue = (b.empresa as any)?.nombre || ''
    } else if (sortConfig.key === 'usuario') {
      aValue = (a.usuario as any)?.nombre || ''
      bValue = (b.usuario as any)?.nombre || ''
    } else {
      aValue = a[sortConfig.key as keyof Venta]
      bValue = b[sortConfig.key as keyof Venta]
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

  const filteredVentas = sortedVentas.filter(
    (v) =>
      v.numero_factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.empresa as any)?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleVerBoleta = async (venta: Venta) => {
    try {
      // Cargar detalles de la venta
      const { data: detalles, error } = await supabase
        .from('detalle_ventas')
        .select(`
          *,
          producto:productos(*)
        `)
        .eq('venta_id', venta.id)

      if (error) throw error

      setDetallesVenta(detalles || [])
      setSelectedVenta(venta)
      setShowBoletaModal(true)
    } catch (error) {
      console.error('Error al cargar detalles de venta:', error)
      alert('Error al cargar los detalles de la venta')
    }
  }

  const formatearPeso = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(valor)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Cargando ventas...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Ventas</h1>
        <div className="text-sm text-muted-foreground">
          Total: {ventas.length} ventas
        </div>
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

      <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden hover-glow transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/50 sticky top-0 z-10">
              <tr>
                <th
                  onClick={() => handleSort('numero_factura')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Factura
                    {sortConfig.key === 'numero_factura' && (
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
                    Fecha
                    {sortConfig.key === 'created_at' && (
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
                    Cliente/Empresa
                    {sortConfig.key === 'empresa' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tipo_pago')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Tipo de Pago
                    {sortConfig.key === 'tipo_pago' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('subtotal')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Subtotal
                    {sortConfig.key === 'subtotal' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('descuento')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Descuento
                    {sortConfig.key === 'descuento' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('total')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Total
                    {sortConfig.key === 'total' && (
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
                <th
                  onClick={() => handleSort('usuario')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Vendedor
                    {sortConfig.key === 'usuario' && (
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
              {filteredVentas.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-muted-foreground">
                    {ventas.length === 0 ? 'No hay ventas registradas' : 'No se encontraron ventas con ese criterio'}
                  </td>
                </tr>
              ) : (
                filteredVentas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-accent/30 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {venta.numero_factura}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {format(new Date(venta.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {(venta.empresa as any)?.nombre || 'Cliente General'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          venta.tipo_pago === 'efectivo'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : venta.tipo_pago === 'tarjeta'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {venta.tipo_pago.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(Number(venta.subtotal))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(Number(venta.descuento))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(Number(venta.total))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          venta.estado === 'completada'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : venta.estado === 'pendiente'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {venta.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {(venta.usuario as any)?.nombre || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleVerBoleta(venta)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg transition-colors text-xs font-medium"
                      >
                        <Receipt className="w-4 h-4" />
                        Boleta
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showBoletaModal && selectedVenta && (
        <BoletaModal
          venta={selectedVenta}
          detalles={detallesVenta}
          onClose={() => {
            setShowBoletaModal(false)
            setSelectedVenta(null)
            setDetallesVenta([])
          }}
          formatearPeso={formatearPeso}
        />
      )}
    </div>
  )
}

// Componente Modal de Boleta
function BoletaModal({
  venta,
  detalles,
  onClose,
  formatearPeso,
}: any) {
  const handleImprimir = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] border border-border shadow-2xl animate-fadeIn flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center flex-shrink-0 no-print">
          <h2 className="text-2xl font-bold text-foreground">Boleta de Venta</h2>
          <div className="flex gap-2">
            <button
              onClick={handleImprimir}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 print:p-0">
          <div className="bg-white text-black p-6 rounded-lg print:shadow-none" id="boleta-print">
            {/* Encabezado */}
            <div className="text-center border-b border-gray-300 pb-4 mb-4">
              <h1 className="text-2xl font-bold mb-2">FERRETERÍA EL MAESTRO</h1>
              <p className="text-sm text-gray-600">RUT: 77.777.777-7</p>
              <p className="text-sm text-gray-600">Av. Principal 123, Santiago, Chile</p>
              <p className="text-sm text-gray-600">Tel: +56 2 2345 6789</p>
            </div>

            {/* Información de la venta */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">Boleta N°:</span>
                <span>{venta.numero_factura}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">Fecha:</span>
                <span>{new Date(venta.created_at).toLocaleString('es-CL', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">Atendido por:</span>
                <span>{(venta.usuario as any)?.nombre || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">Medio de Pago:</span>
                <span className="uppercase">
                  {venta.tipo_pago === 'efectivo' ? 'Efectivo' : venta.tipo_pago === 'tarjeta' ? 'Tarjeta' : 'Factura'}
                </span>
              </div>
              {venta.empresa && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold">Empresa:</span>
                  <span>{(venta.empresa as any).nombre}</span>
                </div>
              )}
            </div>

            {/* Detalles de productos */}
            <div className="border-t border-gray-300 pt-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 font-semibold">Cantidad</th>
                    <th className="text-left py-2 font-semibold">Descripción</th>
                    <th className="text-right py-2 font-semibold">Precio Unit.</th>
                    <th className="text-right py-2 font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.map((detalle: any, index: number) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-2">{detalle.cantidad}</td>
                      <td className="py-2">{(detalle.producto as any)?.nombre || 'Producto'}</td>
                      <td className="text-right py-2">{formatearPeso(Number(detalle.precio_unitario))}</td>
                      <td className="text-right py-2 font-semibold">{formatearPeso(Number(detalle.subtotal))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="border-t border-gray-300 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatearPeso(Number(venta.subtotal))}</span>
              </div>
              {venta.descuento > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Descuento:</span>
                  <span>-{formatearPeso(Number(venta.descuento))}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>IVA (19%):</span>
                <span>{formatearPeso(Number(venta.impuesto))}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2">
                <span>TOTAL:</span>
                <span>{formatearPeso(Number(venta.total))}</span>
              </div>
            </div>

            {/* Pie de página */}
            <div className="text-center text-xs text-gray-600 mt-6 pt-4 border-t border-gray-300">
              <p>¡Gracias por su compra!</p>
              <p>Valor de compra no incluye instalación ni transporte</p>
              <p>Boleta exenta de IVA según Art. 12 letra A de la Ley de IVA</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end flex-shrink-0 bg-card no-print">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #boleta-print, #boleta-print * {
            visibility: visible;
          }
          #boleta-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
