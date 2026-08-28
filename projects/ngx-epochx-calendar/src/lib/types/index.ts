export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
export type DoubleDigit = `${Digit}${Digit}`;
export type TimeSlot = `${DoubleDigit}:${DoubleDigit}`;

