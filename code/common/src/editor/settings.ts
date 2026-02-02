export const SMOOTH_STEP_EDGE_STYLE_TYPE = "smooth-step";
export const BEZIER_EDGE_STYLE_TYPE = "bezier";
export const STRAIGHT_EDGE_STYLE_TYPE = "straight";

export type EdgeStyleType = "smooth-step" | "bezier" | "straight";
export const AVAILABLE_EDGE_STYLE_TYPES = [
    SMOOTH_STEP_EDGE_STYLE_TYPE,
    BEZIER_EDGE_STYLE_TYPE,
    STRAIGHT_EDGE_STYLE_TYPE
] as EdgeStyleType[];

export const DOTS_EDITOR_BACKGROUND = "dots";
export const LINES_EDITOR_BACKGROUND = "lines";
export const NO_EDITOR_BACKGROUND = "none";

export type EditorBackground = "dots" | "lines" | "none";
export const AVAILABLE_EDITOR_BACKGROUNDS = [
    DOTS_EDITOR_BACKGROUND,
    LINES_EDITOR_BACKGROUND,
    NO_EDITOR_BACKGROUND
] as EditorBackground[];

export interface EditorSettings {
    edgeStyle: EdgeStyleType;
    background: EditorBackground;
    locked: boolean;
    snapToGrid: boolean;
}
