import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ icon: Icon, label, value, trend, trendLabel, color = 'brand', subtitle }) {
    const colorMap = {
        brand: 'from-brand-600/20 to-brand-700/10 border-brand-500/20 text-brand-400',
        danger: 'from-red-600/20 to-red-700/10 border-red-500/20 text-red-400',
        success: 'from-emerald-600/20 to-emerald-700/10 border-emerald-500/20 text-emerald-400',
        warning: 'from-amber-600/20 to-amber-700/10 border-amber-500/20 text-amber-400',
        violet: 'from-violet-600/20 to-violet-700/10 border-violet-500/20 text-violet-400',
    }
    const style = colorMap[color] || colorMap['brand']

    return (
        <div className={`glass-card bg-gradient-to-br ${style.split(' ').slice(0, 2).join(' ')} border ${style.split(' ')[2]} p-6 hover:scale-[1.02] transition-all duration-300 animate-slide-up`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${style.split(' ').slice(0, 2).join(' ')} flex items-center justify-center border ${style.split(' ')[2]}`}>
                    <Icon size={20} className={style.split(' ')[3]} />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'text-emerald-400 bg-emerald-500/10' :
                            trend < 0 ? 'text-red-400 bg-red-500/10' :
                                'text-gray-400 bg-gray-500/10'
                        }`}>
                        {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label mt-1">{label}</div>
            {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
            {trendLabel && <div className="text-xs text-gray-500 mt-2">{trendLabel}</div>}
        </div>
    )
}
