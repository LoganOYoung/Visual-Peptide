/**
 * Peptide reconstitution and dosing calculations.
 * All units: mass in mg, volume in mL, concentration in mg/mL.
 */

export function reconstitute({
  peptideMg,
  diluentMl,
}: {
  peptideMg: number;
  diluentMl: number;
}): { concentrationMgPerMl: number } {
  if (diluentMl <= 0) return { concentrationMgPerMl: 0 };
  return { concentrationMgPerMl: peptideMg / diluentMl };
}

export function diluentForTargetConcentration({
  peptideMg,
  targetMgPerMl,
}: {
  peptideMg: number;
  targetMgPerMl: number;
}): { diluentMl: number } {
  if (targetMgPerMl <= 0) return { diluentMl: 0 };
  return { diluentMl: peptideMg / targetMgPerMl };
}

export function doseToVolume({
  doseMcg,
  concentrationMgPerMl,
}: {
  doseMcg: number;
  concentrationMgPerMl: number;
}): { volumeMl: number; unitsOnInsulinSyringe: number } {
  if (concentrationMgPerMl <= 0) return { volumeMl: 0, unitsOnInsulinSyringe: 0 };
  const volumeMl = doseMcg / 1000 / concentrationMgPerMl;
  // Assume 100-unit insulin syringe = 1 mL => 1 unit = 0.01 mL
  const unitsOnInsulinSyringe = Math.round(volumeMl * 100);
  return { volumeMl, unitsOnInsulinSyringe };
}

export function volumeToDose({
  volumeMl,
  concentrationMgPerMl,
}: {
  volumeMl: number;
  concentrationMgPerMl: number;
}): { doseMcg: number } {
  const doseMcg = volumeMl * concentrationMgPerMl * 1000;
  return { doseMcg };
}

/** Standard insulin: 1 unit = 0.01 mL. Syringe max units (0.3 mL = 30 U, etc.). */
const SYRINGE_MAX_UNITS: Record<string, number> = { "0.3": 30, "0.5": 50, "1": 100 };

export function doseToVolumeWithSyringe(
  doseMcg: number,
  concentrationMgPerMl: number,
  syringeMl: "0.3" | "0.5" | "1"
): { volumeMl: number; units: number; fitsInSyringe: boolean } {
  if (concentrationMgPerMl <= 0) return { volumeMl: 0, units: 0, fitsInSyringe: true };
  const volumeMl = doseMcg / 1000 / concentrationMgPerMl;
  const units = Math.round(volumeMl * 100); // 1 unit = 0.01 mL for all standard insulin
  const maxUnits = SYRINGE_MAX_UNITS[syringeMl] ?? 100;
  return { volumeMl, units, fitsInSyringe: units <= maxUnits };
}

/** Days one vial lasts: vialMg, doseMcg per injection, injections per day. */
export function vialDurationDays(
  vialMg: number,
  doseMcg: number,
  injectionsPerDay: number
): { days: number; doses: number } {
  if (doseMcg <= 0 || injectionsPerDay <= 0) return { days: 0, doses: 0 };
  const doses = Math.floor((vialMg * 1000) / doseMcg);
  const days = doses / injectionsPerDay;
  return { days, doses };
}

/** How many vials needed for target days. */
export function vialsNeededForDays(
  vialMg: number,
  doseMcg: number,
  injectionsPerDay: number,
  targetDays: number
): number {
  const { days } = vialDurationDays(vialMg, doseMcg, injectionsPerDay);
  if (days <= 0) return 0;
  return Math.ceil(targetDays / days);
}

export function costPerDose(
  pricePerVial: number,
  vialMg: number,
  doseMcg: number
): { costPerDose: number; dosesPerVial: number } {
  if (vialMg <= 0 || doseMcg <= 0) return { costPerDose: 0, dosesPerVial: 0 };
  const dosesPerVial = Math.floor((vialMg * 1000) / doseMcg);
  const costPerDose = dosesPerVial > 0 ? pricePerVial / dosesPerVial : 0;
  return { costPerDose, dosesPerVial };
}
