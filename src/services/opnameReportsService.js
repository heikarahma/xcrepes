import { supabase, isSupabaseConfigured } from '../lib/supabase';

const TABLE = 'inventory_stock_logs';
const OPNAME_TYPE = 'OPNAME_REPORT';

export const opnameReportsService = {
  /**
   * Fetch all daily stock opname reports from Supabase.
   * Reports are stored with type 'OPNAME_REPORT' and their complete data in 'note' (JSON).
   */
  async getOpnameReports() {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('type', OPNAME_TYPE)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('opnameReportsService.getOpnameReports error:', error);
        return { data: [], error };
      }

      const reports = (data || []).map(row => {
        try {
          if (row.note && typeof row.note === 'string' && row.note.trim().startsWith('{')) {
            const parsed = JSON.parse(row.note);
            return {
              ...parsed,
              id: parsed.id || row.id,
              date: parsed.date || row.reference_invoice || (row.created_at ? row.created_at.slice(0, 10) : ''),
              closedBy: parsed.closedBy || row.user_name || 'Kasir',
              closedAt: parsed.closedAt || row.created_at
            };
          }
        } catch (parseErr) {
          console.warn('Failed parsing opname report note for id:', row.id, parseErr);
        }

        return {
          id: row.id,
          date: row.reference_invoice || (row.created_at ? row.created_at.slice(0, 10) : ''),
          displayDate: row.reference_invoice || 'Laporan Closing',
          outlet: 'XCrepes Main Outlet',
          closedBy: row.user_name || 'Kasir',
          closedAt: row.created_at,
          status: 'COMPLETED',
          summary: {},
          items: [],
          appliedToInventory: false
        };
      });

      return { data: reports, error: null };
    } catch (err) {
      console.error('Unexpected error in getOpnameReports:', err);
      return { data: [], error: err };
    }
  },

  /**
   * Save or update a daily stock opname report in Supabase.
   */
  async saveOpnameReport(report) {
    if (!isSupabaseConfigured() || !report) return { data: null, error: new Error('Supabase not configured or invalid report') };

    try {
      const reportId = report.id || `OPNAME-${report.date || new Date().toISOString().slice(0, 10)}-${Date.now().toString().slice(-4)}`;
      const payload = {
        id: reportId,
        type: OPNAME_TYPE,
        amount: 0,
        previous_stock: 0,
        current_stock: 0,
        reference_invoice: report.date || new Date().toISOString().slice(0, 10),
        note: JSON.stringify(report),
        user_name: report.closedBy || 'Kasir',
        created_at: report.closedAt || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(TABLE)
        .upsert([payload])
        .select()
        .single();

      if (error) {
        console.error('opnameReportsService.saveOpnameReport error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error in saveOpnameReport:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Delete an opname report from Supabase (e.g. when reopening store closing).
   */
  async deleteOpnameReport(reportId) {
    if (!isSupabaseConfigured() || !reportId) return { data: null, error: null };

    try {
      const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', reportId)
        .eq('type', OPNAME_TYPE);

      if (error) {
        console.error('opnameReportsService.deleteOpnameReport error:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected error in deleteOpnameReport:', err);
      return { error: err };
    }
  }
};
