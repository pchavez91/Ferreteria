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
  LogOut,
  Menu,
  X,
} from 'lucide-react'

interface SidebarProps {
  user: User
  currentPath: string
}

export default function Sidebar({ user, currentPath }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
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
      name: 'Caja',
      href: '/dashboard/caja',
      icon: ShoppingCart,
      roles: ['admin', 'caja'],
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Ferretería</h2>
            <p className="text-sm text-gray-600 mt-1">{user.nombre}</p>
            <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold text-primary-700 bg-primary-100 rounded">
              {user.rol.toUpperCase()}
            </span>
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
