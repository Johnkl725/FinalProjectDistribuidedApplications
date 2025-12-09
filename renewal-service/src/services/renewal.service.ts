import { RenewalRepository, PolicyRecord } from "../repositories/renewal.repository";

interface ExpiringPolicy {
  policy: PolicyRecord;
  expiryDate: Date;
  daysToExpiry: number;
  remindersSent: number[];
  pendingReminders: number[];
}

export class RenewalService {
  private repository: RenewalRepository;
  private reminderDays = [15, 7, 1];

  constructor() {
    this.repository = new RenewalRepository();
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private getExpiryDate(policy: PolicyRecord): Date {
    const start = new Date(policy.start_date);
    if (policy.end_date) return new Date(policy.end_date);
    return this.addMonths(start, 12);
  }

  private daysUntil(date: Date): number {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  async listExpiring(windowDays: number): Promise<ExpiringPolicy[]> {
    const policies = await this.repository.getActivePolicies();
    const notifications = await this.repository.getNotificationsMap(
      policies.map((p) => p.id)
    );

    const expiring: ExpiringPolicy[] = [];

    for (const policy of policies) {
      const expiryDate = this.getExpiryDate(policy);
      const daysToExpiry = this.daysUntil(expiryDate);

      if (daysToExpiry < 0 || daysToExpiry > windowDays) {
        continue;
      }

      const sent = Array.from(notifications.get(policy.id) || []);
      const pending = this.reminderDays.filter(
        (d) => daysToExpiry <= d && !sent.includes(d)
      );

      expiring.push({
        policy,
        expiryDate,
        daysToExpiry,
        remindersSent: sent,
        pendingReminders: pending,
      });
    }

    return expiring.sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
  }

  private async sendReminder(policy: PolicyRecord, reminderDay: number): Promise<void> {
    // Stub: in a real scenario, integrate with email provider
    console.log(
      `[renewals] Sending reminder (${reminderDay}d) to ${policy.email} for policy ${policy.policy_number}`
    );
    await this.repository.saveNotification(policy.id, reminderDay);
  }

  async runSweep(): Promise<{ processed: number; sent: number }> {
    const expiring = await this.listExpiring(Math.max(...this.reminderDays));
    let sent = 0;

    for (const item of expiring) {
      for (const reminder of item.pendingReminders) {
        await this.sendReminder(item.policy, reminder);
        sent += 1;
      }
    }

    return { processed: expiring.length, sent };
  }

  async notifyPolicy(policyId: number, reminderDay?: number): Promise<{ sent: boolean }> {
    const policy = await this.repository.getPolicyById(policyId);
    if (!policy) {
      throw new Error("Policy not found");
    }

    const expiry = this.getExpiryDate(policy);
    const daysToExpiry = this.daysUntil(expiry);

    const targetDay =
      reminderDay ||
      this.reminderDays.find((d) => daysToExpiry <= d) ||
      this.reminderDays[this.reminderDays.length - 1];

    await this.sendReminder(policy, targetDay);
    return { sent: true };
  }
}

