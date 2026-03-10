import { useEffect, useState } from 'react'
import { Package, TrendingUp } from 'lucide-react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts'
import { getProducts, getProductSentiment } from '../api/reviewApi'

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-gray-900 border border-white/10 rounded-xl p-3 text-xs">
            <p className="text-gray-300 font-semibold mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }}>{p.name}: <b>{p.value}</b></p>
            ))}
        </div>
    )
}

export default function ProductSentiment() {
    const [products, setProducts] = useState([])
    const [selected, setSelected] = useState(null)
    const [timeline, setTimeline] = useState([])
    const [loading, setLoading] = useState(false)
    const [productsLoading, setProductsLoading] = useState(true)

    useEffect(() => {
        setProductsLoading(true)
        getProducts()
            .then((d) => {
                const prods = d.products || DEMO_PRODUCTS
                setProducts(prods)
                if (prods.length > 0) setSelected(prods[0])
            })
            .catch(() => { setProducts(DEMO_PRODUCTS); setSelected(DEMO_PRODUCTS[0]) })
            .finally(() => setProductsLoading(false))
    }, [])

    useEffect(() => {
        if (!selected) return
        setLoading(true)
        getProductSentiment(selected._id)
            .then((d) => setTimeline(d.timeline || DEMO_TIMELINE))
            .catch(() => setTimeline(DEMO_TIMELINE))
            .finally(() => setLoading(false))
    }, [selected])

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
                <h1 className="section-title flex items-center gap-3">
                    <TrendingUp size={24} className="text-brand-400" /> Product Sentiment Analytics
                </h1>
                <p className="section-subtitle">Track how sentiment evolves over time per product</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Product list */}
                <div className="glass-card p-5">
                    <h3 className="text-white font-semibold mb-3">📦 Products</h3>
                    {productsLoading ? (
                        <div className="text-gray-500 text-sm text-center py-4">Loading...</div>
                    ) : (
                        <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                            {products.map((p) => (
                                <button
                                    key={p._id}
                                    onClick={() => setSelected(p)}
                                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${selected?._id === p._id
                                            ? 'bg-brand-600/20 border border-brand-500/30 text-white'
                                            : 'hover:bg-white/5 text-gray-400'
                                        }`}
                                >
                                    <p className="text-sm font-medium">{p.name}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                        {p.review_count} reviews · {p.fake_count} fake
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Charts */}
                <div className="lg:col-span-3 space-y-5">
                    {selected && (
                        <>
                            {/* Product header */}
                            <div className="glass-card p-5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                                    <p className="text-gray-400 text-sm">{selected.category}</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <div className="text-xl font-black text-white">{selected.review_count || 0}</div>
                                        <div className="text-[10px] text-gray-500">Reviews</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-black text-red-400">{selected.fake_count || 0}</div>
                                        <div className="text-[10px] text-gray-500">Fake</div>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-xl font-black ${(selected.manipulation_score || 0) > 50 ? 'text-red-400' : 'text-emerald-400'
                                            }`}>{Math.round(selected.manipulation_score || 0)}</div>
                                        <div className="text-[10px] text-gray-500">Manip. Score</div>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="chart-container flex items-center justify-center h-40">
                                    <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <>
                                    {/* Sentiment timeline line chart */}
                                    <div className="chart-container">
                                        <h3 className="text-white font-semibold mb-4">📈 Sentiment Timeline (by month)</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <AreaChart data={timeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <defs>
                                                    <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                                                    </linearGradient>
                                                    <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                                                <Area type="monotone" dataKey="positive" name="Positive" stroke="#10b981" fill="url(#posGrad)" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                                                <Area type="monotone" dataKey="negative" name="Negative" stroke="#ef4444" fill="url(#negGrad)" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
                                                <Line type="monotone" dataKey="neutral" name="Neutral" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 2, fill: '#f59e0b' }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Fake probability over time */}
                                    <div className="chart-container">
                                        <h3 className="text-white font-semibold mb-4">🚨 Avg Fake Probability Over Time</h3>
                                        <ResponsiveContainer width="100%" height={180}>
                                            <BarChart data={timeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                                                <Tooltip content={<CustomTooltip />} formatter={(v) => `${Math.round(v * 100)}%`} />
                                                <Bar dataKey="avg_fake" name="Avg Fake Prob" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.85} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

const DEMO_PRODUCTS = [
    { _id: 'p1', name: 'Sony WH-1000XM5', category: 'Electronics', review_count: 42, fake_count: 15, manipulation_score: 38 },
    { _id: 'p2', name: 'Nike Air Max', category: 'Footwear', review_count: 28, fake_count: 6, manipulation_score: 22 },
    { _id: 'p3', name: 'Instant Pot Pro', category: 'Kitchen', review_count: 19, fake_count: 8, manipulation_score: 62 },
]
const DEMO_TIMELINE = [
    { month: '2024-01', positive: 8, negative: 2, neutral: 2, total: 12, avg_fake: 0.18 },
    { month: '2024-02', positive: 10, negative: 1, neutral: 3, total: 14, avg_fake: 0.14 },
    { month: '2024-03', positive: 4, negative: 8, neutral: 2, total: 14, avg_fake: 0.72 },
    { month: '2024-04', positive: 12, negative: 1, neutral: 1, total: 14, avg_fake: 0.85 },
    { month: '2024-05', positive: 6, negative: 3, neutral: 2, total: 11, avg_fake: 0.29 },
]
