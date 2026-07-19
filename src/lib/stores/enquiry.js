import { writable } from 'svelte/store';
// Set true when a "Download brochure" CTA is clicked so the enquiry form
// pre-selects the brochure option.
export const brochureIntent = writable(false);
