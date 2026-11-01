"use client";
import { useId } from "react";
export default function StageArt({
  type = "Wedding",
  style = "Heritage",
}: {
  type?: string;
  style?: string;
}) {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      className={`stage-art art-${style.toLowerCase()}`}
      viewBox="0 0 560 340"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`${id}-grain`}
          width="18"
          height="18"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r=".6" fill="currentColor" opacity=".18" />
        </pattern>
        <linearGradient
          id={`${id}-arch`}
          x1="260"
          y1="40"
          x2="260"
          y2="300"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" stopOpacity=".18" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".02" />
        </linearGradient>
      </defs>
      <rect width="560" height="340" fill={`url(#${id}-grain)`} />
      <ellipse
        cx="282"
        cy="298"
        rx="200"
        ry="18"
        fill="currentColor"
        opacity=".08"
      />
      <path
        d="M157 287V155a124 124 0 0 1 248 0v132"
        fill={`url(#${id}-arch)`}
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M183 284V155a98 98 0 0 1 196 0v129"
        stroke="currentColor"
        strokeOpacity=".4"
      />
      <path
        d="M209 284V155a72 72 0 0 1 144 0v129"
        stroke="currentColor"
        strokeOpacity=".25"
      />
      <path
        d="M119 285h326M109 294h346"
        stroke="currentColor"
        strokeOpacity=".5"
      />
      {[110, 450].map((x) => (
        <g key={x}>
          <path
            d={`M${x} 282v-95m0 50c-38-9-36-37-16-25m16 7c30-14 31-39 9-27m-9 62c-30-3-37-25-17-19m17 37c35-4 41-29 17-19`}
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx={x} cy={184} r={9} fill="currentColor" opacity=".5" />
          <circle cx={x - 13} cy={190} r={7} fill="currentColor" opacity=".3" />
          <circle cx={x + 12} cy={195} r={8} fill="currentColor" opacity=".4" />
        </g>
      ))}
      {type === "Birthday" ? (
        <g>
          <path
            d="M253 264v-44h62v44m-70 0h78M260 220v-20h48v20"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M273 200v-15m22 15v-15" stroke="currentColor" />
          <circle cx="273" cy="180" r="3" fill="currentColor" />
          <circle cx="295" cy="180" r="3" fill="currentColor" />
        </g>
      ) : type === "Community" ? (
        <g>
          {[250, 280, 310].map((x) => (
            <g key={x}>
              <circle cx={x} cy={223} r="9" stroke="currentColor" />
              <path
                d={`M${x - 12} 264v-19a12 12 0 0 1 24 0v19`}
                stroke="currentColor"
              />
            </g>
          ))}
        </g>
      ) : (
        <g>
          <path
            d="M244 263h74v-28h-74v28Zm10-28v-18a27 27 0 0 1 54 0v18"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M276 235v28m10-28v28"
            stroke="currentColor"
            strokeOpacity=".4"
          />
        </g>
      )}
      <path
        d="M95 92c104 27 258 27 371 0"
        stroke="currentColor"
        strokeOpacity=".3"
      />
      {[130, 180, 230, 280, 330, 380, 430].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={i < 4 ? 100 + i * 3 : 109 - (i - 3) * 3}
          r="3"
          fill="currentColor"
          opacity=".7"
        />
      ))}
      <circle
        cx="448"
        cy="58"
        r="23"
        stroke="currentColor"
        strokeOpacity=".3"
      />
      <path
        d="M448 26v64m-32-32h64m-55-23 46 46m0-46-46 46"
        stroke="currentColor"
        strokeOpacity=".3"
      />
    </svg>
  );
}
