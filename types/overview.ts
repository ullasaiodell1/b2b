export interface Holiday {
    date: string;
    name: string;
}

export interface DashboardOverview {
    total_work_hours: number;
    total_target_hours: number;
    spent_display_text: string;
    company_holidays: Holiday[];
}


export interface OverviewParams {
    month: number;
    year: number;
}


/**
 * Raw API Response Shape for mapping
 */
export interface RawOverviewResponse {
    month?: number;
    year?: number;
    monthly_hours?: {
        total_expected_hours: number;
        total_monthly_spent_hours: number;
    };
    attendance?: {
        present_days: number;
        absent_days: number;
        half_day_days: number;
        leave_days: number;
    };
    company_holidays?: any[];
}


