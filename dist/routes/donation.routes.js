"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const donation_controller_1 = require("../controllers/donation.controller");
const router = (0, express_1.Router)();
// Get all donations (admin only)
router.get('/', auth_middleware_1.authenticate, role_middleware_1.isAdmin, donation_controller_1.getAllDonations);
// Get user's donations
router.get('/my-donations', auth_middleware_1.authenticate, donation_controller_1.getDonationsByUser);
// Get donation by ID
router.get('/:id', auth_middleware_1.authenticate, donation_controller_1.getDonationById);
// Create new donation
router.post('/', auth_middleware_1.authenticate, donation_controller_1.createDonation);
// Update donation (admin only)
router.put('/:id', auth_middleware_1.authenticate, role_middleware_1.isAdmin, donation_controller_1.updateDonation);
// Delete donation (admin only)
router.delete('/:id', auth_middleware_1.authenticate, role_middleware_1.isAdmin, donation_controller_1.deleteDonation);
exports.default = router;
