export default function Rating({ value = 0, count, size = "sm" }) {
  const dim = size === "sm" ? 13 : 16;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width={dim}
            height={dim}
            viewBox="0 0 20 20"
            fill={i <= Math.round(value) ? "#e6591a" : "none"}
            stroke="#e6591a"
            strokeWidth="1"
          >
            <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.7l5.9-.9L10 1.5z" />
          </svg>
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-ink/50">({count})</span>}
    </div>
  );
}
