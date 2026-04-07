import express from "express";
import jwt from "jsonwebtoken";

import * as bcrypt from "bcrypt";
import * as common from "@decision-support-ui/common";

import { v4 as uuidv4 } from "uuid";

import { addUser, findUserByUsername } from "../state/queries.js";
import { logger } from "../logging.js";
import { validateJsonBody } from "./common.js";
import {
    DSUI_ACCESS_TOKEN_EXPIRY,
    DSUI_ACCESS_TOKEN_SECRET,
    DSUI_BCRYPT_SALT_ROUNDS,
    DSUI_BEARER_HEADER,
    DSUI_REFRESH_TOKEN_EXPIRY,
    DSUI_REFRESH_TOKEN_SECRET
} from "../constants.js";

if (DSUI_ACCESS_TOKEN_SECRET == "default") {
    logger.warn("Please specify a unique access token secret using the env variable DSUI_ACCESS_TOKEN_SECRET!");
}
if (DSUI_REFRESH_TOKEN_SECRET == "default") {
    logger.warn("Please specify a unique refresh token secret using the env variable DSUI_REFRESH_TOKEN_SECRET!");
}

interface AccessToken {
    id: number;
    username: string;
    uuid: string;
}

interface RefreshToken {
    id: number;
    username: string;
    uuid: string;
}

const generateAccessToken = (id: number) => {
    return jwt.sign({ id, uuid: uuidv4() } as AccessToken, DSUI_ACCESS_TOKEN_SECRET, {
        expiresIn: DSUI_ACCESS_TOKEN_EXPIRY as any
    });
};

const generateRefreshToken = (id: number) => {
    return jwt.sign({ id, uuid: uuidv4() } as RefreshToken, DSUI_REFRESH_TOKEN_SECRET, {
        expiresIn: DSUI_REFRESH_TOKEN_EXPIRY as any
    });
};

const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, DSUI_BCRYPT_SALT_ROUNDS);
};

const verifyPassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};

const REFRESH_TOKENS: Set<string> = new Set<string>();

export const getAuthenticationApi = () => {
    const app = express();

    // register new account
    app.post("/register", validateJsonBody(common.RegisterRequestSchema), async (req, res) => {
        const { username, password } = req.body;

        if (username.length < 3) {
            return res
                .status(400)
                .json(common.makeErrorResponseBody("username needs to consist of at least 3 characters"));
        }

        if (password.length < 8) {
            return res
                .status(400)
                .json(common.makeErrorResponseBody("password needs to consist of at least 8 characters"));
        }

        const user = await findUserByUsername(username);
        if (user) {
            logger.info(`registration for already existing user`);
            return res.status(403).json(common.makeErrorResponseBody("username already exists"));
        }
        logger.info(`successful registration`);

        await addUser(username, await hashPassword(password));
        return res.status(200).json({});
    });

    // login to existing account
    app.post("/jwt/login", validateJsonBody(common.LoginRequestSchema), async (req, res) => {
        const { username, password } = req.body;

        const user = await findUserByUsername(username);
        if (!user) {
            logger.info(`login with unknown username`);
            return res.status(403).json(common.makeErrorResponseBody("invalid credentials"));
        }

        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            logger.info(`login with incorrect password`);
            return res.status(403).json(common.makeErrorResponseBody("invalid credentials"));
        }
        logger.info(`successful login`);

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        REFRESH_TOKENS.add(refreshToken);

        res.status(200).json({ accessToken, refreshToken });
    });

    // refresh login tokens
    app.post("/jwt/refresh", validateJsonBody(common.RefreshRequestSchema), (req, res) => {
        const { refreshToken } = req.body as common.RefreshRequestBody;

        if (!refreshToken) {
            logger.info(`not jwt refresh token provided, cannot refresh`);
            return res.status(403).json(common.makeErrorResponseBody("invalid refresh token"));
        }
        if (!REFRESH_TOKENS.has(refreshToken)) {
            logger.info(`jwt refresh token not known, cannot refresh`);
            return res.status(403).json(common.makeErrorResponseBody("invalid refresh token"));
        }

        jwt.verify(
            refreshToken,
            DSUI_REFRESH_TOKEN_SECRET,
            { complete: true },
            (err: jwt.VerifyErrors | null, decoded) => {
                if (err || !decoded) {
                    logger.info(`jwt refresh token cannot be verified`, err);
                    return res.status(403).json(common.makeErrorResponseBody("invalid refresh token"));
                }

                const token = decoded.payload as RefreshToken;
                REFRESH_TOKENS.delete(refreshToken);

                const newAccessToken = generateAccessToken(token.id);
                const newRefreshToken = generateRefreshToken(token.id);

                REFRESH_TOKENS.add(newRefreshToken);

                res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
            }
        );
    });

    // logout of account
    app.post("/jwt/logout", validateJsonBody(common.LogoutRequestSchema), (req, res) => {
        const { refreshToken } = req.body;
        if (!REFRESH_TOKENS.has(refreshToken)) {
            logger.info(`jwt refresh token not found during logout`);
        }
        REFRESH_TOKENS.delete(refreshToken);
        res.status(200).json({});
    });

    return app;
};

declare module "express-serve-static-core" {
    interface Request {
        authenticatedUserId?: number;
    }
}

export const authenticateRoute = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const bearerHeader = req.get(DSUI_BEARER_HEADER);

    if (!bearerHeader || !bearerHeader.startsWith("Bearer ")) {
        logger.error("received request for protected route without bearer token");
        return res.status(401).json(common.makeErrorResponseBody("invalid access token"));
    }

    const accessToken = bearerHeader.split(" ")[1];

    jwt.verify(accessToken, DSUI_ACCESS_TOKEN_SECRET, { complete: true }, (err: jwt.VerifyErrors | null, decoded) => {
        if (err || !decoded) {
            logger.error("received request with invalid access token");
            return res.status(401).json(common.makeErrorResponseBody("invalid access token"));
        }

        const token = decoded.payload as AccessToken;
        req.authenticatedUserId = token.id;
        next();
    });
};
