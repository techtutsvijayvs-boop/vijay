
import { differenceInDays, format } from 'date-fns';
import { EquipmentRecord, ComputedFields, CalibrationStatus } from '../types';

export const computeRecordFields = (record: EquipmentRecord): ComputedFields => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const received = record.kitReceivedDate ? new Date(record.kitReceivedDate) : new Date();
  const returned = record.kitReturnedDate ? new Date(record.kitReturnedDate) : null;
  const calibDue = record.calibrationDueDate ? new Date(record.calibrationDueDate) : new Date();

  // Validate dates - if invalid, fallback to safe calculations
  const isReceivedValid = !isNaN(received.getTime());
  const isCalibValid = !isNaN(calibDue.getTime());
  const isReturnedValid = returned ? !isNaN(returned.getTime()) : true;

  if (!isReceivedValid || !isCalibValid || !isReturnedValid) {
    return {
      daysUsing: 0,
      rentalCost: 0,
      pendingClaimStatus: 'PENDING',
      pendingAmount: 0,
      calibrationRemainingDays: 0,
      reminderStatus: '✅ OK'
    };
  }

  // 1. No. of Days Using
  const daysUsing = differenceInDays(returned || today, received);

  // 2. Rental Cost
  let rentalCost = 0;
  if (record.rateType === 'Daily') {
    rentalCost = daysUsing * record.rateValue;
  } else if (record.rateType === 'Weekly') {
    rentalCost = Math.ceil(daysUsing / 7) * record.rateValue;
  } else if (record.rateType === 'Monthly') {
    rentalCost = Math.ceil(daysUsing / 30) * record.rateValue;
  }

  // 3. Pending Claim Status
  let pendingClaimStatus: 'PENDING' | 'SUBMITTED' | 'PAID' = 'PENDING';
  if (record.isPaymentDone) {
    pendingClaimStatus = 'PAID';
  } else if (record.invoiceNumber?.trim()) {
    pendingClaimStatus = 'SUBMITTED';
  }

  // 4. Pending Amount
  const pendingAmount = record.isPaymentDone ? 0 : rentalCost;

  // 5. Calibration Remaining Days
  const calibrationRemainingDays = differenceInDays(calibDue, today);

  // 6. Calibration Reminder Status
  let reminderStatus: CalibrationStatus = '✅ OK';
  if (calibrationRemainingDays <= 0) {
    reminderStatus = '❌ EXPIRED';
  } else if (calibrationRemainingDays <= 7) {
    reminderStatus = '⚠️ URGENT';
  } else if (calibrationRemainingDays <= 30) {
    reminderStatus = '🔔 DUE SOON';
  }

  return {
    daysUsing: Math.max(0, daysUsing),
    rentalCost,
    pendingClaimStatus,
    pendingAmount,
    calibrationRemainingDays,
    reminderStatus
  };
};

export const formatCurrency = (amount: number) => {
  return `⃁ ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
};

export const getMonthYear = (dateStr: string) => {
  if (!dateStr) return 'Unknown Date';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return format(d, 'MMMM yyyy');
};
