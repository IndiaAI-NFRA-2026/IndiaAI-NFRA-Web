interface CardProps {
  label: string;
  value: string | number;
}

export default function Card({ label, value }: Readonly<CardProps>) {
  return (
    <div className="rounded border border-(--color-filters-border) bg-(--color-background-color) p-4">
      <h3 className="mb-1 text-sm font-medium text-(--color-table-header-text-color)">{label}</h3>
      <span className="text-[20px] font-bold text-(--color-sidebar-primary)">{value}</span>
    </div>
  );
}
