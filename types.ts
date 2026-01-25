
export type RateType = 'Daily' | 'Weekly' | 'Monthly';

export type OwnershipType = 'Rental' | 'Own';

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

export interface AdminComment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
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
  ownershipType: OwnershipType;
  rateType: RateType;
  rateValue: number;
  kitReceivedDate: string;
  kitReturnedDate: string | null;
  invoiceNumber: string;
  claimMonth: string;
  remarks: string;
  calibrationDueDate: string;
  
  // Workflow Fields
  approvalStatus?: ApprovalStatus;
  workflowStage?: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Paid';
  adminComments?: AdminComment[];
  
  isPaymentDone?: boolean;
  paymentDate?: string;
  attachments: Attachment[];
}

export interface ContactEntry {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  companyName: string;
  location: string;
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
