import { HTMLAttributes, ReactNode } from 'react';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  className?: string;
}

export const H1 = ({ children, className = '', ...props }: HeadingProps) => (
  <h1 className={`text-4xl font-bold  tracking-[-0.02em] ${className}`} {...props}>
    {children}
  </h1>
);

export const H2 = ({ children, className = '', ...props }: HeadingProps) => (
  <h2 className={`text-3xl font-bold  tracking-[-0.02em] ${className}`} {...props}>
    {children}
  </h2>
);

export const H3 = ({ children, className = '', ...props }: HeadingProps) => (
  <h3 className={`text-2xl font-bold  tracking-[-0.02em] ${className}`} {...props}>
    {children}
  </h3>
);

export const Subtitle = ({ children, className = '', ...props }: HeadingProps) => (
  <p className={`text-lg font-medium  ${className}`} {...props}>
    {children}
  </p>
);

export const Body = ({ children, className = '', ...props }: HeadingProps) => (
  <p className={`text-base  leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const Small = ({ children, className = '', ...props }: HeadingProps) => (
  <p className={`text-sm font-medium  ${className}`} {...props}>
    {children}
  </p>
);

export const PreTitle = ({ children, className = '', ...props }: HeadingProps) => (
  <p className={`text-xs font-bold  uppercase tracking-[0.03em] ${className}`} {...props}>
    {children}
  </p>
);

interface TitleBlockProps {
  title: string;
  subtitle?: ReactNode;
  className?: string;
}

export const TitleBlock = ({ title, subtitle, className = '' }: TitleBlockProps) => (
  <div className={className}>
    <H2 className="mb-2">{title}</H2>
    {subtitle && <Body>{subtitle}</Body>}
  </div>
);
