export const DSUI_LOG_LEVEL = process.env.DSUI_LOG_LEVEL ?? "INFO";

export const DSUI_DATABASE_PATH = process.env.DSUI_DATABASE_PATH ?? "./decision-support-ui-backend.db";

export const DSUI_R_SCRIPT_PATH = process.env.DSUI_R_SCRIPT_PATH ?? "Rscript";

export const DSUI_R_MAX_RUNTIME = parseFloat(process.env.DSUI_R_MAX_RUNTIME ?? "30");

export const DSUI_R_MAX_MCRUNS = parseInt(process.env.DSUI_R_MAX_MCRUNS ?? "100000");

export const DSUI_R_MAX_BINS = parseInt(process.env.DSUI_R_MAX_BINS ?? "200");

export const DSUI_R_VALUE_PRECISION = parseInt(process.env.DSUI_R_VALUE_PRECISION ?? "5");
