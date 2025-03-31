/**
 * TypeScript enums for constrained values
 */

export enum EquipmentType {
  KETTLE = 'kettle',
  FERMENTER = 'fermenter',
  KEG = 'keg',
  BOTTLE = 'bottle'
}

export enum ContainerType {
  BOTTLE = 'bottle',
  KEG = 'keg'
}

export enum EquipmentStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  CLEANING = 'cleaning'
}

export enum ContainerStatus {
  EMPTY = 'empty',
  FILLED = 'filled',
  CLEANING = 'cleaning'
}

export enum BatchStage {
  ONE_F = '1F',
  TWO_F = '2F',
  KEGGED = 'KEGGED',
  BOTTLED = 'BOTTLED',
  COMPLETED = 'COMPLETED'
}

export enum AuditEventType {
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_ROLE_CHANGE = 'user_role_change',
  BATCH_CREATE = 'batch_create',
  BATCH_UPDATE = 'batch_update',
  BATCH_DELETE = 'batch_delete',
  EQUIPMENT_STATUS_CHANGE = 'equipment_status_change',
  CONTAINER_STATUS_CHANGE = 'container_status_change',
  QUALITY_CHECK_ADDED = 'quality_check_added',
  QUALITY_CHECK_FAILED = 'quality_check_failed'
} 