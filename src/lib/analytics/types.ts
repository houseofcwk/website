export type EventProps = Record<string, string | number | boolean | null | undefined | string[]>;

export interface PageContext {
  page_path: string;
  page_title: string;
  referrer_path: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export interface IdentityTraits {
  email?: string;
  email_hash?: string;
  source?: string;
  [k: string]: string | number | boolean | undefined;
}

export interface Provider {
  id: string;
  isReady: () => boolean;
  init: () => void | Promise<void>;
  page: (ctx: PageContext, props?: EventProps) => void;
  identify: (userId: string, traits?: IdentityTraits) => void;
  track: (event: string, props: EventProps) => void;
  conversion: (event: string, props: EventProps) => void;
}
