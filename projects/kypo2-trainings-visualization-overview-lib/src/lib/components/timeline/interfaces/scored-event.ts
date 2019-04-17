/**
 * Data to be bind with event on a line.
 */
export interface ScoredEvent {
    type: string;
    time: number;
    score: number;
    event: string;
    show: boolean;
    gameLevel?: number;
    level: number;
    id?: number;
    scoreChange?: number;
    playerId?: string;
    filtered?: boolean;
}
