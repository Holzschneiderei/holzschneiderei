interface AdminBadgeProps {
  id: string;
}

export default function AdminBadge({ id }: AdminBadgeProps) {
  return (
    <span
      className="admin-badge"
      title={`Element-ID: ${id}`}
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(id);
      }}
    >
      {id}
    </span>
  );
}
