import { ScoredEvent } from "./scored-event";

/**
 * Data to be bind with a line.
 */
export interface ProgressPlayer {
    id: string;
    events: ScoredEvent[];
    checked: boolean;
}
