/**
 * Inventory Management System API
 *
 * This module provides a complete inventory management system with both a unified API
 * and individual services for managing tools, employees, assignments, and certificates.
 */

// Export the main InventoryAPI (recommended for most use cases)
export { InventoryAPI } from './services/InventoryAPI';

// Export individual services for granular control
export { AssignmentService } from './services/AssignmentService';
export { CertificateService } from './services/CertificateService';
export { EmployeeService } from './services/EmployeeService';
export { ToolService } from './services/ToolService';

// Export all types for external consumption
export type { IPaginatedResponse } from './interfaces/IPaginatedResponse';
export type { IPaginationOptions } from './interfaces/IPaginationOptions';
export type { AssigmentResult, ISO8601Date, UnassignResult } from './types/AssignmentType';
export type { Employee, EmployeeDirectory, EmployeeId } from './types/EmployeeInventoryType';
export type { Tool, ToolId, ToolInventory, ToolType } from './types/ToolInventoryType';
