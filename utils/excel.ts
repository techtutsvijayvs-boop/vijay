
import * as XLSX from 'xlsx';
import { EquipmentRecord, RateType } from '../types';
import { format, isValid } from 'date-fns';

/**
 * Robust date parser for Excel. 
 * Handles Excel serial numbers, ISO strings, and standard date strings.
 */
export function safeDate(value: any): string {
  if (!value) return new Date().toISOString().split('T')[0];

  // Handle Excel numeric date format (Serial Number)
  if (typeof value === "number") {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split("T")[0];
  }

  const parsed = new Date(value);
  if (isValid(parsed)) {
    return parsed.toISOString().split("T")[0];
  }

  // Final fallback
  return new Date().toISOString().split('T')[0];
}

export const parseExcelToEquipment = (fileBuffer: ArrayBuffer): EquipmentRecord[] => {
  const workbook = XLSX.read(fileBuffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Use header: 'A' to map columns to keys A, B, C...
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 'A', defval: '' }) as any[];
  
  // Skip the first row if it's a header row
  const dataRows = rows.slice(1);

  return dataRows.map((row, index) => {
    // Mapping based on user request:
    // A Description | B Serial Number | C Unit | D Qty | E Internal Company | F Rental Vendor | G Rate Type | H Rate Value | I Received Date | J Calibration Due Date
    
    const description = row['A']?.toString().trim() || 'NEW EQUIPMENT';
    const serialNumber = row['B']?.toString().trim() || `TBD-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const unit = row['C']?.toString().trim() || 'set';
    const qty = parseInt(row['D']) || 1;
    const internalCompany = row['E']?.toString().trim() || 'MUWALYH SITE OFFICE';
    const rentalCompany = row['F']?.toString().trim() || 'To Be Specified';
    
    let rateType: RateType = 'Daily';
    const rawRateType = row['G']?.toString().trim();
    if (['Daily', 'Weekly', 'Monthly'].includes(rawRateType)) {
      rateType = rawRateType as RateType;
    }
    const rateValue = parseFloat(row['H']) || 0;
    
    const kitReceivedDate = safeDate(row['I']);
    const calibrationDueDate = safeDate(row['J']);

    return {
      id: `xl_${Math.random().toString(36).substr(2, 9)}`,
      slNo: index + 1, // Will be recalculated on final import
      description,
      serialNumber,
      unit,
      qty,
      internalCompany,
      rentalCompany,
      ownershipType: 'Rental', // Default, will be overridden by batch selector in UI
      rateType,
      rateValue,
      kitReceivedDate,
      kitReturnedDate: null,
      invoiceNumber: '',
      claimMonth: getSafeMonthYear(kitReceivedDate),
      remarks: 'Imported from Excel',
      calibrationDueDate,
      approvalStatus: 'N/A',
      isPaymentDone: false,
      attachments: []
    } as EquipmentRecord;
  }).filter(r => r.serialNumber && r.serialNumber.indexOf('TBD-') === -1 || r.description !== 'NEW EQUIPMENT');
};

const getSafeMonthYear = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (!isValid(d)) return format(new Date(), 'MMMM yyyy');
    return format(d, 'MMMM yyyy');
  } catch (e) {
    return format(new Date(), 'MMMM yyyy');
  }
};
