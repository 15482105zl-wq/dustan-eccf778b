import { useId } from "react";

const AiIcon = ({ className }: { className?: string }) => {
  const uid = useId().replace(/:/g, "");
  const gradId = `ai-grad-${uid}`;
  const maskId = `ai-mask-${uid}`;

  return (
    <svg viewBox="16 20 64 64" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="14" y1="14" x2="82" y2="82">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="0.55" stopColor="#6d7bff" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="96" height="96">
          <rect x="0" y="0" width="96" height="96" fill="white" />
          <path d="M40 36H50C57.5 36 62 40.5 62 46S57.5 56 50 56H40Z" fill="black" />
        </mask>
      </defs>
      <path
        d="M30 24H66A10 10 0 0 1 76 34V58A10 10 0 0 1 66 68H48L34 79V68H30A10 10 0 0 1 20 58V34A10 10 0 0 1 30 24Z"
        fill={`url(#${gradId})`}
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

export default AiIcon;
