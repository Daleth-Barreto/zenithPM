import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12l3-9h12l3 9" />
      <path d="M3 21h18" />
      <path d="M12 12v9" />
      <path d="M7.5 12l4.5 9 4.5-9" />
    </svg>
  );
}
