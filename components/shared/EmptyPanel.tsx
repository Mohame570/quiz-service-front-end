type EmptyPanelProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function EmptyPanel({ title, description, action }: EmptyPanelProps) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-primary-50/40 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <h3 className="text-h3 text-foreground">{title}</h3>
        {description && (
          <p className="max-w-sm text-small text-foreground-secondary">{description}</p>
        )}
        {action}
      </div>
    </div>
  );
}
