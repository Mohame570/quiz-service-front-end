export default function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="grid h-7 w-7 place-items-center rounded-full bg-primary-50 text-primary-700"
        aria-hidden="true"
      >
        {icon}
      </span>
      <h2 className="text-h3 text-primary-800">{title}</h2>
    </div>
  );
}
