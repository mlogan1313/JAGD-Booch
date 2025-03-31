import { BaseRepository } from './baseRepository';
import { 
  AuditLog, 
  AuditLogSchema,
  AuditEventSchema
} from '../schemas/batch';
import { ref, get, set, push } from 'firebase/database';
import { database } from '../services/firebase';

type AuditEventType = 
  | 'user_login'
  | 'user_logout'
  | 'user_role_change'
  | 'batch_create'
  | 'batch_update'
  | 'batch_delete'
  | 'equipment_status_change'
  | 'container_status_change'
  | 'quality_check_added'
  | 'quality_check_failed';

export class AuditRepository extends BaseRepository<AuditLog, typeof AuditLogSchema> {
  constructor() {
    super('audit', AuditLogSchema);
  }

  async logEvent(
    userId: string,
    eventType: AuditEventType,
    details: {
      entityId?: string;
      entityType?: string;
      changes?: Record<string, any>;
      notes?: string;
    }
  ): Promise<void> {
    const auditRef = ref(database, `audit/${push(ref(database)).key}`);
    const event = {
      userId,
      eventType,
      timestamp: Date.now(),
      ...details,
      id: auditRef.key!
    };

    try {
      const validatedEvent = AuditEventSchema.parse(event);
      await set(auditRef, validatedEvent);
    } catch (error) {
      console.error(`Validation error adding audit event:`, error);
      throw error;
    }
  }

  async getUserActivity(userId: string): Promise<AuditEvent[]> {
    const auditRef = ref(database, 'audit');
    const snapshot = await get(auditRef);
    if (!snapshot.exists()) return [];

    const events: AuditEvent[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const eventData = childSnapshot.val();
        if (eventData.userId === userId) {
          events.push(AuditEventSchema.parse(eventData));
        }
      } catch (error) {
        console.error(`Validation error for audit event:`, error);
      }
    });
    return events;
  }

  async getEntityHistory(
    entityType: string,
    entityId: string
  ): Promise<AuditEvent[]> {
    const auditRef = ref(database, 'audit');
    const snapshot = await get(auditRef);
    if (!snapshot.exists()) return [];

    const events: AuditEvent[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const eventData = childSnapshot.val();
        if (eventData.entityType === entityType && eventData.entityId === entityId) {
          events.push(AuditEventSchema.parse(eventData));
        }
      } catch (error) {
        console.error(`Validation error for audit event:`, error);
      }
    });
    return events;
  }

  async getFailedQualityChecks(): Promise<AuditEvent[]> {
    const auditRef = ref(database, 'audit');
    const snapshot = await get(auditRef);
    if (!snapshot.exists()) return [];

    const events: AuditEvent[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const eventData = childSnapshot.val();
        if (eventData.eventType === 'quality_check_failed') {
          events.push(AuditEventSchema.parse(eventData));
        }
      } catch (error) {
        console.error(`Validation error for audit event:`, error);
      }
    });
    return events;
  }
} 