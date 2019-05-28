/**
 * Raw hint data.
 */
export interface Hint {
  number: number; // Number of hint
  id: number; // we also need an id of a hint (number is obsolete for REST API)
  points: number; // Penalty for taking the hint
}
