import { logger } from '@/shared/infrastructure/monitoring/logger';

interface SecurityEvent {
  type: 'TOKEN_REUSE' | 'RATE_LIMIT' | 'SUSPICIOUS_IP' | 'MULTIPLE_DEVICES' | 'BLACKLIST_HIT';
  userId: string;
  details: Record<string, any>;
  timestamp: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class MonitoringService {
  private events: SecurityEvent[] = [];
  private readonly maxEvents = 1000;

  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.events.push(fullEvent);

    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    logger.warn({
      alert: 'SECURITY_EVENT',
      type: event.type,
      userId: event.userId,
      severity: event.severity,
      details: event.details,
      timestamp: fullEvent.timestamp.toISOString(),
    }, `Security event: ${event.type}`);

    if (fullEvent.severity === 'CRITICAL') {
      this.sendCriticalAlert(fullEvent);
    }
  }

  private sendCriticalAlert(event: SecurityEvent): void {
    logger.error({
      alert: 'CRITICAL_SECURITY_EVENT',
      type: event.type,
      userId: event.userId,
      details: event.details,
      timestamp: event.timestamp.toISOString(),
    }, `🚨 ALERTA CRÍTICO: ${event.type}`);
  }

  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  getEventsByUser(userId: string, limit: number = 50): SecurityEvent[] {
    return this.events
      .filter(event => event.userId === userId)
      .slice(-limit);
  }

  getEventsBySeverity(severity: SecurityEvent['severity'], limit: number = 50): SecurityEvent[] {
    return this.events
      .filter(event => event.severity === severity)
      .slice(-limit);
  }

  clearEvents(): void {
    this.events = [];
  }
}
