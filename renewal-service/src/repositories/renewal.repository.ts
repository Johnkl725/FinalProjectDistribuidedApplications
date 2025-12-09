import { DatabaseConnection } from "shared";

export interface PolicyRecord {
  id: number;
  policy_number: string;
  user_id: number;
  insurance_type_id: number;
  insurance_type_name: string;
  status: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  premium_amount: any;
  coverage_amount: any;
  created_at: string;
  email: string;
  first_name: string;
  last_name: string;
}

export class RenewalRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = new DatabaseConnection();
  }

  async getActivePolicies(): Promise<PolicyRecord[]> {
    const query = `
      SELECT p.*, it.name as insurance_type_name, u.email, u.first_name, u.last_name
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'active' AND p.is_current = true
    `;
    const result = await this.db.query<PolicyRecord>(query);
    return result.rows;
  }

  async getPolicyById(policyId: number): Promise<PolicyRecord | null> {
    const query = `
      SELECT p.*, it.name as insurance_type_name, u.email, u.first_name, u.last_name
      FROM policies p
      JOIN insurance_types it ON p.insurance_type_id = it.id
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND p.is_current = true
    `;
    const result = await this.db.query<PolicyRecord>(query, [policyId]);
    return result.rows[0] || null;
  }

  async getNotificationsMap(policyIds: number[]): Promise<Map<number, Set<number>>> {
    const map = new Map<number, Set<number>>();
    if (!policyIds.length) return map;

    const query = `
      SELECT policy_id, reminder_day
      FROM policy_notifications
      WHERE policy_id = ANY($1::int[])
    `;
    const result = await this.db.query<{ policy_id: number; reminder_day: number }>(
      query,
      [policyIds]
    );
    for (const row of result.rows) {
      if (!map.has(row.policy_id)) map.set(row.policy_id, new Set<number>());
      map.get(row.policy_id)!.add(row.reminder_day);
    }
    return map;
  }

  async saveNotification(policyId: number, reminderDay: number): Promise<void> {
    const query = `
      INSERT INTO policy_notifications (policy_id, reminder_day)
      VALUES ($1, $2)
      ON CONFLICT (policy_id, reminder_day) DO NOTHING
    `;
    await this.db.query(query, [policyId, reminderDay]);
  }
}

