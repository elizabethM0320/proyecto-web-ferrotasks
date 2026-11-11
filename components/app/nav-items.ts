import { BarChart3, KanbanSquare, Settings } from 'lucide-react'

export const NAV_ITEMS = [
  { href: '/', label: 'Tablero Kanban', icon: KanbanSquare, showCount: true },
  { href: '/metricas', label: 'Métricas & Resumen', icon: BarChart3 },
  { href: '/perfil', label: 'Perfil & Ajustes', icon: Settings },
] as const
