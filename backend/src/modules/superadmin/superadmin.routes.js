const express = require('express');
const superAdminController = require('./superadmin.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate, authorize('SUPER_ADMIN'));

router.get('/super-admin/health', superAdminController.health);
router.get('/super-admin/notifications', superAdminController.notifications);
router.get('/super-admin/stats', superAdminController.stats);
router.get('/super-admin/barbershops/recent', superAdminController.listRecentBarbershops);
router.get('/super-admin/barbershops', superAdminController.listBarbershops);
router.get('/super-admin/barbershops/:id', superAdminController.getBarbershop);
router.patch('/super-admin/barbershops/:id/activate', superAdminController.activateBarbershop);
router.patch('/super-admin/barbershops/:id/suspend', superAdminController.suspendBarbershop);
router.delete('/super-admin/barbershops/:id', superAdminController.deleteBarbershop);

module.exports = router;
