export interface NotifyTarget {
  email: string;
  name: string;
}

export interface BaseEvent {
  event_type: string;
  source: string;
  timestamp: string;
  notify?: NotifyTarget[];
  notify_link?: string;
  data: Record<string, unknown>;
}
