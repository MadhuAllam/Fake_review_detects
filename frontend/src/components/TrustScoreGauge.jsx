export default function TrustScoreGauge({ score = 0, size = 180 }) {
    const radius = 70
    const stroke = 12
    const normalizedRadius = radius - stroke / 2
    const circumference = normalizedRadius * 2 * Math.PI
    const progress = Math.max(0, Math.min(score, 100)) / 100

    // Half-circle arc — sweep from 180° to 0° (left to right)
    const dashOffset = circumference * (1 - progress * 0.5) // half circle

    const color =
        score >= 70 ? '#10b981' :
            score >= 40 ? '#f59e0b' :
                '#ef4444'

    const label =
        score >= 70 ? 'TRUSTED' :
            score >= 40 ? 'MEDIUM TRUST' :
                'SUSPICIOUS'

    const svgSize = size
    const cx = svgSize / 2
    const cy = svgSize / 2 + 20

    // Build arc path for half circle (bottom half hidden)
    const startAngle = Math.PI          // left (180°)
    const endAngle = startAngle - progress * Math.PI  // sweep left to right

    const x1 = cx + normalizedRadius * Math.cos(Math.PI)
    const y1 = cy + normalizedRadius * Math.sin(Math.PI)
    const x2 = cx + normalizedRadius * Math.cos(endAngle)
    const y2 = cy + normalizedRadius * Math.sin(endAngle)
    const largeArc = progress > 0.5 ? 1 : 0

    return (
        <div className="flex flex-col items-center">
            <svg width={svgSize} height={svgSize * 0.65} viewBox={`0 0 ${svgSize} ${svgSize * 0.65}`}>
                {/* Background track */}
                <path
                    d={`M ${cx - normalizedRadius} ${cy} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${cx + normalizedRadius} ${cy}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                />
                {/* Progress arc */}
                {progress > 0.01 && (
                    <path
                        d={`M ${cx - normalizedRadius} ${cy} A ${normalizedRadius} ${normalizedRadius} 0 ${largeArc} 1 ${x2} ${y2}`}
                        fill="none"
                        stroke={color}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 8px ${color}80)`, transition: 'all 0.8s ease' }}
                    />
                )}
                {/* Score text */}
                <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="28" fontWeight="800" fontFamily="Inter">
                    {Math.round(score)}
                </text>
                <text x={cx} y={cy + 16} textAnchor="middle" fill={color} fontSize="10" fontWeight="700" fontFamily="Inter" letterSpacing="1.5">
                    {label}
                </text>
                {/* Tick marks */}
                {[0, 40, 70, 100].map((tick) => {
                    const angle = Math.PI - (tick / 100) * Math.PI
                    const ix = cx + (normalizedRadius - stroke * 1.2) * Math.cos(angle)
                    const iy = cy + (normalizedRadius - stroke * 1.2) * Math.sin(angle)
                    return (
                        <text key={tick} x={ix} y={iy + 4} textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="Inter">
                            {tick}
                        </text>
                    )
                })}
            </svg>
        </div>
    )
}
