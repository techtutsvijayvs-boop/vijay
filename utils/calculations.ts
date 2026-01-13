
import { differenceInDays, parseISO, startOfDay, format } from 'date-fns';
import { EquipmentRecord, ComputedFields, CalibrationStatus } from '../types';

export const computeRecordFields = (record: EquipmentRecord): ComputedFields => {
  const today = startOfDay(new Date());
  const received = parseISO(record.kitReceivedDate);
  const returned = record.kitReturnedDate ? parseISO(record.kitReturnedDate) : null;
  const calibDue = parseISO(record.calibrationDueDate);

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
  } else if (record.invoiceNumber.trim() !== '') {
    pendingClaimStatus = 'SUBMITTED';
  }

  // 4. Pending Amount
  // Amount is pending unless payment is actually confirmed done
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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const getMonthYear = (dateStr: string) => {
  return format(parseISO(dateStr), 'MMMM yyyy');
};
