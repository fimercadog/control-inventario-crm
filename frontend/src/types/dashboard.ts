export interface DashboardSummary {
  properties: {
    active: number;
    available: number;
    reserved: number;
    sold: number;
    rented: number;
  };
  leads_new: number;
  clients_active: number;
  visits_today: number;
  visits_upcoming: number;
  opportunities_open: number;
  deals_in_negotiation: number;
  closings_this_month: number;
  pipeline_value: number;
  tasks_pending: number;
  funnel: { stage: string; label: string; count: number }[];
}
