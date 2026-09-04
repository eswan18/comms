export interface NotifyTarget {
  email: string;
  name: string;
}

export interface BaseEvent {
  event_type: string;
  source: string;
  timestamp: string;
  /**
   * Set by the publisher so one action can be followed across services: the
   * same id appears in the publisher's log and in ours, next to the Resend
   * message id. Optional, because a publisher predating it still sends.
   */
  correlation_id?: string;
  notify?: NotifyTarget[];
  notify_link?: string;
  data: Record<string, unknown>;
}
