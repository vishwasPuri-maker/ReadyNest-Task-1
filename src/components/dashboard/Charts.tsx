// Lightweight, dependency-free SVG charts for the analytics page.

export function DonutChart({
  percentage,
  size = 180,
  stroke = 18,
}: {
  percentage: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(Math.max(percentage, 0), 100) / 100) * circumference;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={stroke}
      />
      {/* Progress */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="var(--foreground)"
        fontSize={size * 0.22}
        fontWeight="700"
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  );
}

export function FormBars({
  title,
  published,
  views,
  fills,
  conversion,
  max,
}: {
  title: string;
  published: boolean;
  views: number;
  fills: number;
  conversion: number;
  max: number;
}) {
  const viewWidth = max > 0 ? (views / max) * 100 : 0;
  const fillWidth = max > 0 ? (fills / max) * 100 : 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold">{title}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-widest ${
              published
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted"
            }`}
          >
            {published ? "PUBLISHED" : "DRAFT"}
          </span>
        </div>
        <span className="text-xs text-muted">{conversion}% conversion</span>
      </div>

      <Bar label="Views" value={views} width={viewWidth} tone="faint" />
      <div className="mt-3">
        <Bar label="Fills" value={fills} width={fillWidth} tone="solid" />
      </div>
    </div>
  );
}

function Bar({
  label,
  value,
  width,
  tone,
}: {
  label: string;
  value: number;
  width: number;
  tone: "solid" | "faint";
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span>{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all ${
            tone === "solid" ? "bg-accent" : "bg-foreground/40"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
