
export type ChevronProps = {
  direction?: 'left' | 'up' | 'right' | 'down';
  width?: number;
  height?: number;
  color?: string;
};

function calculateDegrees(direction?: 'left' | 'up' | 'right' | 'down') {
  switch (direction) {
    case 'left': return 90;
    case 'up': return 180;
    case 'right': return 270;
    default: return 0;
  }
}

export function Chevron({ direction, width, height, color }: ChevronProps) {
  const degs = calculateDegrees(direction);
  return (
    <svg style={{ transform: `rotate(${degs}deg)` }} width={width ?? "14"} height={height ?? "9"} viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_51_3)">
        <path d="M1 1L7 7L13 1" stroke={color ?? 'white'} stroke-width="2"/>
      </g>
      <defs>
        <clipPath id="clip0_51_3">
          <rect width="14" height="9" stroke={color ?? 'white'}/>
        </clipPath>
      </defs>
    </svg>
  );
}
