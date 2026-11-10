import { PATHS } from '../config/site.js';

const sp = (slug, k, t, d, page) => ({ slug, k, t, d, href: page || `${PATHS.specialties}#${slug}` });

/** The 9 specialty audiences from the Specialties menu. */
export const SPECIALTIES = [
  sp('general-dentists', 'GD', 'General Dentists', 'Steady new-patient flow and a fuller hygiene schedule.'),
  sp('cosmetic-dentists', 'CD', 'Cosmetic Dentists', 'Veneers, whitening and smile makeovers marketed to the right patients.'),
  sp('orthodontists', 'OR', 'Orthodontists', 'Aligner and braces consults from parents and adults nearby.'),
  sp('pediatric-dentists', 'PD', 'Pediatric Dentists', 'Reach parents searching for a dentist their kids will like.'),
  sp('dental-implants', 'IM', 'Dental Implants', 'High-value implant and full-arch cases, tracked to the consult.', PATHS.implants),
  sp('periodontists', 'PE', 'Periodontists', 'Referral-friendly visibility for gum and implant care.'),
  sp('endodontists', 'EN', 'Endodontists', 'Be found for urgent root canal searches and referrals.'),
  sp('oral-surgeons', 'OS', 'Oral Surgeons', 'Wisdom teeth, extractions and implant surgery cases.'),
  sp('multi-location', 'ML', 'Multi-Location Groups', 'Location pages, profiles and reporting that scale.'),
];
