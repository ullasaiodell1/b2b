export interface TicketDetails {
    id: number;
    title: string;
    description: string;
    module: string;
    status: string;
    image_url: string | null;
    admin_reply: string | null;
    admin_name?: string | null;
    employee_name?: string | null;
    employee_image?: string | null;
    issue_type?: string | null;
    requested_check_in?: string | null;
    requested_check_out?: string | null;
    attendance_id?: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateTicketParams {
    title: string;
    description: string;
    module: string;
    imageUri?: string | null;
    requested_check_in?: string | null;
    requested_check_out?: string | null;
}

export interface CreateAttendanceCorrectionParams {
    attendance_id: string;
    title: string;
    description: string;
    module: 'check-in' | 'check-out';
    issue_type: string;
    requested_check_in?: string | null;
    requested_check_out?: string | null;
    imageUri?: string | null;
}
