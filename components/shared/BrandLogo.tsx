'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export type BrandLogoVariant = 'full' | 'mark' | 'inverse';

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  href?: string;
  className?: string;
  imageClassName?: string;
};

const LOGO = {
  full: '/brand/pitiq-logo.png',
  mark: '/brand/pitiq-mark.png',
  inverse: '/brand/pitiq-logo-inverse.png',
} as const;

const SIZE = {
  full: 'h-11 w-auto max-w-[240px]',
  mark: 'h-16 w-auto max-w-[120px]',
  inverse: 'h-11 w-auto max-w-[240px]',
} as const;

export default function BrandLogo({
  variant = 'full',
  href,
  className,
  imageClassName,
}: BrandLogoProps) {
  const src = LOGO[variant];

  const image = (
    <img
      src={src}
      alt="PitIQ — Pause. Assess. Advance."
      className={cn('object-contain object-left', SIZE[variant], imageClassName)}
      decoding="async"
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          'inline-flex items-center transition-opacity duration-150 ease-out hover:opacity-85',
          className,
        )}
      >
        {image}
      </Link>
    );
  }

  return <div className={cn('inline-flex items-center', className)}>{image}</div>;
}
