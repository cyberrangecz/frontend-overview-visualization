import { ScoredEvent } from "./scored-event";
import { Stringifiable } from 'd3-collection';

/**
 * Data to be bind with a line.
 */
export interface ProgressPlayer {
    id: string;
    name: string;
    events: ScoredEvent[];
    checked: boolean;
}
