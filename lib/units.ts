// Unit conversions. Users enter ft/in + lbs by default; we store cm + kg.

export const CM_PER_IN = 2.54;
export const LB_PER_KG = 2.20462;

export function ftInToCm(feet: number, inches: number) {
  return round1((feet * 12 + inches) * CM_PER_IN);
}

export function cmToFtIn(cm: number) {
  const totalIn = Math.round(cm / CM_PER_IN);
  return { feet: Math.floor(totalIn / 12), inches: totalIn % 12 };
}

export function lbToKg(lb: number) {
  return round1(lb / LB_PER_KG);
}

export function kgToLb(kg: number) {
  return Math.round(kg * LB_PER_KG);
}

export function bmi(weight_kg: number, height_cm: number) {
  const m = height_cm / 100;
  return weight_kg / (m * m);
}

/** Lowest weight (kg) that keeps BMI at or above 18.5 for this height. */
export function minHealthyWeightKg(height_cm: number) {
  const m = height_cm / 100;
  return 18.5 * m * m;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
