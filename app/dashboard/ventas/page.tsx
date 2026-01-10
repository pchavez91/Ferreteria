'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Venta } from '@/lib/types'
import { Search } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadVentas()
  }, [])

  const loadVentas = async () => {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          empresa:empresas(*),
          usuario:usuarios(*)
        `)
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) {
        console.error('Error al cargar ventas:', error)
        throw error
      }
      
      console.log('Ventas cargadas:', data?.length || 0)
      setVentas(data || [])
    } catch (error) {
      console.error('Error al cargar ventas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVentas = ventas.filter(
    (v) =>
      v.numero_factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.empresa as any)?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Cliente/Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Tipo de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Subtotal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Descuento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                  Vendedor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredVentas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                    {ventas.length === 0 ? 'No hay ventas registradas' : 'No se encontraron ventas con ese criterio'}
                  </td>
                </tr>
              ) : (
                filteredVentas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-accent/30 transition-all hover:scale-[1.01] cursor-pointer">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
