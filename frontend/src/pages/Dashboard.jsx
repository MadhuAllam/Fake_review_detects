import { useEffect, useState } from 'react'
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import { BarChart3, Shield, AlertTriangle, Users, Bot, Package, TrendingUp, RefreshCw } from 'lucide-react'
import StatCard from '../components/StatCard'
import { getStats, getReviews } from '../api/reviewApi'

const COLORS = {
    fake: '#ef4444',
    real: '#10b981',
    pos: '#10b981',
    neg: '#ef4444',
    neu: '#f59e0b',
    brand: '#6175f1',
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-gray-900/95 border border-white/10 rounded-xl p-3 backdrop-blur-xl">
            <p className="text-gray-300 text-xs font-semibold mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }} className="text-xs">
                    {p.name}: <b>{p.value}</b>
                </p>
            ))}
        </div>
    )
}

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastFetched, setLastFetched] = useState(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [s, r] = await Promise.all([getStats(), getReviews({ limit: 200 })])
            setStats(s)
            setReviews(r.reviews || [])
            setLastFetched(new Date())
        } catch {
            // use demo data if backend is down
            setStats(DEMO_STATS)
            setReviews(DEMO_REVIEWS)
            setLastFetched(new Date())
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const summary = stats?.summary || {}
    const volume = stats?.volumeByDay || DEMO_VOLUME
    const sentDist = stats?.sentimentDist || DEMO_SENTIMENT
    const suspicious = stats?.suspiciousUsers || []

    const pieData = [
        { name: 'Fake', value: summary.fakeReviews || 0 },
        { name: 'Genuine', value: summary.realReviews || 0 },
    ]
    const sentPieData = sentDist.map((s) => ({
        name: s._id || s.name,
        value: s.count || s.value || 0,
    }))

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading dashboard...</p>
            </div>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <h1 className="section-title flex items-center gap-3">
                        <BarChart3 size={26} className="text-brand-400" /> Admin Dashboard
                    </h1>
                    <p className="section-subtitle">Real-time overview of review authenticity and platform health</p>
                </div>
                <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Shield} label="Total Reviews" value={summary.totalReviews || 0} color="brand" />
                <StatCard icon={AlertTriangle} label="Fake Detected" value={summary.fakeReviews || 0} color="danger"
                    subtitle={`${summary.fakePercent || 0}% of all reviews`} />
                <StatCard icon={Users} label="Total Reviewers" value={summary.totalUsers || 0} color="violet" />
                <StatCard icon={Bot} label="Bots Detected" value={summary.botUsers || 0} color="warning" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard icon={TrendingUp} label="Genuine Reviews" value={summary.realReviews || 0} color="success" />
                <StatCard icon={Package} label="Products Tracked" value={summary.totalProducts || 0} color="brand" />
                <StatCard icon={AlertTriangle} label="Active Alerts" value={summary.totalAlerts || 0} color="danger" />
                <StatCard icon={Shield} label="Fake Rate"
                    value={`${summary.fakePercent || 0}%`} color={summary.fakePercent > 30 ? 'danger' : 'success'} />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                {/* Fake vs Real Pie */}
                <div className="chart-container">
                    <h3 className="text-white font-semibold mb-4">Fake vs Genuine Reviews</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                                dataKey="value" stroke="none">
                                <Cell fill={COLORS.fake} />
                                <Cell fill={COLORS.real} />
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-5 mt-2">
                        {pieData.map((p, i) => (
                            <div key={p.name} className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full" style={{ background: i === 0 ? COLORS.fake : COLORS.real }} />
                                <span className="text-gray-400">{p.name}: <b className="text-white">{p.value}</b></span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sentiment distribution */}
                <div className="chart-container">
                    <h3 className="text-white font-semibold mb-4">Sentiment Distribution</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={sentPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                                dataKey="value" stroke="none">
                                {sentPieData.map((_, i) => (
                                    <Cell key={i} fill={[COLORS.pos, COLORS.neg, COLORS.neu][i % 3]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center flex-wrap gap-3 mt-2">
                        {sentPieData.map((p, i) => (
                            <div key={p.name} className="flex items-center gap-1.5 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: [COLORS.pos, COLORS.neg, COLORS.neu][i % 3] }} />
                                <span className="text-gray-400 capitalize">{p.name}: <b className="text-white">{p.value}</b></span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Suspicious users table */}
                <div className="chart-container">
                    <h3 className="text-white font-semibold mb-4">🚨 Suspicious Reviewers</h3>
                    {suspicious.length === 0 ? (
                        <div className="text-center text-gray-500 py-8 text-sm">No suspicious reviewers found</div>
                    ) : (
                        <div className="space-y-2">
                            {suspicious.slice(0, 5).map((u) => (
                                <div key={u._id} className="flex items-center justify-between bg-white/3 rounded-xl px-3 py-2.5">
                                    <div>
                                        <p className="text-sm font-medium text-white">{u.name}</p>
                                        <p className="text-xs text-gray-500">{u.fake_count}/{u.review_count} fake</p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-lg font-black ${u.trust_score < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {u.trust_score}
                                        </div>
                                        <div className="text-[10px] text-gray-500">Trust</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Review volume bar chart */}
            <div className="chart-container mb-5">
                <h3 className="text-white font-semibold mb-4">📊 Review Volume — Last 7 Days</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={volume} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                        <Bar dataKey="total" name="Total" fill={COLORS.brand} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="fake" name="Fake" fill={COLORS.fake} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Recent reviews table */}
            <div className="chart-container">
                <h3 className="text-white font-semibold mb-4">Recent Reviews</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-400 text-xs uppercase border-b border-white/8">
                                <th className="text-left py-2 px-3">Review Excerpt</th>
                                <th className="text-left py-2 px-3">Status</th>
                                <th className="text-left py-2 px-3">Fake Prob</th>
                                <th className="text-left py-2 px-3">Sentiment</th>
                                <th className="text-left py-2 px-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.slice(0, 10).map((r) => (
                                <tr key={r._id} className="table-row">
                                    <td className="table-cell text-gray-300 max-w-[260px] truncate">{r.review_text}</td>
                                    <td className="table-cell">
                                        <span className={r.is_fake ? 'badge-fake' : 'badge-real'}>
                                            {r.is_fake ? '🚨 FAKE' : '✅ REAL'}
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                        <span className={r.fake_probability > 0.5 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                                            {Math.round(r.fake_probability * 100)}%
                                        </span>
                                    </td>
                                    <td className="table-cell capitalize text-gray-300">{r.sentiment_label}</td>
                                    <td className="table-cell text-gray-500 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {reviews.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No reviews yet — submit one on the Analyze page</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// ── Demo data fallback ──
const DEMO_VOLUME = [
    { _id: '2024-03-04', total: 12, fake: 4 },
    { _id: '2024-03-05', total: 19, fake: 7 },
    { _id: '2024-03-06', total: 8, fake: 2 },
    { _id: '2024-03-07', total: 25, fake: 11 },
    { _id: '2024-03-08', total: 30, fake: 14 },
    { _id: '2024-03-09', total: 18, fake: 6 },
    { _id: '2024-03-10', total: 22, fake: 9 },
]
const DEMO_SENTIMENT = [
    { _id: 'positive', count: 85 },
    { _id: 'negative', count: 42 },
    { _id: 'neutral', count: 28 },
]
const DEMO_STATS = {
    summary: { totalReviews: 155, fakeReviews: 61, realReviews: 94, fakePercent: 39.4, totalUsers: 42, botUsers: 3, totalAlerts: 5, totalProducts: 20 },
    volumeByDay: DEMO_VOLUME,
    sentimentDist: DEMO_SENTIMENT,
    suspiciousUsers: [],
}
const DEMO_REVIEWS = []
