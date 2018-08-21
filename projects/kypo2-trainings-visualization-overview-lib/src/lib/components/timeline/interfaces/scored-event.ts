/**
 * Data to be bind with event on a line.
 */
export interface ScoredEvent {
    time: number;
    score: number;
    event: string;
    show: boolean;
    level: number;
    scoreChange?: number;
    playerId?: number;
    filtered?: boolean;
}