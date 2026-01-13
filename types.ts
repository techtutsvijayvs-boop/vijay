
export type RateType = 'Daily' | 'Weekly' | 'Monthly';

export type CalibrationStatus = '✅ OK' | '🔔 DUE SOON' | '⚠️ URGENT' | '❌ EXPIRED';

export type ApprovalStatus = 'A' | 'AWC' | 'RE' | 'C' | 'R' | 'N/A';

export interface Attachment {
  id: string;
  name: string;
  data: string; // Base64
  type: string; // MIME
  uploadedAt: string;
  category: 'Invoice' | 'Receipt' | 'Manual' | 'Certificate' | 'Other';
}

export interface EquipmentRecord {
  id: string;
  slNo: number;
  description: string;
  serialNumber: string;
  unit: string;
  qty: number;
  internalCompany: string;
  rentalCompany: string;
  rateType: RateType;
  rateValue: number;
  kitReceivedDate: string;
  kitReturnedDate: string | null;
  invoiceNumber: string;
  claimMonth: string;
  remarks: string;
  calibrationDueDate: string;
  approvalStatus?: ApprovalStatus;
  isPaymentDone?: boolean;
  paymentDate?: string;
  attachments: Attachment[];
}

export interface ComputedFields {
  daysUsing: number;
  rentalCost: number;
  pendingClaimStatus: 'PENDING' | 'SUBMITTED' | 'PAID';
  pendingAmount: number;
  calibrationRemainingDays: number;
  reminderStatus: CalibrationStatus;
}

export interface RentalContract {
  id: string;
  companyName: string;
  equipmentType: string;
  rateType: RateType;
  rateValue: number;
  remarks: string;
}
