import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User, Search, AlertTriangle, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts'
import TrustScoreGauge from '../components/TrustScoreGauge'
import { getReviewer, getReviewers } from '../api/reviewApi'

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-gray-900 border border-white/10 rounded-xl p-3 text-xs">
            <p className="text-gray-300 font-semibold mb-1">{label}</p>
            {payload.map((p) => <p key={p.name} style={{ color: p.color }}>{p.name}: <b>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</b></p>)}
        </div>
    )
}

export default function ReviewerProfile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchId, setSearchId] = useState('')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [leaderboard, setLeaderboard] = useState([])
    const [lbLoading, setLbLoading] = useState(true)

    useEffect(() => {
        setLbLoading(true)
        getReviewers({ sort: '-trust_score', limit: 10 })
            .then((d) => setLeaderboard(d.users || []))
            .catch(() => setLeaderboard(DEMO_LB))
            .finally(() => setLbLoading(false))
    }, [])

    useEffect(() => {
        if (id) fetchReviewer(id)
    }, [id])

    const fetchReviewer = async (reviewerId) => {
        setLoading(true)
        setError(null)
        try {
            const d = await getReviewer(reviewerId)
            setData(d)
        } catch (err) {
            setError(err.response?.status === 404 ? 'Reviewer not found.' : 'Could not load reviewer.')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        if (!searchId.trim()) return
        navigate(`/reviewer/${searchId.trim()}`)
    }

    const user = data?.user || null
    const stats = data?.review_stats || null
    const reviews = data?.recent_reviews || []
    const breakdown = user?.trust_breakdown || {}

    const radarData = Object.entries(breakdown).map(([key, value]) => ({
        subject: key.replace(/_/g, ' '),
        value: parseFloat(value) || 0,
    }))

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
                <h1 className="section-title flex items-center gap-3">
                    <User size={24} className="text-brand-400" /> Reviewer Profiles
                </h1>
                <p className="section-subtitle">Search a reviewer by ID or browse the trust leaderboard</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: search + leaderboard */}
                <div className="space-y-5">
                    {/* Search */}
                    <div className="glass-card p-5">
                        <h3 className="text-white font-semibold mb-3">🔍 Search Reviewer</h3>
                        <div className="flex gap-2">
                            <input
                                className="input-field text-sm flex-1"
                                placeholder="Reviewer MongoDB ID..."
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button onClick={handleSearch} className="btn-primary px-4 py-2">
                                <Search size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="glass-card p-5">
                        <h3 className="text-white font-semibold mb-3">🏆 Trust Leaderboard</h3>
                        {lbLoading ? (
                            <div className="text-center text-gray-500 py-4">Loading...</div>
                        ) : leaderboard.length === 0 ? (
                            <div className="text-center text-gray-500 py-4 text-sm">No reviewers yet</div>
                        ) : (
                            <div className="space-y-2">
                                {leaderboard.map((u, i) => (
                                    <div
                                        key={u._id}
                                        onClick={() => navigate(`/reviewer/${u._id}`)}
                                        className="flex items-center justify-between bg-white/3 hover:bg-white/6 rounded-xl px-3 py-2.5 cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 w-5">#{i + 1}</span>
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                        ${u.trust_score >= 70 ? 'bg-emerald-600/20 text-emerald-400' :
                                                    u.trust_score >= 40 ? 'bg-yellow-600/20 text-yellow-400' :
                                                        'bg-red-600/20 text-red-400'}`}>
                                                {u.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors">{u.name}</p>
                                                <p className="text-[10px] text-gray-500">{u.review_count} reviews</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${u.trust_score >= 70 ? 'text-emerald-400' :
                                                    u.trust_score >= 40 ? 'text-yellow-400' : 'text-red-400'
                                                }`}>{Math.round(u.trust_score)}</span>
                                            <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: profile */}
                <div className="lg:col-span-2">
                    {error && (
                        <div className="glass-card p-6 border-red-500/20 bg-red-600/5 text-center">
                            <XCircle size={40} className="text-red-400 mx-auto mb-3" />
                            <p className="text-red-300 font-semibold">{error}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="glass-card p-12 text-center">
                            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-gray-400">Loading reviewer profile...</p>
                        </div>
                    )}

                    {!loading && !error && !user && (
                        <div className="glass-card p-12 text-center">
                            <User size={48} className="text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg font-medium">Select a reviewer from the leaderboard</p>
                            <p className="text-gray-500 text-sm mt-2">or search by MongoDB ID above</p>
                        </div>
                    )}

                    {user && !loading && (
                        <div className="space-y-5 animate-slide-up">
                            {/* Profile header */}
                            <div className="glass-card p-6 flex items-start gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black
                  ${user.trust_score >= 70 ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' :
                                        user.trust_score >= 40 ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/20' :
                                            'bg-red-600/20 text-red-400 border border-red-500/20'}`}>
                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-white">{user.name}</h2>
                                    <p className="text-gray-400 text-sm">{user.email}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className={`badge ${user.trust_score >= 70 ? 'badge-real' :
                                                user.trust_score >= 40 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                    'badge-fake'}`}>
                                            {user.trust_label || (user.trust_score >= 70 ? '✅ Trusted' : user.trust_score >= 40 ? '⚠️ Medium' : '🚨 Suspicious')}
                                        </span>
                                        {user.is_bot && <span className="badge-fake">🤖 Bot Flagged</span>}
                                        <span className="badge bg-white/10 text-gray-300 border border-white/10">{user.account_age} days old</span>
                                    </div>
                                </div>
                                <TrustScoreGauge score={user.trust_score} size={140} />
                            </div>

                            {/* Stats grid */}
                            {stats && (
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Total Reviews', value: stats.total, color: 'text-white' },
                                        { label: 'Fake Reviews', value: stats.fake, color: 'text-red-400' },
                                        { label: 'Genuine', value: stats.real, color: 'text-emerald-400' },
                                        { label: 'Products', value: stats.unique_products, color: 'text-brand-400' },
                                        { label: 'Avg Sentiment', value: `${Math.round(stats.avg_sentiment * 100)}%`, color: 'text-violet-400' },
                                        { label: 'Avg Length', value: `${stats.avg_review_length}w`, color: 'text-cyan-400' },
                                    ].map((s) => (
                                        <div key={s.label} className="glass-card p-3 text-center">
                                            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Trust breakdown radar */}
                            {radarData.length > 0 && (
                                <div className="chart-container">
                                    <h3 className="text-white font-semibold mb-4">Trust Score Breakdown</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                            <Radar name="Score" dataKey="value" stroke="#6175f1" fill="#6175f1" fillOpacity={0.25} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Recent reviews */}
                            <div className="glass-card p-5">
                                <h3 className="text-white font-semibold mb-3">Recent Reviews</h3>
                                {reviews.length === 0
                                    ? <p className="text-gray-500 text-sm">No reviews found.</p>
                                    : <div className="space-y-2">
                                        {reviews.map((r) => (
                                            <div key={r._id} className={`flex items-start gap-3 p-3 rounded-xl bg-white/3 border-l-2 ${r.is_fake ? 'border-red-500' : 'border-emerald-500'}`}>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-300 truncate">{r.review_text}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{r.product_id?.name || 'Unknown product'} · {new Date(r.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="shrink-0">
                                                    {r.is_fake
                                                        ? <AlertTriangle size={16} className="text-red-400" />
                                                        : <CheckCircle size={16} className="text-emerald-400" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const DEMO_LB = [
    { _id: '1', name: 'Alice M.', trust_score: 92, review_count: 34 },
    { _id: '2', name: 'Bob K.', trust_score: 78, review_count: 18 },
    { _id: '3', name: 'Carol P.', trust_score: 61, review_count: 12 },
    { _id: '4', name: 'Dave X.', trust_score: 35, review_count: 88 },
    { _id: '5', name: 'Eve  R.', trust_score: 18, review_count: 120 },
]
