'use client'

import Link from 'next/link'
import { User } from '@/lib/types'
import { ShoppingCart, Bell, User as UserIcon } from 'lucide-react'

interface HeaderProps {
  user: User
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {user.rol === 'admin' && (
            <Link
              href="/pos"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-600 text-primary-foreground rounded-lg font-medium hover-lift hover-glow shadow-lg transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Caja</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/50">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{user.nombre}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.rol}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
