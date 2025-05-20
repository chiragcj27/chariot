import { HTMLAttributes } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white shadow rounded-lg overflow-hidden',
        className
      )}
      {...props}
    />
  );
} 