import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { feeService } from '../../services/dataServices'
import { Modal, SectionHeader, ProgressBar } from '../../components/ui'
import { Plus, Download } from 'lucide-react'
import { mockFees } from '../../utils/mockData'
import { formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'

const PIE_DATA = [
  { name: 'Paid',    value: 68, color: '#10b981' },
  { name: 'Pending', value: 22, color: '#f59e0b' },
  { name: 'Overdue', value: 10, color: '#ef4444' },
]

export default function Fees() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('all')
  const [showPayModal, setShowPayModal] = useState(false)
  const [showFeeModal, setShowFeeModal] = useState(false)
  const [selectedFee, setSelectedFee] = useState(null)
  const [payAmount, setPayAmount] = useState('')
  const [feeForm, setFeeForm] = useState({ studentId:'', amount:'', dueDate:'', semester:1 })

  const { data } = useQuery({
    queryKey: ['fees'],
    queryFn: feeService.getAll,
    retry: false,
    placeholderData: { data: mockFees },
  })
  const fees = data?.data || data || mockFees
  const filtered = tab==='all' ? fees : fees.filter(f=>f.status===tab)

  const payMutation = useMutation({
    mutationFn: ({id, amount}) => feeService.recordPayment(id, {amount}),
    onSuccess: () => { qc.invalidateQueries(['fees']); toast.success('Payment recorded'); setShowPayModal(false) },
    onError: () => { toast.success('Payment recorded (Demo)'); setShowPayModal(false) },
  })

  const openPayModal = (fee) => { setSelectedFee(fee); setPayAmount(fee.due.toString()); setShowPayModal(true) }
  const totalCollected = fees.reduce((a,f)=>a+(f.paid||0),0)
  const totalPending   = fees.reduce((a,f)=>a+(f.due||0),0)

  return (
    <div className="page-wrapper space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Fee Management</h2>
          <p className="section-sub">{fees.length} records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>toast('Generating...')} className="btn-secondary flex items-center gap-2 text-xs"><Download size={13}/> Export</button>
          <button onClick={()=>setShowFeeModal(true)} className="btn-primary flex items-center gap-2 text-xs"><Plus size={13}/> Create Fee</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Collected', value:formatCurrency(totalCollected), color:'text-green-400' },
          { label:'Pending',         value:formatCurrency(totalPending),   color:'text-amber-400' },
          { label:'Overdue Count',   value:fees.filter(f=>f.status==='overdue').length, color:'text-red-400' },
          { label:'Collection Rate', value:Math.round((totalCollected/(totalCollected+totalPending))*100)+'%', color:'text-purple-400' },
        ].map(s=>(
          <div key={s.label} className="card">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card flex flex-col items-center">
          <p className="text-sm font-semibold text-white mb-4 self-start">Fee Status Distribution</p>
          <PieChart width={160} height={160}>
            <Pie data={PIE_DATA} cx={80} cy={80} innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0}>
              {PIE_DATA.map((e,i)=><Cell key={i} fill={e.color}/>)}
            </Pie>
            <Tooltip formatter={v=>`${v}%`} contentStyle={{background:'#141d33',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,fontSize:12}}/>
          </PieChart>
          <div className="space-y-2 w-full mt-4">
            {PIE_DATA.map(f=>(
              <div key={f.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-gray-400"><span className="w-2.5 h-2.5 rounded-sm" style={{background:f.color}}/>{f.name}</span>
                <span className="font-semibold text-white">{f.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-0 overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-border">
            <div className="tabs !mb-0">
              {[['all','All'],['paid','Paid'],['pending','Pending'],['overdue','Overdue']].map(([v,l])=>(
                <button key={v} onClick={()=>setTab(v)} className={`tab ${tab===v?'active':''}`}>{l}</button>
              ))}
            </div>
          </div>
          <table className="w-full">
            <thead><tr>{['Student','Amount','Paid','Due','Status','Action'].map(h=><th key={h} className="table-th">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(f=>(
                <tr key={f.id}>
                  <td className="table-td"><p className="text-sm font-medium text-white">{f.name}</p><p className="text-[10px] text-gray-500">{f.studentId}</p></td>
                  <td className="table-td text-sm text-gray-300">{formatCurrency(f.amount)}</td>
                  <td className="table-td text-sm text-green-400">{formatCurrency(f.paid)}</td>
                  <td className="table-td text-sm text-red-400">{formatCurrency(f.due)}</td>
                  <td className="table-td"><span className={`pill ${f.status==='paid'?'pill-green':f.status==='overdue'?'pill-red':'pill-amber'}`}>{f.status}</span></td>
                  <td className="table-td">{f.due>0&&<button onClick={()=>openPayModal(f)} className="btn-sm text-xs text-green-400 border-green-500/30">Pay</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showPayModal} onClose={()=>setShowPayModal(false)} title="Record Payment" size="sm">
        {selectedFee&&(
          <div className="space-y-4">
            <div className="bg-bg-tertiary rounded-lg p-3 text-sm">
              <p className="font-medium text-white">{selectedFee.name}</p>
              <p className="text-gray-400 text-xs mt-0.5">Due: {formatCurrency(selectedFee.due)}</p>
            </div>
            <div><label className="label">Payment Amount (₹)</label><input type="number" className="input" value={payAmount} onChange={e=>setPayAmount(e.target.value)} min={1} max={selectedFee.due}/></div>
            <div className="flex gap-3">
              <button onClick={()=>payMutation.mutate({id:selectedFee.id,amount:+payAmount})} className="btn-primary flex-1 justify-center">Record Payment</button>
              <button onClick={()=>setShowPayModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showFeeModal} onClose={()=>setShowFeeModal(false)} title="Create Fee Record">
        <form onSubmit={e=>{e.preventDefault();toast.success('Fee record created (Demo)');setShowFeeModal(false)}} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Student ID</label><input className="input" value={feeForm.studentId} onChange={e=>setFeeForm(f=>({...f,studentId:e.target.value}))} placeholder="STU-1284" required/></div>
            <div><label className="label">Fee Amount (₹)</label><input type="number" className="input" value={feeForm.amount} onChange={e=>setFeeForm(f=>({...f,amount:e.target.value}))} placeholder="45000" required/></div>
            <div><label className="label">Semester</label><select className="input" value={feeForm.semester} onChange={e=>setFeeForm(f=>({...f,semester:+e.target.value}))}>{[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>Semester {s}</option>)}</select></div>
            <div className="col-span-2"><label className="label">Due Date</label><input type="date" className="input" value={feeForm.dueDate} onChange={e=>setFeeForm(f=>({...f,dueDate:e.target.value}))} required/></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">Create</button>
            <button type="button" onClick={()=>setShowFeeModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}