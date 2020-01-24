/** @format */

export interface OldCategory {
  code: string;
  name: string;
  description: string;
  caterogyType: string;
  avatar: string;
}

export interface OldService {
  code: string;
  name: string;
  group: string;
  description: string;
  avatar: string;
  category: OldCategory[];
}

export interface OldTicketNewInput {}

export interface OldTicketNew {}
