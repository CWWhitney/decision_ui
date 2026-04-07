export const USER_INPUT_DEBOUNCE_TIME = parseInt(import.meta.env.VITE_DSUI_USER_INPUT_DEBOUNCE_TIME || "500");

export const TOOLTIP_OPEN_DELAY = parseInt(import.meta.env.VITE_DSUI_TOOLTIP_OPEN_DELAY || "500");

export const TOOLTIP_CLOSE_DELAY = parseInt(import.meta.env.VITE_DSUI_TOOLTIP_CLOSE_DELAY || "250");

export const CHART_DOWNLOAD_DPR = parseFloat(import.meta.env.VITE_DSUI_CHART_DOWNLOAD_DPR || "3.0");

export const EDITOR_GRID_DISTANCE = parseInt(import.meta.env.VITE_DSUI_EDITOR_GRID_DISTANCE || "10");

export const DSUI_BEARER_HEADER = (import.meta.env.VITE_DSUI_BEARER_HEADER || "Authorization").trim();

export const DSUI_REQUEST_TIMEOUT = parseInt(import.meta.env.VITE_DSUI_REQUSET_TIMEOUT) || 5000;

export const UI_REFRESH_SLEEP_TIMEOUT = 1;
