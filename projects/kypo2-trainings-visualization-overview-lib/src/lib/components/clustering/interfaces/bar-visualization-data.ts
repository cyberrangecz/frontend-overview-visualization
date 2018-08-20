/**
 * Information about a single level
 */
export interface BarVisualizationData {
    /** Number of level, null if used for final component*/
    number?: number;
    maxTime: number;
    avgTime: number;
}
