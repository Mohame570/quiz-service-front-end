import Link from 'next/link';

type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: Crumb[];
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-caption text-foreground-secondary">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="uppercase tracking-wide transition-colors duration-150 ease-out hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className="uppercase tracking-wide text-foreground-secondary">
                {item.label}
              </span>
            )}
            {!isLast && <span aria-hidden className="text-muted-foreground">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
