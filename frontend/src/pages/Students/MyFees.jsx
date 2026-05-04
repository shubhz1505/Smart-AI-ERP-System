import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { feeService } from '../../services/dataServices'
import { studentService } from '../../services/studentService'
import { SectionHeader, ProgressBar, Spinner, Empty } from '../../components/ui'
import { formatCurrency } from '../../utils/helpers'
import { CreditCard, CheckCircle, AlertTriangle, Clock } from 'lucide-react'

export default function MyFees() {
  const { user } = useAuthStore()

  const { data: studentData } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: () => studentService.getByUserId(user?.id),
    retry: 1,
    enabled: !!user?.id && !user?.studentId,
  })

  const student   = studentData?.data || studentData || {}
  const studentId = user?.studentId || student?.id || studentData?.data?.id

  const { data, isLoading } = useQuery({
    queryKey: ['my-fees', studentId],
    queryFn: () => feeService.getByStudent(studentId),
    retry: 1,
    enabled: !!studentId,
  })

  const fees = (data?.data || data || []).map(f => ({
    ...f,
    amount: f.totalAmount || f.amount || 0,
    paid:   f.paidAmount  || f.paid   || 0,
    due:    f.dueAmount   || f.due    || (f.totalAmount - f.paidAmount) || 0,
    status: f.paymentStatus || f.status || 'pending',
  }))

  const totalAmount = fees.reduce((a, f) => a + (f.amount || 0), 0)
  const totalPaid   = fees.reduce((a, f) => a + (f.paid   || 0), 0)
  const totalDue    = fees.reduce((a, f) => a + (f.due    || 0), 0)
  const paidPct     = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0

  if (isLoading) return <Spinner />

  return (
    <div className="page-wrapper space-y-5">
      <div>
        <h2 className="section-title">My Fees</h2>
        <p className="section-sub">Your fee payment details</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <CreditCard size={20} className="text-purple-400 mx-auto mb-2" />
          <p className="font-display text-xl font-bold text-black">{formatCurrency(totalAmount)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Fee</p>
        </div>
        <div className="card text-center">
          <CheckCircle size={20} className="text-green-400 mx-auto mb-2" />
          <p className="font-display text-xl font-bold text-green-400">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-gray-500 mt-1">Paid</p>
        </div>
        <div className="card text-center">
          <AlertTriangle size={20} className="text-red-400 mx-auto mb-2" />
          <p className="font-display text-xl font-bold text-red-400">{formatCurrency(totalDue)}</p>
          <p className="text-xs text-gray-500 mt-1">Due</p>
        </div>
      </div>

      <div className="card">
        <SectionHeader title="Payment Progress" sub={`${paidPct}% paid`} />
        <ProgressBar value={paidPct} color="#10b981" />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Paid: {formatCurrency(totalPaid)}</span>
          <span>Remaining: {formatCurrency(totalDue)}</span>
        </div>
      </div>

      {fees.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-black">Fee Records</h3>
            <p className="text-xs text-gray-500 mt-0.5">{fees.length} records from database</p>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                {['Fee Type', 'Semester', 'Total', 'Paid', 'Due', 'Due Date', 'Status'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.map(fee => (
                <tr key={fee.id}>
                  <td className="table-td font-medium text-black">{fee.feeType || 'Tuition'}</td>
                  <td className="table-td text-gray-800">Sem {fee.semester || '—'}</td>
                  <td className="table-td text-gray-800">{formatCurrency(fee.amount)}</td>
                  <td className="table-td text-green-400">{formatCurrency(fee.paid)}</td>
                  <td className="table-td text-red-400">{formatCurrency(fee.due)}</td>
                  <td className="table-td text-gray-800 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {fee.dueDate || '—'}
                    </span>
                  </td>
                  <td className="table-td">
                    <span className={`pill text-[10px] ${
                      fee.status === 'paid'    ? 'pill-green' :
                      fee.status === 'partial' ? 'pill-amber' :
                      fee.status === 'overdue' ? 'pill-red'   : 'pill-amber'
                    }`}>
                      {fee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty icon="💰" message="No fee records found" />
      )}

      {fees.some(f => f.status === 'overdue') && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="text-red-400 font-medium text-sm">Overdue Fee Alert</p>
          </div>
          <p className="text-xs text-gray-400">
            You have overdue fees. Please pay immediately to avoid penalties and exam restrictions.
          </p>
        </div>
      )}
    </div>
  )
}