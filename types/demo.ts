export interface Company {
    id: string;
    name: string;
    address?: string | null;
}

export interface EmployeeVisit {
    id: string;
    company_id: string;
    company_name?: string | null;
    photo?: string | null;
    created_at?: string | null;
}

export interface CreateEmployeeVisitParams {
    companyId: string;
    image_url: string;
}

export interface GetEmployeeVisitsParams {
    limit: number;
    page: number;
    date?: string;
}

export interface EmployeeVisitsPage {
    items: EmployeeVisit[];
    limit: number;
    page: number;
    total: number | null;
    hasMore: boolean;
    nextPage: number | null;
}
