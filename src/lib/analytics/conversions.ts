// Conversion event catalog per issue #198 §11.
// Single source of truth — every provider adapter reads this when it sees a conversion fan-out.

export interface ConversionMap {
  ga4: string;
  meta: string;
  tiktok: string;
  linkedin: string;
  mixpanelLabel: string;
}

export const CONVERSIONS: Record<string, ConversionMap> = {
  waitlist_submitted: {
    ga4: 'waitlist_join',
    meta: 'Lead',
    tiktok: 'CompleteRegistration',
    linkedin: 'Lead',
    mixpanelLabel: 'waitlist_submitted',
  },
  lc_email_submitted: {
    ga4: 'lc_email_capture',
    meta: 'Lead',
    tiktok: 'SubmitForm',
    linkedin: 'Lead',
    mixpanelLabel: 'lc_email_submitted',
  },
  lc_path_a_clicked: {
    ga4: 'lc_tour_request',
    meta: 'Schedule',
    tiktok: 'Contact',
    linkedin: 'RequestForQuote',
    mixpanelLabel: 'lc_path_a_clicked',
  },
  contact_submitted: {
    ga4: 'contact_submit',
    meta: 'Contact',
    tiktok: 'Contact',
    linkedin: 'Lead',
    mixpanelLabel: 'contact_submitted',
  },
  assessment_calendly_clicked: {
    ga4: 'assessment_book_call',
    meta: 'Schedule',
    tiktok: 'Contact',
    linkedin: 'RequestForQuote',
    mixpanelLabel: 'assessment_calendly_clicked',
  },
  assessment_waitlist_clicked: {
    ga4: 'assessment_waitlist',
    meta: 'Lead',
    tiktok: 'CompleteRegistration',
    linkedin: 'Lead',
    mixpanelLabel: 'assessment_waitlist_clicked',
  },
  powerups_checkout_clicked: {
    ga4: 'powerups_checkout_started',
    meta: 'InitiateCheckout',
    tiktok: 'InitiateCheckout',
    linkedin: 'BuyNow',
    mixpanelLabel: 'powerups_checkout_clicked',
  },
};

export function isConversion(event: string): boolean {
  return Object.prototype.hasOwnProperty.call(CONVERSIONS, event);
}
