export interface Student {
  id: number;
  student_id: string;
  name: string;
  email: string | null;
  phone: string;
  room_number: string;
  department: string | null;
  session: string | null;
  monthly_fee: number;
  status: 'resident' | 'former' | 'suspended';
  admission_date: string;
  guardian_name: string | null;
  guardian_phone: string | null;
  created_at: string;
  total_due?: number;
  total_paid?: number;
}

export interface Payment {
  id: number;
  receipt_no: string;
  student_id: number;
  month_year: string;
  amount_paid: number;
  due_adjusted: number;
  payment_method: string;
  transaction_id: string | null;
  remarks: string | null;
  received_by: string;
  paid_at: string;
  student_name?: string;
  room_number?: string;
  student_code?: string;
  student_phone?: string;
  student_department?: string;
  student_session?: string;
  remaining_due?: number;
}

export interface Due {
  id: number;
  student_id: number;
  title: string;
  month_year: string | null;
  amount: number;
  paid_amount?: number;
  remaining_amount?: number;
  status: 'unpaid' | 'paid' | 'partially_paid';
  created_at: string;
}

export interface ManagerUser {
  id: number;
  username: string;
  name: string;
  role: string;
}
