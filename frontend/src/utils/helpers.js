import { clsx } from 'clsx'

export const cn = (...args) => clsx(args)

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export const formatPercent = (val) => `${Number(val).toFixed(1)}%`

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export const getRiskColor = (score) => {
  if (score >= 0.7) return { text: 'text-red-400',   bg: 'bg-red-500/15',   label: 'High Risk' }
  if (score >= 0.4) return { text: 'text-amber-400', bg: 'bg-amber-500/15', label: 'Medium Risk' }
  return             { text: 'text-green-400', bg: 'bg-green-500/15', label: 'Low Risk' }
}

export const CHART_COLORS = {
  brand:  '#6c63ff',
  cyan:   '#06b6d4',
  green:  '#10b981',
  amber:  '#f59e0b',
  red:    '#ef4444',
  pink:   '#ec4899',
  grid:   'rgba(255,255,255,0.05)',
  text:   'rgba(255,255,255,0.4)',
}