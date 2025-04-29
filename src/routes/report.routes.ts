import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Generate financial report in PDF format
router.get('/financial/pdf', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), reportController.generateFinancialReportPDF);

// Generate financial report in Excel format
router.get('/financial/excel', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), reportController.generateFinancialReportExcel);

// Generate members report in PDF format
router.get('/members/pdf', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), reportController.generateMembersReportPDF);

// Generate members report in Excel format
router.get('/members/excel', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), reportController.generateMembersReportExcel);

// Generate payments report in PDF format
router.get('/payments/pdf', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), reportController.generatePaymentsReportPDF);

// Generate payments report in Excel format
router.get('/payments/excel', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), reportController.generatePaymentsReportExcel);

// Generate loans report in PDF format
router.get('/loans/pdf', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), reportController.generateLoansReportPDF);

// Generate loans report in Excel format
router.get('/loans/excel', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), reportController.generateLoansReportExcel);

// Generate dues report in PDF format
router.get('/dues/pdf', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), reportController.generateDuesReportPDF);

// Generate dues report in Excel format
router.get('/dues/excel', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), reportController.generateDuesReportExcel);

export default router;
