const VAN = "M6 22H40Q45 22 48 25L58 34Q60 35 60 38V47Q60 49 58 49H6Q4 49 4 47V24Q4 22 6 22Z";
const WINDSCREEN = "M43 26L52 34H43Z";

/** The Roof Prism logo: `fg` draws the body, and `bg` should match what sits behind it. */
export function BrandMark({
  fg,
  bg,
  accent = "var(--color-paper)",
  className,
}: {
  fg: string;
  bg: string;
  accent?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M12 23L16 12H40L44 23Z" fill={fg} />
      <rect x={21} y={15.5} width={14} height={3.5} fill={accent} />
      <path d={VAN} transform="translate(0 3)" fill={fg} />
      <path d={WINDSCREEN} transform="translate(0 3)" fill={bg} />
      <circle cx={28} cy={37} r={11} fill={bg} />
      <circle cx={28} cy={37} r={7.5} fill={fg} />
      <circle cx={28} cy={37} r={3.5} fill={accent} />
      {[11, 51].map((cx) => (
        <circle key={cx} cx={cx} cy={52} r={6.5} fill={fg} stroke={bg} strokeWidth={2.5} />
      ))}
    </svg>
  );
}
