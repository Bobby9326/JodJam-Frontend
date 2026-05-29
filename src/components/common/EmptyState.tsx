interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message = 'ไม่มีข้อมูล' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-brown-muted">
      <p className="text-sm">{message}</p>
    </div>
  )
}
