import prisma from "../../prisma/client.js";
import createHttpError from "http-errors";

export const getAnnouncements = async (req, res) => {
    try {
        const { search, sort = "newest", page = 1 } = req.query;
        const perPage = 10;
        const skip = (Number(page) - 1) * perPage;

        const where = search
            ? {
                OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ],
            }
            : {};

        const orderBy =
            sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

        const [data, total] = await Promise.all([
            prisma.announcement.findMany({
                where,
                orderBy,
                skip,
                take: perPage,
            }),
            prisma.announcement.count({ where }),
        ]);

        res.json({
            data,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / perPage),
                perPage,
            },
        });
    } catch (err) {
        console.error("GET ANNOUNCEMENTS ERROR:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAnnouncementById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const announcement = await prisma.announcement.findUniqueOrThrow({
            where: { id },
        });
        res.json(announcement);
    } catch (err) {
        console.error("GET ANNOUNCEMENT BY ID ERROR:", err);
        res.status(404).json({ error: "Announcement not found" });
    }
};

export const createAnnouncement = async (req, res) => {
    try {
        const announcement = await prisma.announcement.create({
            data: {
                ...req.body,
                userId: req.user.id, 
            },
        });

        res.status(201).json(announcement);
    } catch (err) {
        console.error("CREATE ANNOUNCEMENT ERROR:", err);
        res.status(400).json({ error: "Invalid data" });
    }
};

export const updateAnnouncement = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const existing = await prisma.announcement.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ error: "Announcement not found" });
        }
        
        if (existing.userId !== req.user.id) {
            return res.status(403).json({ error: "Access denied" });
        }

        const updated = await prisma.announcement.update({
            where: { id },
            data: req.body,
        });

        res.json(updated);
    } catch (err) {
        console.error("UPDATE ANNOUNCEMENT ERROR:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const existing = await prisma.announcement.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ error: "Announcement not found" });
        }
        
        if (existing.userId !== req.user.id) {
            return res.status(403).json({ error: "Access denied" });
        }

        await prisma.announcement.delete({ where: { id } });

        res.status(204).end();
    } catch (err) {
        console.error("DELETE ANNOUNCEMENT ERROR:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
