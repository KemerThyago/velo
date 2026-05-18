/**
 * Removes all non-digit characters from a string.
 */
export const onlyDigits = (val: string): string => {
  return val.replace(/\D/g, '');
};

/**
 * Mathematically validates a CPF number using checking digits (modulo 11 algorithm).
 */
export const isValidCpf = (cpf: string): boolean => {
  const clean = cpf.replace(/\D/g, '');
  
  if (clean.length !== 11) return false;
  
  // Reject known invalid patterns (all digits same)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  let remainder;

  // First checking digit calculation
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(9, 10))) return false;

  // Second checking digit calculation
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(10, 11))) return false;

  return true;
};

/**
 * Validates email format strictly, preventing cases like 'cliente@.com'.
 */
export const isValidEmailStrict = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  return emailRegex.test(email);
};
