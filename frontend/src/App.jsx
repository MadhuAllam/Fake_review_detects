import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import AnalyzePage from './pages/AnalyzePage'
import Dashboard from './pages/Dashboard'
import ReviewerProfile from './pages/ReviewerProfile'
import ProductSentiment from './pages/ProductSentiment'
import FraudAlerts from './pages/FraudAlerts'

export default function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-950">
                <Navbar />
                <main className="pt-20">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/analyze" element={<AnalyzePage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/reviewer/:id" element={<ReviewerProfile />} />
                        <Route path="/reviewer" element={<ReviewerProfile />} />
                        <Route path="/products" element={<ProductSentiment />} />
                        <Route path="/alerts" element={<FraudAlerts />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    )
}
