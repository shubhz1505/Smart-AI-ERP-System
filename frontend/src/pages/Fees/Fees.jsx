import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { feeService } from '../../services/dataServices'
import { studentService } from '../../services/studentService'
import { Modal, SectionHeader, Spinner, Empty } from '../../components/ui'
import { Plus, Download } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function Fees() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('all')
  const [showPayModal, setShowPayModal] = useState(false)
  const [showFeeModal, setShowFeeModal] = useState(false)
  const [selectedFee, setSelectedFee] = useState(null)
  const [payAmount, setPayAmount] = useState('')
  const [feeForm, setFeeForm] = useState({
    studentId: '', totalAmount: '', dueDate: '', semester: 1, feeType: 'Tuition',
  })

  const { data: feesData, isLoading } = useQuery({
  queryKey: ['fees'],
  queryFn: () => feeService.getAll(),
  retry: 1,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
})
  const { data: statsData } = useQuery({
    queryKey: ['fees-stats'],
    queryFn: feeService.getStatistics,
    retry: 1,
  })
  const { data: studentsData } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getAll,
    retry: 1,
  })

  const rawFees = feesData?.data || feesData || []
  const fees = rawFees.map(f => ({
    ...f,
    name:      f.name      || f.studentName  || `Student ${f.studentId}`,
    studentId: f.studentId || f.rollNumber   || '—',
    amount:    f.totalAmount ?? f.amount     ?? 0,
    paid:      f.paidAmount  ?? f.paid       ?? 0,
    due:       f.dueAmount   ?? f.due        ?? Math.max(0, (f.totalAmount || 0) - (f.paidAmount || 0)),
    status:    (f.paymentStatus || f.status  || 'pending').toLowerCase(),
  }))

  const filtered = tab === 'all' ? fees : fees.filter(f => f.status === tab)
  const students = studentsData?.data || studentsData || []

  const totalCollected = statsData?.data?.totalPaid    ?? fees.reduce((a, f) => a + f.paid, 0)
  const totalPending   = statsData?.data?.totalPending ?? fees.reduce((a, f) => a + f.due,  0)
  const overdueCount   = fees.filter(f => f.status === 'overdue').length
  const collectionRate = (totalCollected + totalPending) > 0
    ? Math.round((totalCollected / (totalCollected + totalPending)) * 100)
    : 0

  const pieData = useMemo(() => {
    const total = fees.length || 1
    const paid    = fees.filter(f => f.status === 'paid').length
    const pending = fees.filter(f => f.status === 'pending' || f.status === 'partial').length
    const overdue = fees.filter(f => f.status === 'overdue').length
    return [
      { name: 'Paid',    value: Math.round((paid    / total) * 100), color: '#10b981' },
      { name: 'Pending', value: Math.round((pending / total) * 100), color: '#f59e0b' },
      { name: 'Overdue', value: Math.round((overdue / total) * 100), color: '#ef4444' },
    ]
  }, [fees])

  const payMutation = useMutation({
    mutationFn: ({ id, amount }) => feeService.recordPayment(id, { amount }),
    onSuccess: () => {
  qc.invalidateQueries(['fees'])
  qc.invalidateQueries(['fees-stats'])
  qc.invalidateQueries(['admin-dashboard'])
  qc.refetchQueries(['fees'])
  toast.success('Fee record created successfully!')
  setShowFeeModal(false)
  setFeeForm({ studentId: '', totalAmount: '', dueDate: '', semester: 1, feeType: 'Tuition' })
},
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to record payment'),
  })

  const createFeeMutation = useMutation({
  mutationFn: (data) => {
    console.log("🔥 SENDING TO BACKEND:", data)
    return feeService.create(data)
  },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fees'] })
      qc.invalidateQueries({ queryKey: ['fees-stats'] })
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success('Fee record created')
      setShowFeeModal(false)
      setFeeForm({ studentId: '', totalAmount: '', dueDate: '', semester: 1, feeType: 'Tuition' })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create fee'),
  })

  const openPayModal = (fee) => { setSelectedFee(fee); setPayAmount(String(fee.due)); setShowPayModal(true) }

  const handleCreateFee = (e) => {
    e.preventDefault()
    if (!feeForm.studentId || !feeForm.totalAmount || !feeForm.dueDate) {
      toast.error('Please fill all required fields'); return
    }
    createFeeMutation.mutate({
      studentId:   +feeForm.studentId,
      totalAmount: +feeForm.totalAmount,
      
      dueDate:     feeForm.dueDate,
      semester:    +feeForm.semester,
      feeType:     feeForm.feeType,
      
    })
  }

  const exportCSV = () => {
    if (fees.length === 0) { toast.error('No fee records to export'); return }
    const rows = [
      ['StudentId', 'Name', 'Amount', 'Paid', 'Due', 'Status', 'Due Date'],
      ...fees.map(f => [f.studentId, f.name, f.amount, f.paid, f.due, f.status, f.dueDate || '']),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv,' + encodeURIComponent(csv)
    a.download = `fees-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('CSV exported')
  }

  return (
    <div className="page-wrapper space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Fee Management</h2>
          <p className="section-sub">{fees.length} records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-xs"><Download size={13}/> Export</button>
          <button onClick={() => setShowFeeModal(true)} className="btn-primary flex items-center gap-2 text-xs"><Plus size={13}/> Create Fee</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Collected', value:formatCurrency(totalCollected), color:'text-green-400' },
          { label:'Pending',         value:formatCurrency(totalPending),   color:'text-amber-400' },
          { label:'Overdue Count',   value:overdueCount,                   color:'text-red-400' },
          { label:'Collection Rate', value:`${collectionRate}%`,           color:'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="card">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card flex flex-col items-center">
          <p className="text-sm font-semibold text-black mb-4 self-start">Fee Status Distribution</p>
          <PieChart width={160} height={160}>
            <Pie data={pieData} cx={80} cy={80} innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0}>
              {pieData.map((e,i) => <Cell key={i} fill={e.color}/>)}
            </Pie>
            <Tooltip formatter={v => `${v}%`} contentStyle={{background:'#141d33',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,fontSize:12}}/>
          </PieChart>
          <div className="space-y-2 w-full mt-4">
            {pieData.map(f => (
              <div key={f.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-gray-400"><span className="w-2.5 h-2.5 rounded-sm" style={{background:f.color}}/>{f.name}</span>
                <span className="font-semibold text-black">{f.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-0 overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-border">
            <div className="tabs !mb-0">
              {[['all','All'],['paid','Paid'],['pending','Pending'],['overdue','Overdue']].map(([v,l]) => (
                <button key={v} onClick={() => setTab(v)} className={`tab ${tab === v ? 'active' : ''}`}>{l}</button>
              ))}
            </div>
          </div>
          {isLoading ? <Spinner /> : filtered.length === 0 ? <Empty icon="💰" message="No fee records" /> : (
            <table className="w-full">
              <thead><tr>{['Student','Amount','Paid','Due','Status','Action'].map(h => <th key={h} className="table-th">{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id}>
                    <td className="table-td">
                      <p className="text-sm font-medium text-black">{f.name}</p>
                      <p className="text-[10px] text-gray-50">{f.studentId}</p>
                    </td>
                    <td className="table-td text-sm text-gray-700">{formatCurrency(f.amount)}</td>
                    <td className="table-td text-sm text-green-400">{formatCurrency(f.paid)}</td>
                    <td className="table-td text-sm text-red-400">{formatCurrency(f.due)}</td>
                    <td className="table-td">
                      <span className={`pill ${f.status === 'paid' ? 'pill-green' : f.status === 'overdue' ? 'pill-red' : 'pill-amber'}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="table-td">
                      {f.due > 0 && <button onClick={() => openPayModal(f)} className="btn-sm text-xs text-green-400 border-green-500/30">Pay</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={showPayModal} onClose={() => setShowPayModal(false)} title="Record Payment" size="sm">
        {selectedFee && (
          <div className="space-y-4">
            <div className="bg-bg-tertiary rounded-lg p-3 text-sm">
              <p className="font-medium text-white">{selectedFee.name}</p>
              <p className="text-gray-400 text-xs mt-0.5">Due: {formatCurrency(selectedFee.due)}</p>
            </div>
            <div>
              <label className="label">Payment Amount (₹)</label>
              <input type="number" className="input" value={payAmount}
                     onChange={e => setPayAmount(e.target.value)}
                     min={1} max={selectedFee.due}/>
            </div>
            <div className="flex gap-3">
              <button onClick={() => payMutation.mutate({ id: selectedFee.id, amount: +payAmount })}
                      disabled={payMutation.isPending}
                      className="btn-primary flex-1 justify-center">
                {payMutation.isPending ? 'Saving...' : 'Record Payment'}
              </button>
              <button onClick={() => setShowPayModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showFeeModal} onClose={() => setShowFeeModal(false)} title="Create Fee Record">
        <form onSubmit={handleCreateFee} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Student *</label>
              <select className="input" value={feeForm.studentId}
                      onChange={e => setFeeForm(f => ({ ...f, studentId: e.target.value }))} required>
                <option value="">Select student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} — {s.rollNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Fee Type</label>
              <select className="input" value={feeForm.feeType}
                      onChange={e => setFeeForm(f => ({ ...f, feeType: e.target.value }))}>
                <option>Tuition</option><option>Hostel</option><option>Exam</option><option>Library</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Semester</label>
              <select className="input" value={feeForm.semester}
                      onChange={e => setFeeForm(f => ({ ...f, semester: +e.target.value }))}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Fee Amount (₹) *</label>
              <input type="number" className="input" value={feeForm.totalAmount}
                     onChange={e => setFeeForm(f => ({ ...f, totalAmount: e.target.value }))}
                     placeholder="45000" required/>
            </div>
            <div>
              <label className="label">Due Date *</label>
              <input type="date" className="input" value={feeForm.dueDate}
                     onChange={e => setFeeForm(f => ({ ...f, dueDate: e.target.value }))} required/>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={createFeeMutation.isPending} className="btn-primary flex-1 justify-center">
              {createFeeMutation.isPending ? 'Creating...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowFeeModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}