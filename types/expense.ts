export interface ExpenseHistory {
    id: string;
    reject_reason: string;
    category_name: string;
    date: string; // ISO string
    amount: number;
    photo?: string;
    contact_number?: string;
    contactNumber?: string;
    mobile_number?: string;
    mobileNumber?: string;
    latitude?: number | null;
    longitude?: number | null;
    status?: 'approve' | 'reject' | 'pending';
    approve_amount?: number;
    remark?: string;
    remark_type?: string;
    audio?: string;
    voice_note_url?: string;
    voice_note_duration?: number;
}

export interface DailyExpenseGroup {
    date: string; // D/M/YYYY
    total_amount: number;
    total_expense_count: number;
    employee_total_amount: number;
    categories: string[];
    expenses: ExpenseHistory[];
}

export interface ExpenseResponse {
    employee_id: string;
    total_expense_count: number;
    total_expense_amount: number;
    expense_categories: string[];
    history: DailyExpenseGroup[];
}

export interface CreateExpenseParams {
    category_id: string;
    amount: number;
    expense_date: string; // YYYY-MM-DD
    contact_number?: string;
    photo?: any;
    latitude?: number;
    longitude?: number;
    remark?: string;
    remark_type?: string;
    voice?: any;
    voice_note_duration?: number;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface ExpenseDetailResponse {
    opening_balance: number;
    closing_balance: number;
    total_received: number;
    total_spent: number;
}
