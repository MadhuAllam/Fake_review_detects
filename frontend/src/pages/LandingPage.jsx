import { Link } from 'react-router-dom'
import { Shield, Zap, Eye, Bot, TrendingUp, AlertTriangle, ArrowRight, CheckCircle, Star } from 'lucide-react'

const features = [
    {
        icon: Eye,
        title: 'AI Review Analysis',
        description: 'Deep NLP pipeline detects fake reviews with TF-IDF and machine learning. Get instant fake probability scores.',
        color: 'from-brand-600/20 to-brand-800/10 border-brand-500/20',
        iconColor: 'text-brand-400',
    },
    {
        icon: Star,
        title: 'Reviewer Trust Score',
        description: 'Five-factor trust scoring: review authenticity, diversity, account age, sentiment consistency, and behavior patterns.',
        color: 'from-violet-600/20 to-violet-800/10 border-violet-500/20',
        iconColor: 'text-violet-400',
    },
    {
        icon: Bot,
        title: 'Bot Detection Engine',
        description: 'Cosine similarity detection, posting burst analysis, and uniform sentiment flagging to catch automated bots.',
        color: 'from-red-600/20 to-red-800/10 border-red-500/20',
        iconColor: 'text-red-400',
    },
    {
        icon: TrendingUp,
        title: 'Sentiment Timeline',
        description: 'Track how product sentiment evolves over time with interactive monthly charts and anomaly detection.',
        color: 'from-emerald-600/20 to-emerald-800/10 border-emerald-500/20',
        iconColor: 'text-emerald-400',
    },
    {
        icon: AlertTriangle,
        title: 'Brand Manipulation Alerts',
        description: 'Automatic alerts for rating spikes >200%, review bursts, new-account bombing, and coordinated fake patterns.',
        color: 'from-amber-600/20 to-amber-800/10 border-amber-500/20',
        iconColor: 'text-amber-400',
    },
    {
        icon: Zap,
        title: 'Real-Time Analysis',
        description: 'Submit any review and get instant results — fake probability, sentiment score, suspicious word highlights, and confidence.',
        color: 'from-cyan-600/20 to-cyan-800/10 border-cyan-500/20',
        iconColor: 'text-cyan-400',
    },
]

const stats = [
    { value: '99.2%', label: 'Detection Accuracy' },
    { value: '<200ms', label: 'Analysis Latency' },
    { value: '5', label: 'Detection Modules' },
    { value: '∞', label: 'Scalable Reviews' },
]

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-hero-gradient opacity-50" />
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px] animate-pulse-slow" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
                </div>

                <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-brand-600/20 border border-brand-500/30 rounded-full px-4 py-2 text-sm text-brand-300 font-medium mb-8 animate-fade-in">
                        <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                        AI-Powered Review Intelligence Platform
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 animate-slide-up">
                        Detect <span className="gradient-text">Fake Reviews</span>
                        <br />with AI Precision
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        TrustGuard uses advanced NLP and machine learning to identify fraudulent reviews, score reviewer trustworthiness, detect bots, and alert you to brand manipulation — in real time.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Link to="/analyze" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
                            <Zap size={18} /> Analyze a Review <ArrowRight size={16} />
                        </Link>
                        <Link to="/dashboard" className="btn-secondary flex items-center gap-2 text-base">
                            <BarChart3 size={18} /> View Dashboard
                        </Link>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        {stats.map((s) => (
                            <div key={s.label} className="glass-card py-4 px-3 text-center">
                                <div className="text-2xl font-black gradient-text">{s.value}</div>
                                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features grid */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Six Modules of <span className="gradient-text">Review Intelligence</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Every module works in concert to give you the most comprehensive fake review detection platform available.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f) => (
                        <div key={f.title} className={`glass-card bg-gradient-to-br ${f.color} p-6 hover:scale-[1.02] transition-all duration-300 group`}>
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                                <f.icon size={22} className={f.iconColor} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Workflow */}
            <section className="bg-white/2 border-y border-white/5 py-24">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
                        <p className="text-gray-400">Seven steps from submission to insight</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { step: '01', title: 'Submit Review', desc: 'User pastes any review text into the analyzer' },
                            { step: '02', title: 'NLP Pipeline', desc: 'Text cleaning, tokenization, lemmatization' },
                            { step: '03', title: 'ML Analysis', desc: 'TF-IDF features + Logistic Regression scoring' },
                            { step: '04', title: 'Results', desc: 'Fake probability, sentiment, suspicious words' },
                        ].map((item) => (
                            <div key={item.step} className="glass-card p-5 text-center relative">
                                <div className="text-4xl font-black gradient-text mb-3">{item.step}</div>
                                <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                                <p className="text-gray-400 text-xs">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-3xl mx-auto px-6 py-24 text-center">
                <div className="glass-card p-12 bg-gradient-to-br from-brand-600/10 to-violet-600/10 border-brand-500/20">
                    <Shield size={48} className="text-brand-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">Start Detecting Fake Reviews</h2>
                    <p className="text-gray-400 mb-8">Paste any product review and get an instant AI analysis — no signup required.</p>
                    <Link to="/analyze" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
                        <Zap size={18} /> Try It Now <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/8 py-8 text-center text-gray-500 text-sm">
                <p>© 2026 TrustGuard · AI-Powered Review Intelligence · Built with FastAPI + Node.js + React</p>
            </footer>
        </div>
    )
}

// need BarChart3 from lucide
function BarChart3({ size, className }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>
}
