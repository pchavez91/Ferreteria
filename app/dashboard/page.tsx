'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Package, DollarSign, TrendingUp, Users } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface VentasMensuales {
  mes: string
  ventasAnoActual: number
  ventasAnoPasado: number
  ingresosAnoActual: number
  ingresosAnoPasado: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    productos: 0,
    ventasHoy: 0,
    ingresosHoy: 0,
    empresas: 0,
  })
  const [ventasMensuales, setVentasMensuales] = useState<VentasMensuales[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    loadVentasMensuales()
  }, [])

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

  const loadVentasMensuales = async () => {
    try {
      const anoActual = new Date().getFullYear()
      const anoPasado = anoActual - 1
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

      // Cargar ventas del año actual
      const inicioAnoActual = new Date(anoActual, 0, 1).toISOString()
      const finAnoActual = new Date(anoActual + 1, 0, 1).toISOString()

      const { data: ventasActuales } = await supabase
        .from('ventas')
        .select('total, created_at')
        .gte('created_at', inicioAnoActual)
        .lt('created_at', finAnoActual)
        .eq('estado', 'completada')

      // Cargar ventas del año pasado
      const inicioAnoPasado = new Date(anoPasado, 0, 1).toISOString()
      const finAnoPasado = new Date(anoPasado + 1, 0, 1).toISOString()

      const { data: ventasPasadas } = await supabase
        .from('ventas')
        .select('total, created_at')
        .gte('created_at', inicioAnoPasado)
        .lt('created_at', finAnoPasado)
        .eq('estado', 'completada')

      // Agrupar por mes
      const datosMensuales: VentasMensuales[] = meses.map((mes, index) => {
        const ventasMesActual =
          ventasActuales?.filter((v) => {
            const fecha = new Date(v.created_at)
            return fecha.getMonth() === index
          }) || []

        const ventasMesPasado =
          ventasPasadas?.filter((v) => {
            const fecha = new Date(v.created_at)
            return fecha.getMonth() === index
          }) || []

        const ingresosMesActual = ventasMesActual.reduce((sum, v) => sum + Number(v.total), 0)
        const ingresosMesPasado = ventasMesPasado.reduce((sum, v) => sum + Number(v.total), 0)

        return {
          mes,
          ventasAnoActual: ventasMesActual.length,
          ventasAnoPasado: ventasMesPasado.length,
          ingresosAnoActual: ingresosMesActual,
          ingresosAnoPasado: ingresosMesPasado,
        }
      })

      setVentasMensuales(datosMensuales)
    } catch (error) {
      console.error('Error al cargar ventas mensuales:', error)
    }
  }

  const formatearPeso = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(valor)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Ingresos') ? formatearPeso(entry.value) : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Cargando estadísticas...</p>
      </div>
    )
  }

  const anoActual = new Date().getFullYear()
  const anoPasado = anoActual - 1

  // Calcular diferencia porcentual
  const totalIngresosActual = ventasMensuales.reduce((sum, v) => sum + v.ingresosAnoActual, 0)
  const totalIngresosPasado = ventasMensuales.reduce((sum, v) => sum + v.ingresosAnoPasado, 0)
  const diferenciaPorcentual =
    totalIngresosPasado > 0
      ? ((totalIngresosActual - totalIngresosPasado) / totalIngresosPasado) * 100
      : 0

  const statCards = [
    {
      title: 'Productos Activos',
      value: stats.productos,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      route: '/dashboard/productos',
    },
    {
      title: 'Ventas Hoy',
      value: stats.ventasHoy,
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      route: '/dashboard/ventas',
    },
    {
      title: 'Ingresos Hoy',
      value: formatearPeso(stats.ingresosHoy),
      icon: DollarSign,
      gradient: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-500/10',
      route: '/dashboard/ventas',
    },
    {
      title: 'Empresas',
      value: stats.empresas,
      icon: Users,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      route: '/dashboard/empresas',
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => router.push(stat.route)}
            className="bg-card rounded-xl shadow-lg border border-border p-6 hover-lift hover-glow card-interactive cursor-pointer transition-all"
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

      {/* Gráfico de Ventas Anuales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl shadow-lg border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Ventas por Mes - Comparativa Anual</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ventasMensuales}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
              <XAxis dataKey="mes" stroke="rgb(148, 163, 184)" />
              <YAxis stroke="rgb(148, 163, 184)" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="ventasAnoActual" name={`${anoActual} - Ventas`} fill="rgb(59, 130, 246)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="ventasAnoPasado" name={`${anoPasado} - Ventas`} fill="rgb(148, 163, 184)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Ingresos por Mes - Comparativa Anual</h2>
          <div className="mb-4 p-4 bg-primary/10 rounded-lg border border-primary/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Diferencia vs {anoPasado}:</span>
              <span
                className={`text-lg font-bold ${
                  diferenciaPorcentual >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {diferenciaPorcentual >= 0 ? '+' : ''}
                {diferenciaPorcentual.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Total {anoActual}:</span>
              <span className="text-lg font-bold text-primary">{formatearPeso(totalIngresosActual)}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Total {anoPasado}:</span>
              <span className="text-sm text-muted-foreground">{formatearPeso(totalIngresosPasado)}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ventasMensuales}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
              <XAxis dataKey="mes" stroke="rgb(148, 163, 184)" />
              <YAxis stroke="rgb(148, 163, 184)" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="ingresosAnoActual"
                name={`${anoActual} - Ingresos`}
                stroke="rgb(59, 130, 246)"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="ingresosAnoPasado"
                name={`${anoPasado} - Ingresos`}
                stroke="rgb(148, 163, 184)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
