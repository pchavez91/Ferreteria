'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, DollarSign, TrendingUp, Users } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    productos: 0,
    ventasHoy: 0,
    ingresosHoy: 0,
    empresas: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { count: productosCount } = await supabase
          .from('productos')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true)

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const { data: ventasHoy, count: ventasCount } = await supabase
          .from('ventas')
          .select('total', { count: 'exact' })
          .gte('created_at', today.toISOString())
          .eq('estado', 'completada')

        const ingresosHoy = ventasHoy?.reduce((sum, v) => sum + Number(v.total), 0) || 0

        const { count: empresasCount } = await supabase
          .from('empresas')
          .select('*', { count: 'exact', head: true })
          .eq('activa', true)

        setStats({
          productos: productosCount || 0,
          ventasHoy: ventasCount || 0,
          ingresosHoy,
          empresas: empresasCount || 0,
        })
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Cargando estadísticas...</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Productos Activos',
      value: stats.productos,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Ventas Hoy',
      value: stats.ventasHoy,
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Ingresos Hoy',
      value: `$${stats.ingresosHoy.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Empresas',
      value: stats.empresas,
      icon: Users,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-card rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-4 rounded-xl`}>
                <div className={`bg-gradient-to-br ${stat.gradient} p-2 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
