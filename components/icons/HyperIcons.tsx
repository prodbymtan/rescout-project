'use client';

import { ReactNode, useId } from 'react';

export type HyperIconProps = {
  className?: string;
  size?: number;
  title?: string;
};

const ICON_STROKE = 2.2;

function Svg({
  size = 24,
  className,
  title,
  children,
}: HyperIconProps & { children: ReactNode }) {
  const titleId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-labelledby={title ? titleId : undefined}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {children}
    </svg>
  );
}

const strokeProps = {
  stroke: 'currentColor',
  strokeWidth: ICON_STROKE,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  vectorEffect: 'non-scaling-stroke' as const,
};

export function IconScout(props: HyperIconProps) {
  return (
    <Svg {...props} title={props.title ?? 'Scout'}>
      <rect x="6.5" y="4" width="11" height="16" rx="2.4" {...strokeProps} />
      <path d="M9.5 8h5M9.5 12h5M9.5 16h3.5" {...strokeProps} />
      <path d="M6.5 7H5.2a1.7 1.7 0 0 0-1.7 1.7V17a3 3 0 0 0 3 3h8" {...strokeProps} />
    </Svg>
  );
}

export function IconTeams(props: HyperIconProps) {
  return (
    <Svg {...props} title={props.title ?? 'Teams'}>
      <circle cx="12" cy="8.8" r="2.3" {...strokeProps} />
      <path d="M7.8 17.8a4.2 4.2 0 0 1 8.4 0" {...strokeProps} />
      <circle cx="6.5" cy="10.5" r="1.5" {...strokeProps} />
      <circle cx="17.5" cy="10.5" r="1.5" {...strokeProps} />
      <path d="M3.9 17.8a3.1 3.1 0 0 1 3.2-2.7M20.1 17.8a3.1 3.1 0 0 0-3.2-2.7" {...strokeProps} />
    </Svg>
  );
}

export function IconMatches(props: HyperIconProps) {
  return (
    <Svg {...props} title={props.title ?? 'Matches'}>
      <rect x="4" y="5.2" width="16" height="14.8" rx="2.6" {...strokeProps} />
      <path d="M8 3.8v3M16 3.8v3M4 9.5h16" {...strokeProps} />
      <path d="M7.8 13.1h4M7.8 16.2h8.4" {...strokeProps} />
    </Svg>
  );
}

export function IconAnalytics(props: HyperIconProps) {
  return (
    <Svg {...props} title={props.title ?? 'Analytics'}>
      <path d="M4 19h16" {...strokeProps} />
      <path d="M7 17v-4.5M12 17V9.3M17 17v-6.7" {...strokeProps} />
      <path d="M7 12.5 12 8.7l5 2.1" {...strokeProps} />
      <circle cx="17" cy="10.8" r="1" {...strokeProps} />
    </Svg>
  );
}

export function IconSettings(props: HyperIconProps) {
  return (
    <Svg {...props} title={props.title ?? 'Settings'}>
      <circle cx="12" cy="12" r="3.1" {...strokeProps} />
      <path d="M12 4.2v2.2M12 17.6v2.2M4.2 12h2.2M17.6 12h2.2" {...strokeProps} />
      <path d="M6.5 6.5 8 8M16 16l1.5 1.5M17.5 6.5 16 8M8 16l-1.5 1.5" {...strokeProps} />
      <circle cx="12" cy="12" r="6.8" {...strokeProps} />
    </Svg>
  );
}

export function IconPlay(props: HyperIconProps) {
  return (
    <Svg {...props} title={props.title ?? 'Start'}>
      <path d="M9.2 7.5 16.7 12l-7.5 4.5V7.5Z" {...strokeProps} />
    </Svg>
  );
}

export function IconPause(props: HyperIconProps) {
  return (
    <Svg {...props} title={props.title ?? 'Pause'}>
      <path d="M9.2 7.2v9.6M14.8 7.2v9.6" {...strokeProps} />
    </Svg>
  );
}

export function IconReset(props: HyperIconProps) {
  return (
    <Svg {...props} title={props.title ?? 'Reset'}>
      <path d="M8.1 7.2H4v4.1M4 11.3a8 8 0 1 0 2.5-5.7l1.6 1.6" {...strokeProps} />
    </Svg>
  );
}

export function IconUndo(props: HyperIconProps) {
  return (
    <Svg {...props} title={props.title ?? 'Undo'}>
      <path d="M8.7 7.5H5v3.7" {...strokeProps} />
      <path d="M5 11.2a6.8 6.8 0 0 1 6.8-5.7h1.8a4.7 4.7 0 1 1 0 9.4H8.8" {...strokeProps} />
    </Svg>
  );
}

export function AllianceDot({
  alliance,
  className,
  title,
}: {
  alliance: 'red' | 'blue';
  className?: string;
  title?: string;
}) {
  const color = alliance === 'red' ? 'var(--secondary-orange)' : 'var(--primary-blue)';
  return (
    <span
      className={className}
      title={title}
      aria-hidden
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: 999,
        background: color,
      }}
    />
  );
}

