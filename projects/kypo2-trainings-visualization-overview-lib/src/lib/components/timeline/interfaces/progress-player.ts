import { ScoredEvent } from "./scored-event";

/**
 * Data to be bind with a line.
 */
export interface ProgressPlayer {
    id: number;
    events: ScoredEvent[];
    checked: boolean;
}