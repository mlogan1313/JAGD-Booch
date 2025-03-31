import { BaseRepository } from './baseRepository';
import { AuditLog, AuditLogSchema, AuditEventSchema, AuditEventTypeEnum } from '../schemas/audit';
import { ref, get, set, push, update } from 'firebase/database';
import { database } from '../services/firebase';
import { z } from 'zod';

// Warning: AuditLog doesn't fit BaseRepository<T extends HasMetadata> constraint.
// This repository needs further review/refactoring.
export class AuditRepository extends BaseRepository<AuditLog, typeof AuditLogSchema> {
  constructor() {
    // Assuming logs are stored under /auditLogs/{logId}
    super('auditLogs', AuditLogSchema);
  }

  // This method logic needs rethinking. It currently adds individual AuditEvent
  // records to the root /auditLogs path, but BaseRepository expects to manage
  // AuditLog objects ({id, events:[]}) at this path.
  async logEvent(
    userId: string,
    eventType: z.infer<typeof AuditEventTypeEnum>,
    details: {
      entityId?: string;
      entityType?: string;
      changes?: Record<string, any>;
      notes?: string;
    }
    // TODO: Need a logId parameter to add event to the correct log's events array?
  ): Promise<void> {
    // TEMPORARY LOGIC - Creates a new event directly under the root path
    const auditEventRef = push(ref(database, this.path)); // Pushes to /auditLogs/
    const eventId = auditEventRef.key!;

    const event = {
      id: eventId,
      userId,
      eventType,
      timestamp: Date.now(),
      ...details,
    };

    try {
      const validatedEvent = AuditEventSchema.parse(event);
      await set(auditEventRef, validatedEvent);
      console.warn('AuditRepository.logEvent is saving event directly, not within an AuditLog object. Needs refactoring.');
    } catch (error) {
      console.error(`Validation error adding audit event:`, error);
      throw error;
    }
  }

  // The following query methods fetch individual AuditEvent objects assumed
  // to be direct children of the /auditLogs path (due to logEvent implementation above).
  // This might not be the intended structure.
  async getAllEvents(): Promise<z.infer<typeof AuditEventSchema>[]> {
    const snapshot = await get(ref(database, this.path));
    if (!snapshot.exists()) return [];

    const events: z.infer<typeof AuditEventSchema>[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const eventData = AuditEventSchema.parse(childSnapshot.val());
        events.push(eventData);
      } catch (error) {
        console.error(`Validation error parsing audit event ${childSnapshot.key}:`, error);
      }
    });
    return events;
  }

  async getUserActivity(userId: string): Promise<z.infer<typeof AuditEventSchema>[]> {
    const allEvents = await this.getAllEvents();
    return allEvents.filter(event => event.userId === userId);
  }

  async getEntityHistory(
    entityType: string,
    entityId: string
  ): Promise<z.infer<typeof AuditEventSchema>[]> {
    const allEvents = await this.getAllEvents();
    return allEvents.filter(event => event.entityType === entityType && event.entityId === entityId);
  }

  async getFailedQualityChecks(): Promise<z.infer<typeof AuditEventSchema>[]> {
    const allEvents = await this.getAllEvents();
    return allEvents.filter(event => event.eventType === AuditEventTypeEnum.Enum.QUALITY_CHECK_FAILED);
  }
} 