export default function ReviewCard({ review, showDetails = false }) {
    if (!review) return null

    const fakePct = Math.round((review.fake_probability || 0) * 100)
    const sentPct = Math.round((review.sentiment_score || 0.5) * 100)
    const isFake = review.is_fake
    const words = review.suspicious_words || []

    return (
        <div className={`glass-card p-5 border-l-4 ${isFake ? 'border-red-500' : 'border-emerald-500'} animate-slide-up`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={isFake ? 'badge-fake' : 'badge-real'}>
                        {isFake ? '🚨 FAKE' : '✅ GENUINE'}
                    </span>
                    <span className="text-xs text-gray-500">
                        Confidence {Math.round((review.confidence || 0) * 100)}%
                    </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-400">
                        Fake Prob: <span className={`font-bold ${isFake ? 'text-red-400' : 'text-emerald-400'}`}>{fakePct}%</span>
                    </span>
                    <span className="text-gray-400">
                        Sentiment: <span className={`font-bold ${sentPct > 60 ? 'text-emerald-400' : sentPct < 40 ? 'text-red-400' : 'text-yellow-400'
                            }`}>{sentPct}%</span>
                    </span>
                </div>
            </div>

            {/* Review text with highlights */}
            <div className="text-sm text-gray-300 leading-relaxed bg-white/3 rounded-xl p-4 font-mono">
                {words.length > 0
                    ? words.map((w, i) => (
                        <span
                            key={i}
                            className={w.suspicious
                                ? 'bg-red-500/25 text-red-300 rounded px-0.5 border-b border-red-500/50 cursor-help'
                                : 'text-gray-300'}
                            title={w.suspicious ? '⚠️ Suspicious pattern detected' : undefined}
                        >
                            {w.word}{' '}
                        </span>
                    ))
                    : <span>{review.review_text}</span>
                }
            </div>

            {/* Stats bars */}
            {showDetails && (
                <div className="mt-4 space-y-2">
                    <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Fake Probability</span><span>{fakePct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${isFake ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${fakePct}%` }}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Sentiment Score</span><span>{sentPct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${sentPct > 60 ? 'bg-emerald-500' : sentPct < 40 ? 'bg-red-500' : 'bg-yellow-500'
                                    }`}
                                style={{ width: `${sentPct}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Text features */}
            {showDetails && review.text_features && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(review.text_features).map(([k, v]) => (
                        <span key={k} className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded-lg">
                            {k.replace(/_/g, ' ')}: <b className="text-gray-200">{v}</b>
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
