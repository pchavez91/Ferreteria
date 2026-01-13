'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/types'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  DollarSign,
  FileText,
  Building2,
  Users,
  Settings,
  Menu,
  X,
  Receipt,
  Wallet,
} from 'lucide-react'
import BoletaVentasModal from '@/components/BoletaVentasModal'
import DejarDineroModal from '@/components/DejarDineroModal'
import CierreTurnoModal from '@/components/CierreTurnoModal'

interface SidebarProps {
  user: User
  currentPath: string
}

export default function Sidebar({ user, currentPath }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showBoletaVentasModal, setShowBoletaVentasModal] = useState(false)
  const [showDejarDineroModal, setShowDejarDineroModal] = useState(false)
  const [showCierreTurnoModal, setShowCierreTurnoModal] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    setShowCierreTurnoModal(true)
  }

  const handleConfirmLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'bodega', 'caja', 'contabilidad'],
    },
    {
      name: 'Productos',
      href: '/dashboard/productos',
      icon: Package,
      roles: ['admin', 'bodega', 'caja'],
    },
    {
      name: 'Bodega',
      href: '/dashboard/bodega',
      icon: Warehouse,
      roles: ['admin', 'bodega'],
    },
    {
      name: 'Ventas',
      href: '/dashboard/ventas',
      icon: DollarSign,
      roles: ['admin', 'caja', 'contabilidad'],
    },
    {
      name: 'Empresas',
      href: '/dashboard/empresas',
      icon: Building2,
      roles: ['admin', 'caja', 'contabilidad'],
    },
    {
      name: 'Facturas',
      href: '/dashboard/facturas',
      icon: FileText,
      roles: ['admin', 'contabilidad'],
    },
    {
      name: 'Usuarios',
      href: '/dashboard/usuarios',
      icon: Users,
      roles: ['admin'],
    },
    {
      name: 'Configuración',
      href: '/dashboard/configuracion',
      icon: Settings,
      roles: ['admin'],
    },
  ]

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.rol)
  )

  const isActive = (href: string) => currentPath === href

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-xl transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Ferretería
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Sistema de Gestión</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                          : 'text-foreground hover:bg-accent/50 hover:text-accent-foreground hover:scale-[1.01] hover:shadow-md'
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-transform ${isActive(item.href) ? 'scale-110' : ''}`} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                )
              })}

              {/* Opciones específicas para caja */}
              {user.rol === 'caja' && (
                <>
                  <li>
                    <button
                      onClick={() => {
                        setShowBoletaVentasModal(true)
                        setIsOpen(false)
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 text-foreground hover:bg-accent/50 hover:text-accent-foreground hover:scale-[1.01] hover:shadow-md"
                    >
                      <Receipt className="w-5 h-5" />
                      <span className="font-medium">Boleta de Ventas</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setShowDejarDineroModal(true)
                        setIsOpen(false)
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 text-foreground hover:bg-accent/50 hover:text-accent-foreground hover:scale-[1.01] hover:shadow-md"
                    >
                      <Wallet className="w-5 h-5" />
                      <span className="font-medium">Dejar Dinero en Caja</span>
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Modales */}
      {showBoletaVentasModal && (
        <BoletaVentasModal
          user={user}
          onClose={() => setShowBoletaVentasModal(false)}
        />
      )}

      {showDejarDineroModal && (
        <DejarDineroModal
          user={user}
          onClose={() => setShowDejarDineroModal(false)}
        />
      )}

      {showCierreTurnoModal && (
        <CierreTurnoModal
          user={user}
          onClose={() => setShowCierreTurnoModal(false)}
          onConfirmLogout={handleConfirmLogout}
        />
      )}
    </>
  )
}
