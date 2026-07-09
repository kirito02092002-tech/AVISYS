interface InfoRowProps {
  label: string
  value?: string | null
  icon?: React.ReactNode
}

export function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {icon && <div className="mt-0.5 text-accent shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-text mt-0.5 break-words">
          {value?.trim() ? value : <span className="text-text-muted italic">Non renseigné</span>}
        </p>
      </div>
    </div>
  )
}
