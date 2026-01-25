
import { EquipmentRecord } from '../types';
import { computeRecordFields } from './calculations';

/**
 * Exports equipment records to a TSV format optimized for 
 * direct "Ctrl+V" pasting into Google Sheets.
 */
export function exportToSheets(records: EquipmentRecord[]) {
  const headers = [
    "SL NO",
    "Equipment Type",
    "Company Name",
    "Description",
    "Serial Number",
    "Unit",
    "Qty",
    "Rental Company",
    "Rate Type",
    "Rate Value",
    "Received Date",
    "Returned Date",
    "Days Using",
    "Rental Cost (SAR)",
    "Invoice No",
    "Claim Month",
    "Claim Status",
    "Pending Amount (SAR)",
    "Calibration Due",
    "Calibration Days",
    "Calibration Status",
    "Remarks"
  ];

  const rows = records.map((r, i) => {
    const comp = computeRecordFields(r);
    return [
      r.slNo || i + 1,
      r.ownershipType,
      r.internalCompany,
      r.description,
      r.serialNumber,
      r.unit,
      r.qty,
      r.rentalCompany,
      r.rateType,
      r.rateValue,
      r.kitReceivedDate,
      r.kitReturnedDate || "ACTIVE",
      comp.daysUsing,
      comp.rentalCost.toFixed(2),
      r.invoiceNumber || "N/A",
      r.claimMonth,
      comp.pendingClaimStatus,
      comp.pendingAmount.toFixed(2),
      r.calibrationDueDate,
      comp.calibrationRemainingDays,
      comp.reminderStatus,
      r.remarks || ""
    ];
  });

  const tsv = [headers, ...rows]
    .map(row => row.map(cell => {
      // Clean string values for TSV (remove tabs/newlines)
      const str = String(cell).replace(/\t/g, " ").replace(/\n/g, " ");
      return str;
    }).join("\t"))
    .join("\n");

  navigator.clipboard.writeText(tsv);
}
