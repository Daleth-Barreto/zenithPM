import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M3.5 18.5 12 5l8.5 13.5H3.5Zm3.25-1.5h10.5L12 8.25 6.75 17Z" />
    </svg>
  );
}
