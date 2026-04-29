export function SFLogo({ size = 32, color = 'white' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {/* Shield */}
      <path
        d="M18 2L4 8v9c0 8.5 5.8 13.7 14 16 8.2-2.3 14-7.5 14-16V8L18 2z"
        fill="rgba(255,255,255,0.12)"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Chart arrow */}
      <polyline
        points="9,22 14,16 18,20 27,10"
        stroke="#4dd98a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <polyline
        points="22,10 27,10 27,15"
        stroke="#4dd98a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function SFLogoDark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <path
        d="M18 2L4 8v9c0 8.5 5.8 13.7 14 16 8.2-2.3 14-7.5 14-16V8L18 2z"
        fill="rgba(10,34,24,0.08)"
        stroke="var(--g600)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <polyline
        points="9,22 14,16 18,20 27,10"
        stroke="var(--g400)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <polyline
        points="22,10 27,10 27,15"
        stroke="var(--g400)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
