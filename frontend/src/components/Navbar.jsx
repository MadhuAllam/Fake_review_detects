import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, BarChart3, Search, User, AlertTriangle, Package, Menu, X, Zap } from 'lucide-react'

const navItems = [
    { path: '/', label: 'Home', icon: Zap },
    { path: '/analyze', label: 'Analyze', icon: Search },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/reviewer', label: 'Reviewers', icon: User },
    { path: '/products', label: 'Sentiment', icon: Package },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
]

export default function Navbar() {
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/8">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
                        <Shield size={18} className="text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold gradient-text">TrustGuard</span>
                        <p className="text-[10px] text-gray-500 leading-none">AI Review Intelligence</p>
                    </div>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            className={location.pathname === path ? 'nav-link-active' : 'nav-link'}
                        >
                            <Icon size={15} />
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="md:hidden bg-gray-950/95 backdrop-blur-xl border-b border-white/8 px-6 pb-4 animate-fade-in">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl my-0.5 text-sm ${location.pathname === path
                                    ? 'text-white bg-brand-600/20 font-semibold'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                } transition-all`}
                        >
                            <Icon size={16} /> {label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    )
}
