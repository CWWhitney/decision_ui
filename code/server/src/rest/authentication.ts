import * as express from "express";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

import { v4 as uuidv4 } from "uuid";

import { addUser, findUserByUsername } from "../state/queries";
import { UserTable } from "../state/database";
import { logger } from "../logging";

const BEARER_HEADER = process.env.BEARER_HEADER || "Authorization";

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "default";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "5m";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "default";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "24h";

if (ACCESS_TOKEN_SECRET == "default") {
    logger.warn("Please specify a unique access token secret using the env variable ACCESS_TOKEN_SECRET!");
}
if (REFRESH_TOKEN_SECRET == "default") {
    logger.warn("Please specify a unique refresh token secret using the env variable REFRESH_TOKEN_SECRET!");
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
    return jwt.sign({ id, uuid: uuidv4() } as AccessToken, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY as any
    });
};

const generateRefreshToken = (id: number) => {
    return jwt.sign({ id, uuid: uuidv4() } as RefreshToken, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY as any
    });
};

const hashPassword = async (password: string) => {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

const verifyPassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};

const REFRESH_TOKENS: Set<string> = new Set<string>();

export const getAuthenticationApi = () => {
    const app = express();

    app.post("/register", async (req, res) => {
        const { username, password } = req.body;

        if (username.length < 3) {
            return res.status(400).json({ error: "username needs to consist of at least 3 characters" });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: "password needs to consist of at least 8 characters" });
        }

        const user = await findUserByUsername(username);
        if (user) {
            logger.info(`registration for already existing user`);
            return res.status(400).json({ error: "username already exists" });
        }
        logger.info(`successful registration`);

        await addUser(username, await hashPassword(password));
        return res.sendStatus(200);
    });

    app.post("/jwt/login", async (req, res) => {
        const { username, password } = req.body;

        const user = await findUserByUsername(username);
        if (!user) {
            logger.info(`login with unknown username`);
            return res.status(400).json({ error: "invalid credentials" });
        }

        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            logger.info(`login with incorrect password`);
            return res.status(400).json({ error: "invalid credentials" });
        }
        logger.info(`successful login`);

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        REFRESH_TOKENS.add(refreshToken);

        res.json({ accessToken, refreshToken });
    });

    app.post("/jwt/refresh", (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            logger.info(`not jwt refresh token provided, cannot refresh`);
            return res.status(400).json({ message: "invalid refresh token" });
        }
        if (!REFRESH_TOKENS.has(refreshToken)) {
            logger.info(`jwt refresh token not known, cannot refresh`);
            return res.status(400).json({ message: "invalid refresh token" });
        }

        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err: jwt.VerifyErrors | null, token: RefreshToken) => {
            if (err) {
                logger.info(`jwt refresh token cannot be verified`, err);
                return res.status(400).json({ message: "invalid refresh token" });
            }

            REFRESH_TOKENS.delete(refreshToken);

            const newAccessToken = generateAccessToken(token.id);
            const newRefreshToken = generateRefreshToken(token.id);

            REFRESH_TOKENS.add(newRefreshToken);

            res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        });
    });

    app.post("/jwt/logout", (req, res) => {
        const { refreshToken } = req.body;
        if (!REFRESH_TOKENS.has(refreshToken)) {
            logger.info(`jwt refresh token not found during logout`);
        }
        REFRESH_TOKENS.delete(refreshToken);
        res.sendStatus(200);
    });

    return app;
};

declare module "express-serve-static-core" {
    interface Request {
        authenticatedUserId?: number;
    }
}

export const authenticateRoute = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const bearerHeader = req.headers[BEARER_HEADER] as string;

    if (!bearerHeader || !bearerHeader.startsWith("Bearer ")) {
        logger.error("received request for protected route without bearer token");
        return res.sendStatus(401);
    }

    const accessToken = bearerHeader.split(" ")[1];

    jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (err: jwt.VerifyErrors | null, token: AccessToken) => {
        if (err) {
            logger.error("received request with invalid access token");
            return res.sendStatus(401);
        }

        req.authenticatedUserId = token.id;
        next();
    });
};
