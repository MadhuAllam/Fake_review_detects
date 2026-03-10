import { useState } from 'react'
import { Search, Loader2, AlertCircle, CheckCircle, BarChart2, Zap, Upload } from 'lucide-react'
import { analyzeReview, bulkUpload } from '../api/reviewApi'
import ReviewCard from '../components/ReviewCard'

const DEMO_REVIEWS = [
    { label: 'Fake Review (High confidence)', text: 'AMAZING AMAZING AMAZING! BEST PRODUCT EVER!! MUST BUY!! YOU WILL LOVE IT!! HIGHLY RECOMMEND TO EVERYONE!! PERFECT PERFECT PERFECT!! BUY NOW!!' },
    { label: 'Genuine Review', text: 'I have been using this laptop for three weeks now. The battery life is decent at around 7 hours. The keyboard is comfortable for typing but the trackpad is a bit small. Build quality is solid for the price range.' },
    { label: 'Suspicious Negative', text: 'WORST PRODUCT EVER!! TOTAL GARBAGE!! SCAM SCAM SCAM!! DO NOT BUY!! AVOID AT ALL COSTS!! BROKEN ON ARRIVAL!! RETURN IMMEDIATELY!!' },
]

export default function AnalyzePage() {
    const [reviewText, setReviewText] = useState('')
    const [reviewerName, setReviewerName] = useState('')
    const [reviewerEmail, setReviewerEmail] = useState('')
    const [productName, setProductName] = useState('')
    const [rating, setRating] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [bulkText, setBulkText] = useState('')
    const [bulkResult, setBulkResult] = useState(null)
    const [bulkLoading, setBulkLoading] = useState(false)
    const [tab, setTab] = useState('single')

    const handleAnalyze = async () => {
        if (!reviewText.trim()) return
        setLoading(true)
        setError(null)
        setResult(null)
        try {
            const data = await analyzeReview({
                review_text: reviewText,
                reviewer_name: reviewerName || undefined,
                reviewer_email: reviewerEmail || undefined,
                product_name: productName || undefined,
                rating: rating ? Number(rating) : undefined,
            })
            setResult(data)
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Analysis failed. Ensure backend is running.')
        } finally {
            setLoading(false)
        }
    }

    const handleBulkSubmit = async () => {
        const lines = bulkText.trim().split('\n').filter(Boolean)
        if (!lines.length) return
        setBulkLoading(true)
        setBulkResult(null)
        try {
            const reviews = lines.map((l) => ({ review_text: l }))
            const data = await bulkUpload(reviews)
            setBulkResult(data)
        } catch (err) {
            setError(err.response?.data?.error || 'Bulk upload failed.')
        } finally {
            setBulkLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center">
                        <Search size={18} className="text-white" />
                    </div>
                    <h1 className="section-title">Review Analyzer</h1>
                </div>
                <p className="section-subtitle ml-13">Submit any review text and get instant AI-powered analysis</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {['single', 'bulk'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-brand-600 text-white' : 'bg-white/8 text-gray-400 hover:text-white hover:bg-white/12'
                            }`}
                    >
                        {t === 'single' ? '📝 Single Review' : '📦 Bulk Upload'}
                    </button>
                ))}
            </div>

            {tab === 'single' && (
                <div className="space-y-5 animate-fade-in">
                    {/* Demo presets */}
                    <div className="glass-card p-4">
                        <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">Quick Demo Presets</p>
                        <div className="flex flex-wrap gap-2">
                            {DEMO_REVIEWS.map((d) => (
                                <button
                                    key={d.label}
                                    onClick={() => setReviewText(d.text)}
                                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition-all"
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main textarea */}
                    <div className="glass-card p-6">
                        <label className="text-sm font-semibold text-gray-300 block mb-2">Review Text *</label>
                        <textarea
                            className="input-field min-h-[140px] resize-y"
                            placeholder="Paste or type the product review to analyze..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        />

                        {/* Optional fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Reviewer Name (optional)</label>
                                <input className="input-field text-sm" placeholder="e.g. John D." value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Reviewer Email (optional)</label>
                                <input className="input-field text-sm" type="email" placeholder="john@example.com" value={reviewerEmail} onChange={(e) => setReviewerEmail(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Product Name (optional)</label>
                                <input className="input-field text-sm" placeholder="e.g. Sony WH-1000XM5" value={productName} onChange={(e) => setProductName(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Rating 1–5 (optional)</label>
                                <select className="input-field text-sm" value={rating} onChange={(e) => setRating(e.target.value)}>
                                    <option value="">Select rating</option>
                                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ★</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={loading || !reviewText.trim()}
                            className="btn-primary mt-5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                            {loading ? 'Analyzing...' : 'Analyze Review'}
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="glass-card p-4 border-red-500/30 bg-red-600/10 flex items-start gap-3">
                            <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-red-300 font-semibold text-sm">Analysis Error</p>
                                <p className="text-gray-400 text-xs mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className="animate-slide-up space-y-4">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <CheckCircle size={16} className="text-emerald-400" />
                                Analysis complete — saved to database
                            </div>
                            <ReviewCard
                                review={{
                                    review_text: reviewText,
                                    fake_probability: result.fake_probability,
                                    is_fake: result.is_fake,
                                    confidence: result.confidence,
                                    sentiment_score: result.sentiment_score,
                                    sentiment_label: result.sentiment_label,
                                    text_features: result.text_features,
                                    suspicious_words: result.suspicious_words,
                                }}
                                showDetails={true}
                            />

                            {/* Score breakdown cards */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className={`glass-card p-4 text-center border ${result.is_fake ? 'border-red-500/30 bg-red-600/10' : 'border-emerald-500/30 bg-emerald-600/10'}`}>
                                    <div className={`text-3xl font-black ${result.is_fake ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {Math.round(result.fake_probability * 100)}%
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">Fake Probability</div>
                                </div>
                                <div className="glass-card p-4 text-center">
                                    <div className={`text-3xl font-black ${result.sentiment_label === 'positive' ? 'text-emerald-400' :
                                            result.sentiment_label === 'negative' ? 'text-red-400' : 'text-yellow-400'
                                        }`}>
                                        {Math.round(result.sentiment_score * 100)}%
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">Sentiment Score</div>
                                </div>
                                <div className="glass-card p-4 text-center">
                                    <div className="text-3xl font-black text-brand-400">
                                        {Math.round(result.confidence * 100)}%
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">Confidence</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {tab === 'bulk' && (
                <div className="glass-card p-6 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                        <Upload size={16} className="text-brand-400" />
                        <h3 className="font-semibold text-white">Bulk Review Analysis</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">Enter one review per line. Up to 100 reviews will be analyzed.</p>
                    <textarea
                        className="input-field min-h-[200px] font-mono text-sm resize-y"
                        placeholder="Paste reviews here, one per line:&#10;This product is amazing! Best purchase ever!&#10;Battery life is decent. Build quality could be better.&#10;WORST PRODUCT EVER!! TOTAL SCAM!! DO NOT BUY!!"
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                    />
                    <button
                        onClick={handleBulkSubmit}
                        disabled={bulkLoading || !bulkText.trim()}
                        className="btn-primary mt-4 flex items-center gap-2 disabled:opacity-50"
                    >
                        {bulkLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {bulkLoading ? 'Processing...' : 'Upload & Analyze'}
                    </button>

                    {bulkResult && (
                        <div className="mt-5 space-y-3 animate-slide-up">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="glass-card p-3 text-center">
                                    <div className="text-2xl font-bold text-white">{bulkResult.total_processed}</div>
                                    <div className="text-xs text-gray-400">Total Processed</div>
                                </div>
                                <div className="glass-card p-3 text-center border-red-500/20 bg-red-600/5">
                                    <div className="text-2xl font-bold text-red-400">{bulkResult.fake_detected}</div>
                                    <div className="text-xs text-gray-400">Fake Detected</div>
                                </div>
                                <div className="glass-card p-3 text-center border-emerald-500/20 bg-emerald-600/5">
                                    <div className="text-2xl font-bold text-emerald-400">{bulkResult.total_processed - bulkResult.fake_detected}</div>
                                    <div className="text-xs text-gray-400">Genuine</div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="text-gray-400 text-xs uppercase border-b border-white/8">
                                        <th className="text-left py-2 px-3">#</th>
                                        <th className="text-left py-2 px-3">Review Excerpt</th>
                                        <th className="text-left py-2 px-3">Result</th>
                                    </tr></thead>
                                    <tbody>
                                        {bulkResult.results?.map((r, i) => (
                                            <tr key={i} className="table-row">
                                                <td className="table-cell text-gray-500">{i + 1}</td>
                                                <td className="table-cell text-gray-300">{r.review_text}...</td>
                                                <td className="table-cell">
                                                    <span className={r.is_fake ? 'badge-fake' : 'badge-real'}>
                                                        {r.is_fake ? '🚨 FAKE' : '✅ REAL'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
