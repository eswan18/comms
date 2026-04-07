export interface Recipient {
  email: string;
  name: string;
}

export interface BaseEvent {
  event_type: string;
  source: string;
  timestamp: string;
  recipients: Recipient[];
  data: Record<string, unknown>;
}
