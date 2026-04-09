// Shared StarRating component — used across job cards, contractor profiles, reviews, and dashboards
// Supports display mode (static) and input mode (interactive)

interface StarRatingProps {
  rating: number
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRate?: (rating: number) => void
  className?: string
}

const SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export default function StarRating({
  rating,
  max = 5,
  size = 'sm',
  interactive = false,
  onRate,
  className = '',
}: StarRatingProps) {
  const sz = SIZES[size]
  const displayRating = Math.round(rating)

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {interactive ? (
        // Interactive: clickable stars for review input
        <>
          {Array.from({ length: max }, (_, i) => i + 1).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => onRate?.(s)}
              className={`${sz} p-0.5 transition-transform hover:scale-110 focus:outline-none`}
              style={{ color: s <= displayRating ? '#F59E0B' : '#E5E5E5' }}
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </>
      ) : (
        // Display: static stars showing the rating
        <>
          {Array.from({ length: max }, (_, i) => i + 1).map(s => (
            <svg
              key={s}
              className={sz}
              style={{ color: s <= displayRating ? '#F59E0B' : '#E5E5E5' }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </>
      )}
    </span>
  )
}
