import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Filter, RefreshCw, Bell, ShieldAlert, Clock, Package } from 'lucide-react'
import { getAlerts, resolveAlert } from '../api/reviewApi'

const SEVERITY_CONFIG = {
    critical: { class: 'badge-critical', icon: '🔴', bg: 'border-red-600/40 bg-red-900/10' },
    high: { class: 'badge-high', icon: '🟠', bg: 'border-orange-600/30 bg-orange-900/8' },
    medium: { class: 'badge-medium', icon: '🟡', bg: 'border-yellow-600/20 bg-yellow-900/5' },
    low: { class: 'badge-low', icon: '🔵', bg: 'border-blue-600/20 bg-blue-900/5' },
}

const TYPE_LABELS = {
    rating_spike: { label: 'Rating Spike', icon: '📈' },
    review_burst: { label: 'Review Burst', icon: '💥' },
    bot_detected: { label: 'Bot Detected', icon: '🤖' },
    high_similarity: { label: 'High Similarity', icon: '🔗' },
    new_account_bombing: { label: 'New Account Bombing', icon: '👾' },
    sentiment_manipulation: { label: 'Sentiment Manipulation', icon: '🎭' },
}

export default function FraudAlerts() {
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [resolving, setResolving] = useState(null)
    const [severityFilter, setSeverity] = useState('')
    const [typeFilter, setType] = useState('')
    const [total, setTotal] = useState(0)

    const fetchAlerts = async () => {
        setLoading(true)
        const params = {}
        if (severityFilter) params.severity = severityFilter
        if (typeFilter) params.alert_type = typeFilter
        try {
            const d = await getAlerts({ ...params, limit: 50 })
            setAlerts(d.alerts || [])
            setTotal(d.pagination?.total || 0)
        } catch {
            setAlerts(DEMO_ALERTS)
            setTotal(DEMO_ALERTS.length)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAlerts() }, [severityFilter, typeFilter])

    const handleResolve = async (id) => {
        setResolving(id)
        try {
            await resolveAlert(id)
            setAlerts((prev) => prev.filter((a) => a._id !== id))
        } catch {
            // if demo data, just filter locally
            setAlerts((prev) => prev.filter((a) => a._id !== id))
        } finally {
            setResolving(null)
        }
    }

    const counts = {
        critical: alerts.filter((a) => a.severity === 'critical').length,
        high: alerts.filter((a) => a.severity === 'high').length,
        medium: alerts.filter((a) => a.severity === 'medium').length,
        low: alerts.filter((a) => a.severity === 'low').length,
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
                <h1 className="section-title flex items-center gap-3">
                    <ShieldAlert size={24} className="text-red-400" /> Fraud Alert Panel
                </h1>
                <p className="section-subtitle">Brand manipulation and suspicious activity alerts</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Critical', count: counts.critical, color: 'from-red-600/20 to-transparent border-red-500/30 text-red-400' },
                    { label: 'High', count: counts.high, color: 'from-orange-600/20 to-transparent border-orange-500/30 text-orange-400' },
                    { label: 'Medium', count: counts.medium, color: 'from-yellow-600/20 to-transparent border-yellow-500/30 text-yellow-400' },
                    { label: 'Low', count: counts.low, color: 'from-blue-600/20 to-transparent border-blue-500/30 text-blue-400' },
                ].map((s) => (
                    <div key={s.label} className={`glass-card bg-gradient-to-br ${s.color} p-4 text-center cursor-pointer hover:scale-[1.02] transition-all`}
                        onClick={() => setSeverity(severityFilter === s.label.toLowerCase() ? '' : s.label.toLowerCase())}>
                        <div className={`text-3xl font-black ${s.color.split(' ').pop()}`}>{s.count}</div>
                        <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6 flex flex-wrap items-center gap-3">
                <Filter size={16} className="text-gray-400" />
                <select
                    className="input-field text-sm w-auto bg-white/5 px-3 py-2"
                    value={severityFilter}
                    onChange={(e) => setSeverity(e.target.value)}
                >
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select
                    className="input-field text-sm w-auto bg-white/5 px-3 py-2"
                    value={typeFilter}
                    onChange={(e) => setType(e.target.value)}
                >
                    <option value="">All Types</option>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                </select>
                <button onClick={fetchAlerts} className="btn-secondary flex items-center gap-2 text-sm py-2">
                    <RefreshCw size={13} /> Refresh
                </button>
                <span className="ml-auto text-xs text-gray-500">{total} active alerts</span>
            </div>

            {/* Alert list */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : alerts.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-white font-semibold text-lg">No Active Alerts</h3>
                    <p className="text-gray-400 text-sm mt-2">All alerts have been resolved or no suspicious activity detected.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert) => {
                        const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium
                        const typeInfo = TYPE_LABELS[alert.alert_type] || { label: alert.alert_type, icon: '⚠️' }
                        return (
                            <div
                                key={alert._id}
                                className={`glass-card p-5 border ${sev.bg} hover:scale-[1.005] transition-all animate-slide-up`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="text-2xl shrink-0 mt-0.5">{typeInfo.icon}</div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center flex-wrap gap-2 mb-1.5">
                                            <span className={sev.class}>{sev.icon} {alert.severity?.toUpperCase()}</span>
                                            <span className="badge bg-white/8 text-gray-300 border border-white/10">{typeInfo.label}</span>
                                            {alert.is_resolved && <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Resolved</span>}
                                        </div>
                                        <p className="text-white font-medium text-sm">{alert.description}</p>

                                        {/* Meta */}
                                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                                            {alert.product_id && (
                                                <span className="flex items-center gap-1">
                                                    <Package size={11} /> {alert.product_id.name || 'Unknown product'}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock size={11} /> {new Date(alert.createdAt).toLocaleString()}
                                            </span>
                                            {alert.meta && Object.entries(alert.meta).slice(0, 2).map(([k, v]) => (
                                                <span key={k} className="bg-white/5 px-1.5 py-0.5 rounded">
                                                    {k.replace(/_/g, ' ')}: <b className="text-gray-300">{String(v)}</b>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Resolve button */}
                                    {!alert.is_resolved && (
                                        <button
                                            onClick={() => handleResolve(alert._id)}
                                            disabled={resolving === alert._id}
                                            className="shrink-0 btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                                        >
                                            {resolving === alert._id
                                                ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                : <CheckCircle size={13} />}
                                            Resolve
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

const DEMO_ALERTS = [
    {
        _id: '1', severity: 'critical', alert_type: 'rating_spike',
        description: '94% of reviews in last 24h are 5-star — rating manipulation suspected',
        product_id: { name: 'Sony WH-1000XM5' }, is_resolved: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        meta: { five_star_ratio: 0.94, count: 16 }
    },
    {
        _id: '2', severity: 'high', alert_type: 'review_burst',
        description: '12 reviews submitted in the last 1h — possible coordinated attack',
        product_id: { name: 'Instant Pot Pro' }, is_resolved: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        meta: { review_count: 12, window_hours: 1 }
    },
    {
        _id: '3', severity: 'high', alert_type: 'bot_detected',
        description: 'User posted 18 reviews across 18 products within 60 seconds — bot behavior detected',
        product_id: null, is_resolved: false,
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        meta: { similarity: 0.97, burst_seconds: 47 }
    },
    {
        _id: '4', severity: 'medium', alert_type: 'new_account_bombing',
        description: 'New account (age: 2d) posting fake-flagged reviews across multiple products',
        product_id: { name: 'Nike Air Max' }, is_resolved: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        meta: { account_age: 2, fake_reviews: 5 }
    },
    {
        _id: '5', severity: 'medium', alert_type: 'high_similarity',
        description: '8 fake reviews with >90% cosine similarity detected for this product in 24h',
        product_id: { name: 'Protein Powder X' }, is_resolved: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        meta: { fake_count: 8, similarity_max: 0.96 }
    },
]
