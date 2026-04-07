export const DSUI_LOG_LEVEL = process.env.DSUI_LOG_LEVEL ?? "INFO";

export const DSUI_DATABASE_PATH = process.env.DSUI_DATABASE_PATH ?? "data/decision-support-ui.db";

export const DSUI_R_SCRIPT_PATH = process.env.DSUI_R_SCRIPT_PATH ?? "Rscript";

export const DSUI_R_MAX_RUNTIME = parseFloat(process.env.DSUI_R_MAX_RUNTIME ?? "30");

export const DSUI_R_MAX_MCRUNS = parseInt(process.env.DSUI_R_MAX_MCRUNS ?? "100000");

export const DSUI_R_MAX_HISTOGRAM_BINS = parseInt(process.env.DSUI_R_MAX_HISTOGRAM_BINS ?? "200");

export const DSUI_BEARER_HEADER = process.env.VITE_DSUI_BEARER_HEADER || "Authorization";

export const DSUI_BCRYPT_SALT_ROUNDS = parseInt(process.env.DSUI_BCRYPT_SALT_ROUNDS ?? "10");

export const DSUI_ACCESS_TOKEN_SECRET = process.env.DSUI_ACCESS_TOKEN_SECRET || "default";

export const DSUI_ACCESS_TOKEN_EXPIRY = process.env.DSUI_ACCESS_TOKEN_EXPIRY || "5m";

export const DSUI_REFRESH_TOKEN_SECRET = process.env.DSUI_REFRESH_TOKEN_SECRET || "default";

export const DSUI_REFRESH_TOKEN_EXPIRY = process.env.DSUI_REFRESH_TOKEN_EXPIRY || "24h";
