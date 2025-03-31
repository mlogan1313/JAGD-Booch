/**
 * Utility functions for generating and managing batch codes
 */

import { BatchCode } from '../types/batch';

/**
 * Generates a new batch code in the format YYYYMMDD-XXXX-ZZZZ
 * @param date - The date the batch was created
 * @param batchNumber - Sequential number for the day (1-9999)
 * @param batchType - Type of batch (1F, 2F, KEG, BTL)
 * @returns A formatted batch code
 */
export function generateBatchCode(
  date: Date,
  batchNumber: number,
  batchType: '1F' | '2F' | 'KEG' | 'BTL'
): string {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const numberStr = batchNumber.toString().padStart(4, '0');
  const typeCode = {
    '1F': '1F00',
    '2F': '2F00',
    'KEG': 'KEG0',
    'BTL': 'BTL0'
  }[batchType];

  return `${dateStr}-${numberStr}-${typeCode}`;
}

/**
 * Creates a new batch code with lineage information
 * @param date - The date the batch was created
 * @param batchNumber - Sequential number for the day
 * @param batchType - Type of batch
 * @param parentCode - Optional parent batch code
 * @returns A complete BatchCode object
 */
export function createBatchCode(
  date: Date,
  batchNumber: number,
  batchType: '1F' | '2F' | 'KEG' | 'BTL',
  parentCode?: string
): BatchCode {
  const code = generateBatchCode(date, batchNumber, batchType);
  
  // If this is a child batch, build the lineage
  const lineage = parentCode 
    ? [...getBatchLineage(parentCode), parentCode]
    : [code];

  return {
    code,
    parentCode,
    childCodes: [],
    lineage
  };
}

/**
 * Gets the complete lineage of a batch code
 * @param batchCode - The batch code to get lineage for
 * @returns Array of batch codes in lineage order
 */
export function getBatchLineage(batchCode: string): string[] {
  // This would typically query the database to get the full lineage
  // For now, we'll just return the code itself
  return [batchCode];
}

/**
 * Validates a batch code format
 * @param code - The batch code to validate
 * @returns true if the code is valid, false otherwise
 */
export function isValidBatchCode(code: string): boolean {
  const pattern = /^\d{8}-\d{4}-(1F00|2F00|KEG0|BTL0)$/;
  return pattern.test(code);
}

/**
 * Parses a batch code into its components
 * @param code - The batch code to parse
 * @returns Object containing the parsed components
 */
export function parseBatchCode(code: string): {
  date: Date;
  batchNumber: number;
  batchType: '1F' | '2F' | 'KEG' | 'BTL';
} | null {
  if (!isValidBatchCode(code)) {
    return null;
  }

  const [dateStr, numberStr, typeStr] = code.split('-');
  const date = new Date(
    parseInt(dateStr.slice(0, 4)),
    parseInt(dateStr.slice(4, 6)) - 1,
    parseInt(dateStr.slice(6, 8))
  );

  const batchNumber = parseInt(numberStr);
  const batchType = typeStr.slice(0, 2) as '1F' | '2F' | 'KEG' | 'BTL';

  return { date, batchNumber, batchType };
} 