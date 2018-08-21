import { ColorScheme } from '../../../shared/interfaces/color-scheme';
import { SvgConfig } from "../../../shared/interfaces/configurations/svg-config";
import { SvgMarginConfig } from '../../../shared/interfaces/configurations/svg-margin-config';
import { AxesConfig } from '../../../shared/interfaces/configurations/axes-config';
import { ContextConfig } from './interfaces/context-config';

export const COLOR_SCHEME: ColorScheme = ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'];
export const SVG_CONFIG: SvgConfig = {
    width: 1000,
    height: 600
};
export const SVG_MARGIN_CONFIG: SvgMarginConfig = {
    top: 70,
    right: 150,
    bottom: 200,
    left: 160
};
export const AXES_CONFIG: AxesConfig = {
    xAxis: {
        position: {
            x: 0,
            y: SVG_CONFIG.height + 20
        },
        tickSize: 15
    },
    yAxis: {
        position: {
            x: 0,
            y: 0
        },
        tickSize: 0,
        ticks: 2,
        tickPadding: 10,
        tickPositionY: -5
    }
};
export const CONTEXT_CONFIG: ContextConfig = {
    height: 70
};