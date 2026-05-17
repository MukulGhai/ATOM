import { useId } from 'react'

export default function BrandLogo({
  size = 36,
  className = '',
  showWordmark = false,
  showTagline = false,
}) {
  const id = useId().replace(/:/g, '')
  const orbitA = `atomquest-orbit-a-${id}`
  const orbitB = `atomquest-orbit-b-${id}`
  const orbitC = `atomquest-orbit-c-${id}`
  const nucleus = `atomquest-nucleus-${id}`

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 96 96"
        fill="none"
        role="img"
        aria-label="AtomQuest logo"
        className="shrink-0"
      >
        <ellipse
          cx="48"
          cy="48"
          rx="39"
          ry="15"
          stroke={`url(#${orbitA})`}
          strokeWidth="6.5"
          strokeLinecap="round"
          transform="rotate(-32 48 48)"
        />
        <ellipse
          cx="48"
          cy="48"
          rx="39"
          ry="15"
          stroke={`url(#${orbitB})`}
          strokeWidth="6.5"
          strokeLinecap="round"
          transform="rotate(32 48 48)"
        />
        <ellipse
          cx="48"
          cy="48"
          rx="39"
          ry="15"
          stroke={`url(#${orbitC})`}
          strokeWidth="6.5"
          strokeLinecap="round"
          transform="rotate(90 48 48)"
        />
        <circle cx="48" cy="48" r="11" fill={`url(#${nucleus})`} />
        <circle cx="48" cy="48" r="4.8" fill="#FFFFFF" opacity="0.26" />
        <defs>
          <linearGradient id={orbitA} x1="9" y1="48" x2="87" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#263AA8" />
            <stop offset="0.46" stopColor="#12314D" />
            <stop offset="1" stopColor="#0F8F83" />
          </linearGradient>
          <linearGradient id={orbitB} x1="9" y1="48" x2="87" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#12213B" />
            <stop offset="0.52" stopColor="#1E5B78" />
            <stop offset="1" stopColor="#14A686" />
          </linearGradient>
          <linearGradient id={orbitC} x1="9" y1="48" x2="87" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3944B5" />
            <stop offset="0.52" stopColor="#0E233A" />
            <stop offset="1" stopColor="#148A80" />
          </linearGradient>
          <radialGradient id={nucleus} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(43 42) rotate(48.8) scale(23.8)">
            <stop stopColor="#3144C6" />
            <stop offset="0.55" stopColor="#118A83" />
            <stop offset="1" stopColor="#0D172A" />
          </radialGradient>
        </defs>
      </svg>

      {showWordmark && (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="text-[1.35rem] font-black tracking-normal text-slate-950 leading-none">
            AtomQuest
          </span>
          {showTagline && (
            <span className="mt-1 text-[0.78rem] font-semibold tracking-normal text-slate-600 leading-none">
              Goal Command Center
            </span>
          )}
        </span>
      )}
    </div>
  )
}
