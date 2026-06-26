import { Router } from "express";
import {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from "../controllers/announcements.controller.js";

import {
    getAnnouncementsValidator,
    getByIdValidator,
    createAnnouncementValidator,
    updateAnnouncementValidator,
} from "../validators/announcements.validators.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Get list of announcements
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search announcements by title
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *         description: Sort announcements
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of announcements
 */
router.get("/", getAnnouncementsValidator, getAnnouncements);

/**
 * @swagger
 * /announcements/{id}:
 *   get:
 *     summary: Get announcement by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the announcement
 *     responses:
 *       200:
 *         description: Announcement found
 *       404:
 *         description: Not found
 */
router.get("/:id", getByIdValidator, getAnnouncementById);

/**
 * @swagger
 * /announcements:
 *   post:
 *     summary: Create new announcement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - category
 *               - contactInfo
 *             properties:
 *               title:
 *                 type: string
 *                 example: Selling iPhone 12
 *               description:
 *                 type: string
 *                 example: Good condition, 128GB, battery 90%
 *               price:
 *                 type: number
 *                 example: 350
 *               category:
 *                 type: string
 *                 enum: [sale, service, job, other]
 *                 example: sale
 *               contactInfo:
 *                 type: string
 *                 example: "telegram: @robert"
 *     responses:
 *       201:
 *         description: Announcement created
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, createAnnouncementValidator, createAnnouncement);

/**
 * @swagger
 * /announcements/{id}:
 *   patch:
 *     summary: Update announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the announcement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [sale, service, job, other]
 *               contactInfo:
 *                 type: string
 *             example:
 *               price: 300
 *     responses:
 *       200:
 *         description: Announcement updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.patch("/:id", authenticate, updateAnnouncementValidator, updateAnnouncement);

/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     summary: Delete announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the announcement
 *     responses:
 *       204:
 *         description: Announcement deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete("/:id", authenticate, getByIdValidator, deleteAnnouncement);

export default router;
