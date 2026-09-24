import { supabase, isSupabaseConfigured } from '../lib/supabase';

const TABLE = 'inventory_stock_logs';
const OPNAME_TYPE = 'OPNAME_REPORT';

export const opnameReportsService = {
  /**
   * Fetch all daily stock opname reports from Supabase.
   * Reports are stored with type 'OPNAME_REPORT' and their complete data in 'note' (JSON).
   */
  async getOpnameReports() {
    let localReports = [];
    try {
      const saved = localStorage.getItem('xcrepes_daily_opname_reports');
      if (saved) localReports = JSON.parse(saved);
    } catch (e) {}

    if (!isSupabaseConfigured()) return { data: localReports, error: null };

    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('type', OPNAME_TYPE)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('opnameReportsService.getOpnameReports error:', error);
        return { data: localReports, error };
      }

      const reports = (data || []).map(row => {
        try {
          if (row.note && typeof row.note === 'string' && row.note.trim().startsWith('{')) {
            const parsed = JSON.parse(row.note);
            const opnameDate = parsed.opnameDate || parsed.date || row.reference_invoice || (row.created_at ? row.created_at.slice(0, 10) : '');
            return {
              ...parsed,
              id: parsed.id || row.id,
              opnameDate,
              date: opnameDate,
              displayDate: parsed.displayDate || opnameDate,
              status: parsed.status || 'SUBMITTED',
              version: parsed.version || 1,
              createdBy: parsed.createdBy || { id: 'usr_cashier', name: row.user_name || 'Kasir', role: 'kasir' },
              createdAt: parsed.createdAt || row.created_at,
              submittedBy: parsed.submittedBy || (parsed.closedBy ? { id: 'usr_cashier', name: parsed.closedBy, role: 'kasir' } : null),
              submittedAt: parsed.submittedAt || parsed.closedAt || row.created_at,
              lastModifiedBy: parsed.lastModifiedBy || parsed.createdBy || { id: 'usr_cashier', name: row.user_name || 'Kasir', role: 'kasir' },
              lastModifiedAt: parsed.lastModifiedAt || row.created_at,
              items: parsed.items || [],
              summary: parsed.summary || {},
              auditTrail: parsed.auditTrail || [],
              versions: parsed.versions || []
            };
          }
        } catch (parseErr) {
          console.warn('Failed parsing opname report note for id:', row.id, parseErr);
        }

        const dateStr = row.reference_invoice || (row.created_at ? row.created_at.slice(0, 10) : '');
        return {
          id: row.id,
          opnameDate: dateStr,
          date: dateStr,
          displayDate: dateStr,
          status: 'SUBMITTED',
          version: 1,
          createdBy: { id: 'usr_cashier', name: row.user_name || 'Kasir', role: 'kasir' },
          createdAt: row.created_at,
          submittedBy: { id: 'usr_cashier', name: row.user_name || 'Kasir', role: 'kasir' },
          submittedAt: row.created_at,
          lastModifiedBy: { id: 'usr_cashier', name: row.user_name || 'Kasir', role: 'kasir' },
          lastModifiedAt: row.created_at,
          items: [],
          summary: {},
          auditTrail: [],
          versions: []
        };
      });

      return { data: reports, error: null };
    } catch (err) {
      console.error('Unexpected error in getOpnameReports:', err);
      return { data: [], error: err };
    }
  },

  /**
   * Fetch a single opname report by its exact date string (YYYY-MM-DD).
   */
  async getOpnameReportByDate(dateStr) {
    if (!isSupabaseConfigured() || !dateStr) return { data: null, error: null };

    try {
      const { data: allReports, error } = await this.getOpnameReports();
      if (error) return { data: null, error };

      const found = allReports.find(r => r.opnameDate === dateStr || r.date === dateStr || r.id === `OPNAME-${dateStr}`);
      return { data: found || null, error: null };
    } catch (err) {
      console.error('Unexpected error in getOpnameReportByDate:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Save or update an opname report with 1-date-1-report validation.
   * If isNew is true and an active (non-VOID) report already exists for that date,
   * returns 409 Conflict.
   */
  async saveOpnameReport(report, isNew = false) {
    if (!report) {
      return { data: null, error: new Error('Invalid report') };
    }

    try {
      const dateStr = report.opnameDate || report.date || new Date().toISOString().slice(0, 10);
      const reportId = report.id || `OPNAME-${dateStr}`;

      // Check unique date constraint if creating a new report
      if (isNew) {
        const { data: existingList } = await this.getOpnameReports();
        const conflict = existingList?.find(
          r => (r.opnameDate === dateStr || r.date === dateStr || r.id === reportId) && r.status !== 'VOID'
        );
        if (conflict) {
          const err = new Error(`Laporan Stock Opname untuk tanggal ${dateStr} sudah ada.`);
          err.status = 409;
          return { data: null, error: err, conflict: true, existingReport: conflict };
        }
      }

      // Ensure report has consistent ID & dates
      const fullReport = {
        ...report,
        id: reportId,
        opnameDate: dateStr,
        date: dateStr,
        lastModifiedAt: new Date().toISOString()
      };

      // Always save to localStorage as backup
      try {
        const saved = localStorage.getItem('xcrepes_daily_opname_reports');
        const list = saved ? JSON.parse(saved) : [];
        const idx = list.findIndex(r => r.id === reportId || r.opnameDate === dateStr);
        if (idx !== -1) {
          list[idx] = fullReport;
        } else {
          list.unshift(fullReport);
        }
        localStorage.setItem('xcrepes_daily_opname_reports', JSON.stringify(list));
      } catch (lsErr) {
        console.warn('LocalStorage save error:', lsErr);
      }

      if (!isSupabaseConfigured()) {
        return { data: fullReport, error: null };
      }

      const payload = {
        id: reportId,
        type: OPNAME_TYPE,
        amount: fullReport.summary?.totalDifferenceValue || 0,
        previous_stock: 0,
        current_stock: fullReport.summary?.totalMaterials || 0,
        reference_invoice: dateStr,
        note: JSON.stringify(fullReport),
        user_name: fullReport.lastModifiedBy?.name || fullReport.submittedBy?.name || fullReport.createdBy?.name || 'Kasir',
        created_at: fullReport.createdAt || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(TABLE)
        .upsert([payload])
        .select()
        .single();

      if (error) {
        console.error('opnameReportsService.saveOpnameReport error:', error);
        return { data: fullReport, error: null }; // Return local copy so flow succeeds
      }

      return { data: fullReport, error: null };
    } catch (err) {
      console.error('Unexpected error in saveOpnameReport:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Cancel/Void an opname report without deleting audit trail history.
   */
  async voidOpnameReport(reportId, reason, user = { name: 'Admin', role: 'superadmin' }) {
    if (!isSupabaseConfigured() || !reportId) {
      return { data: null, error: new Error('Missing reportId') };
    }

    try {
      const { data: allReports } = await this.getOpnameReports();
      const existing = allReports?.find(r => r.id === reportId);
      if (!existing) {
        return { data: null, error: new Error('Laporan tidak ditemukan.') };
      }

      const now = new Date().toISOString();
      const voidAudit = {
        id: `audit_void_${Date.now()}`,
        timestamp: now,
        user: user.name || 'Admin',
        role: user.role || 'superadmin',
        action: 'VOID',
        field: 'status',
        oldValue: existing.status,
        newValue: 'VOID',
        reason: reason || 'Dibatalkan oleh Admin',
        summary: `Laporan dibatalkan dengan alasan: ${reason || '-'}`
      };

      const updatedReport = {
        ...existing,
        status: 'VOID',
        voidedBy: user,
        voidedAt: now,
        voidReason: reason || '',
        lastModifiedBy: user,
        lastModifiedAt: now,
        auditTrail: [...(existing.auditTrail || []), voidAudit]
      };

      return await this.saveOpnameReport(updatedReport, false);
    } catch (err) {
      console.error('Unexpected error in voidOpnameReport:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Delete an opname report from Supabase (for backward compatibility).
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
