import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import prisma from '../../prisma/client.js';

const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

function generateAccessToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing in environment variables");
    }

    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
}

function generateRefreshToken(user) {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error("JWT_REFRESH_SECRET is missing in environment variables");
    }

    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );
}

export const register = async (req, res, next) => {
    try {
        const { username, password, name } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            throw createHttpError(409, 'User with this username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { username, password: hashedPassword, name }
        });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await prisma.refreshToken.create({
            data: { token: refreshToken, userId: user.id }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            user: {
                id: user.id,
                username: user.username,
                name: user.name
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error("REGISTER ERROR:", error);
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) throw createHttpError(401, 'Invalid credentials');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw createHttpError(401, 'Invalid credentials');

        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await prisma.refreshToken.create({
            data: { token: refreshToken, userId: user.id }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            user: {
                id: user.id,
                username: user.username,
                name: user.name
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        next(error);
    }
};

export const refresh = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken || req.body.refreshToken;
        if (!token) throw createHttpError(401, 'No refresh token provided');

        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch {
            throw createHttpError(401, 'Invalid or expired refresh token');
        }

        const storedToken = await prisma.refreshToken.findUnique({
            where: { token }
        });

        if (!storedToken) throw createHttpError(401, 'Invalid refresh token');

        await prisma.refreshToken.delete({ where: { token } });

        const user = await prisma.user.findUnique({ where: { id: payload.id } });

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        await prisma.refreshToken.create({
            data: { token: newRefreshToken, userId: user.id }
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error("REFRESH ERROR:", error);
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        await prisma.refreshToken.deleteMany({
            where: { userId: req.user.id }
        });

        res.clearCookie('refreshToken');

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error("LOGOUT ERROR:", error);
        next(error);
    }
};

export const me = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, username: true, name: true, createdAt: true }
        });

        res.json(user);
    } catch (error) {
        console.error("ME ERROR:", error);
        next(error);
    }
};
