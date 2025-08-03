import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M12 2a10 10 0 100 20 10 10 0 000-20zM8.5 7H14a1.5 1.5 0 011.5 1.5v1.25a.75.75 0 01-1.5 0V8.5a.5.5 0 00-.5-.5H9.75l4.5 6.25H10a1.5 1.5 0 01-1.5-1.5v-1.25a.75.75 0 011.5 0v1.25a.5.5 0 00.5.5h2.25L7 8.25V17H8.5V7z"
        clipRule="evenodd"
      />
    </svg>
  );
}
