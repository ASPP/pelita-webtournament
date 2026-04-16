export function Dot({ blink = false }: { blink?: boolean }) {
  const prop = blink ? { className: 'animate-pulse' } : {};

  return <span {...prop}>⚫&#xFE0E;</span>;
}

export function ColoredDot({ color }: { color: string }) {
  return <span className="colored-dot" style={{ color: color }}>⚫&#xFE0E;</span>;
}
