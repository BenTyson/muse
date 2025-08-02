'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import CartButton from '@/components/shop/CartButton'
import CartSidebar from '@/components/shop/CartSidebar'
import { ShoppingBag, Camera, User, LogOut, Menu, X, Package } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'DASHBOARD', icon: Camera },
  { href: '/packages', label: 'SESSIONS', icon: Camera },
  { href: '/shop', label: 'GALLERY', icon: ShoppingBag },
  { href: '/orders', label: 'ORDERS', icon: Package },
]

export default function Navigation() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  if (status === 'loading') return null

  return (
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Agency Side Style */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-4 group">
              {/* Circular logo with gradient */}
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-black font-black text-xl">EM</span>
                </div>
                {/* Small decorative ring */}
                <div className="absolute -inset-1 border-2 border-pink-500/30 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-black text-xl tracking-tight">ELECTRIC</div>
                <div className="text-transparent bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text font-black text-xl tracking-tight -mt-1">MUSE</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Bold Style */}
          {session && (
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-6 py-3 text-sm font-black tracking-wide transition-all duration-300 group ${
                      isActive
                        ? 'text-black'
                        : 'text-white hover:text-black'
                    }`}
                  >
                    {/* Background gradient that appears on hover/active */}
                    <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-cyan-400 to-pink-500 scale-100' 
                        : 'bg-gradient-to-r from-cyan-400 to-pink-500 scale-0 group-hover:scale-100'
                    }`}></div>
                    
                    {/* Content */}
                    <div className="relative flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    
                    {/* Decorative dot for active state */}
                    {isActive && (
                      <div className="absolute -bottom-2 left-1/2 w-2 h-2 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full transform -translate-x-1/2"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Right Side - User Menu & Cart */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                {/* Cart Button - Styled */}
                <div className="relative">
                  <button
                    onClick={() => setCartOpen(true)}
                    className="relative p-3 text-white hover:text-cyan-400 transition-colors group"
                  >
                    <ShoppingBag className="w-6 h-6" />
                    {/* Cart count badge if needed */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-xs">0</span>
                    </div>
                  </button>
                </div>
                
                {/* User Menu - Desktop */}
                <div className="hidden lg:flex items-center space-x-4">
                  <div className="flex items-center space-x-3 px-4 py-2 bg-gray-900 rounded-full border border-gray-700">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {session.user?.firstName || session.user?.email?.split('@')[0] || 'User'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => signOut()}
                    className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-3 text-white hover:text-cyan-400 transition-colors"
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <button className="px-6 py-3 text-white font-bold border-2 border-gray-600 rounded-full hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300">
                    LOGIN
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-6 py-3 text-black font-bold bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full hover:scale-105 transition-transform duration-300">
                    SIGN UP
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {session && mobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-gray-800">
            <div className="space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-4 px-4 py-4 rounded-2xl font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-400 to-pink-500 text-black'
                        : 'text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-lg">{item.label}</span>
                  </Link>
                )
              })}
              
              {/* Mobile User Section */}
              <div className="pt-6 border-t border-gray-700 mt-6">
                <div className="flex items-center justify-between px-4 py-4 bg-gray-900 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="text-white font-bold">
                        {session.user?.firstName || 'User'}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {session.user?.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </nav>
  )
}