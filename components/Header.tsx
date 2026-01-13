'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@/lib/types'
import { 
  ShoppingCart, 
  User as UserIcon, 
  LogOut, 
  Shield,
  Warehouse,
  CreditCard,
  Calculator,
  ChevronDown
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import CierreTurnoModal from '@/components/CierreTurnoModal'

interface HeaderProps {
  user: User
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showCierreTurnoModal, setShowCierreTurnoModal] = useState(false)

  const handleLogout = () => {
    setShowCierreTurnoModal(true)
  }

  const handleConfirmLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getRolInfo = (rol: string) => {
    const roles: Record<string, { label: string; icon: any; color: string }> = {
      admin: { 
        label: 'Administrador', 
        icon: Shield, 
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' 
      },
      bodega: { 
        label: 'Bodega', 
        icon: Warehouse, 
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' 
      },
      caja: { 
        label: 'Caja', 
        icon: CreditCard, 
        color: 'text-green-500 bg-green-500/10 border-green-500/20' 
      },
      contabilidad: { 
        label: 'Contabilidad', 
        icon: Calculator, 
        color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' 
      },
    }
    return roles[rol] || { label: rol, icon: UserIcon, color: 'text-gray-500 bg-gray-500/10 border-gray-500/20' }
  }

  const rolInfo = getRolInfo(user.rol)
  const RolIcon = rolInfo.icon

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          {user.rol === 'admin' && pathname === '/pos' && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground rounded-lg font-medium hover:from-primary hover:to-primary/90 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Volver al Dashboard</span>
            </Link>
          )}
          {user.rol === 'admin' && pathname !== '/pos' && (
            <Link
              href="/pos"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground rounded-lg font-medium hover:from-primary hover:to-primary/90 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Caja</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-accent/50 to-accent/30 border border-border/50 backdrop-blur-sm hover:shadow-md transition-all duration-200">
            <div className={`w-10 h-10 rounded-lg ${rolInfo.color} border flex items-center justify-center`}>
              <RolIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-foreground leading-tight">{user.nombre}</p>
              <p className="text-xs text-muted-foreground font-medium">{rolInfo.label}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg font-medium transition-all duration-200 hover:shadow-md border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {showCierreTurnoModal && (
        <CierreTurnoModal
          user={user}
          onClose={() => setShowCierreTurnoModal(false)}
          onConfirmLogout={handleConfirmLogout}
        />
      )}
    </header>
  )
}
