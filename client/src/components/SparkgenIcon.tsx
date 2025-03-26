export function SparkgenIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2L7 7H4v3l-2 2 2 2v3h3l5 5 5-5h3v-3l2-2-2-2V7h-3L12 2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}