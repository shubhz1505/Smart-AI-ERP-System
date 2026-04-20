export const mockStudents = [
  { id: 1, studentId: 'STU-1284', name: 'Priya Patel',    email: 'priya@college.edu',  course: 'B.Tech CS',  semester: 5, status: 'active',  phone: '9876543210', feeStatus: 'paid',    attendancePct: 91 },
  { id: 2, studentId: 'STU-1283', name: 'Ankit Sharma',   email: 'ankit@college.edu',  course: 'MBA',        semester: 3, status: 'active',  phone: '9876543211', feeStatus: 'pending', attendancePct: 78 },
  { id: 3, studentId: 'STU-1282', name: 'Meera Joshi',    email: 'meera@college.edu',  course: 'BCA',        semester: 2, status: 'active',  phone: '9876543212', feeStatus: 'paid',    attendancePct: 85 },
  { id: 4, studentId: 'STU-1281', name: 'Rahul Verma',    email: 'rahul@college.edu',  course: 'B.Com',      semester: 4, status: 'active',  phone: '9876543213', feeStatus: 'overdue', attendancePct: 62 },
  { id: 5, studentId: 'STU-1280', name: 'Sneha Reddy',    email: 'sneha@college.edu',  course: 'B.Tech CS',  semester: 7, status: 'active',  phone: '9876543214', feeStatus: 'paid',    attendancePct: 95 },
  { id: 6, studentId: 'STU-1279', name: 'Karan Mehta',    email: 'karan@college.edu',  course: 'B.Sc IT',    semester: 1, status: 'active',  phone: '9876543215', feeStatus: 'pending', attendancePct: 71 },
  { id: 7, studentId: 'STU-1278', name: 'Divya Singh',    email: 'divya@college.edu',  course: 'MBA',        semester: 1, status: 'active',  phone: '9876543216', feeStatus: 'paid',    attendancePct: 88 },
  { id: 8, studentId: 'STU-1277', name: 'Raju Sharma',    email: 'raju@college.edu',   course: 'B.Tech EC',  semester: 6, status: 'active',  phone: '9876543217', feeStatus: 'overdue', attendancePct: 55 },
]

export const mockCourses = [
  { id: 1, code: 'CS-301',  name: 'Data Structures & Algorithms',  department: 'Computer Science', credits: 4, semester: 3, instructor: 'Dr. A. Kumar',  enrolled: 48, capacity: 60 },
  { id: 2, code: 'CS-401',  name: 'Machine Learning Fundamentals', department: 'Computer Science', credits: 4, semester: 5, instructor: 'Dr. S. Gupta',  enrolled: 35, capacity: 40 },
  { id: 3, code: 'MBA-201', name: 'Financial Management',          department: 'Management',       credits: 3, semester: 3, instructor: 'Prof. R. Shah', enrolled: 52, capacity: 60 },
  { id: 4, code: 'IT-101',  name: 'Database Management Systems',   department: 'IT',               credits: 3, semester: 1, instructor: 'Dr. P. Joshi',  enrolled: 61, capacity: 70 },
  { id: 5, code: 'CS-501',  name: 'Cloud Computing & DevOps',      department: 'Computer Science', credits: 3, semester: 7, instructor: 'Mr. V. Pillai', enrolled: 28, capacity: 35 },
]

export const mockFees = [
  { id: 1, studentId: 'STU-1284', name: 'Priya Patel',  amount: 45000, paid: 45000, due: 0,     status: 'paid',    dueDate: '2025-07-01', semester: 5 },
  { id: 2, studentId: 'STU-1283', name: 'Ankit Sharma', amount: 55000, paid: 27500, due: 27500, status: 'pending', dueDate: '2025-06-15', semester: 3 },
  { id: 3, studentId: 'STU-1281', name: 'Rahul Verma',  amount: 38000, paid: 0,     due: 38000, status: 'overdue', dueDate: '2025-05-01', semester: 4 },
  { id: 4, studentId: 'STU-1277', name: 'Raju Sharma',  amount: 42000, paid: 10000, due: 32000, status: 'overdue', dueDate: '2025-04-15', semester: 6 },
  { id: 5, studentId: 'STU-1279', name: 'Karan Mehta',  amount: 36000, paid: 18000, due: 18000, status: 'pending', dueDate: '2025-07-10', semester: 1 },
  { id: 6, studentId: 'STU-1280', name: 'Sneha Reddy',  amount: 45000, paid: 45000, due: 0,     status: 'paid',    dueDate: '2025-07-01', semester: 7 },
]

export const mockAIAlerts = [
  { id: 1, type: 'warning', service: 'Fee Predictor',    port: 8001, title: 'Fee Defaulter Prediction',    desc: 'Raju Sharma (STU-1277) — 78% risk of default. Last payment: 45 days ago.',      time: '8 min ago'  },
  { id: 2, type: 'danger',  service: 'Anomaly Detector', port: 8002, title: 'Attendance Anomaly Detected', desc: 'CS-301 class — 31% attendance drop on Mondays. Possible scheduling conflict.', time: '15 min ago' },
  { id: 3, type: 'info',    service: 'Performance AI',   port: 8003, title: 'Exam Performance Insight',    desc: '12 students at risk of failing midterms based on attendance + fee patterns.',    time: '1 hr ago'   },
  { id: 4, type: 'warning', service: 'Fee Predictor',    port: 8001, title: 'Multiple Defaulters Flagged', desc: 'Rahul Verma (STU-1281) — 85% risk. Overdue since 60+ days. Action required.',  time: '2 hr ago'   },
  { id: 5, type: 'success', service: 'Automation',       port: null, title: 'Auto-Reminder Sent',          desc: '3 reminder emails sent automatically to overdue fee students. 1 responded.',  time: '3 hr ago'   },
]

export const mockAutomationLogs = [
  { id: 1, action: 'EMAIL_REMINDER',     student: 'Raju Sharma',  trigger: 'Fee overdue > 30 days',     status: 'completed', time: '2025-07-10 09:00' },
  { id: 2, action: 'ATTENDANCE_ALERT',   student: 'Rahul Verma',  trigger: 'Attendance < 60%',          status: 'completed', time: '2025-07-10 09:05' },
  { id: 3, action: 'PERFORMANCE_REPORT', student: 'Karan Mehta',  trigger: 'Low attendance + fee risk', status: 'completed', time: '2025-07-10 10:00' },
  { id: 4, action: 'EMAIL_REMINDER',     student: 'Rahul Verma',  trigger: 'Fee overdue > 60 days',     status: 'completed', time: '2025-07-09 09:00' },
]

export const revenueData = [
  { month: 'Jan', amount: 14.2 }, { month: 'Feb', amount: 15.8 },
  { month: 'Mar', amount: 13.1 }, { month: 'Apr', amount: 16.4 },
  { month: 'May', amount: 17.9 }, { month: 'Jun', amount: 15.2 },
  { month: 'Jul', amount: 18.4 }, { month: 'Aug', amount: 0 },
  { month: 'Sep', amount: 0 },    { month: 'Oct', amount: 0 },
  { month: 'Nov', amount: 0 },    { month: 'Dec', amount: 0 },
]

export const attendanceWeekly = [
  { day: 'Mon', cs: 82, mba: 76, bca: 88, bcom: 71 },
  { day: 'Tue', cs: 91, mba: 84, bca: 90, bcom: 79 },
  { day: 'Wed', cs: 88, mba: 81, bca: 85, bcom: 83 },
  { day: 'Thu', cs: 85, mba: 79, bca: 87, bcom: 76 },
  { day: 'Fri', cs: 74, mba: 68, bca: 80, bcom: 65 },
]