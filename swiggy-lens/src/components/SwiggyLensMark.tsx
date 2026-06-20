export function SwiggyLensMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-saffron text-sm font-bold text-white ${className}`}
      aria-hidden
    >
      S
    </span>
  );
}
