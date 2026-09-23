import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Upload, FileText, CheckCircle2, AlertTriangle, Download, X } from 'lucide-react';
import { dataStore } from '../../services/storage/dataStore';
import { CsvValidationResult, LeadPriority } from '../../types';
import { showToast } from '../common/Toast';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [validationResults, setValidationResults] = useState<CsvValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setValidationResults([]);
    setIsProcessing(false);
    setIsImporting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const downloadSampleCsv = () => {
    const csvContent =
      'client_name,business_name,phone_number,city,business_type,priority,notes\n' +
      'Rohan Gupta,Gupta Electronics,+91 98111 22334,Delhi,Retail,HIGH,Interested in telecaller service\n' +
      'Sunil Joshi,Joshi Sweets & Caterers,+91 98222 33445,Patna,Food & Beverage,MEDIUM,Call during afternoon\n' +
      'Anita Rao,Rao Diagnostics & Clinic,+91 98333 44556,Bengaluru,Healthcare,URGENT,Needs immediate software quote\n' +
      'Mohan Lal,Lal Hardware & Paints,+91 98444 55667,Jaipur,Wholesale,LOW,Follow up next week\n' +
      'Pooja Verma,Verma Academy,+91 98555 66778,Saharsa,Education,HIGH,Student outreach inquiries';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'nexgenai_leads_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvContent = (text: string) => {
    setIsProcessing(true);
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setValidationResults([]);
      setIsProcessing(false);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    const rows: CsvValidationResult[] = [];

    const existingLeads = dataStore.getLeads();
    const existingPhones = new Set(existingLeads.map((l) => l.phoneNumber.replace(/[\s-]/g, '')));
    const seenBatchPhones = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i];
      // Basic CSV column split supporting quotes
      const values = currentLine.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
      const raw: Record<string, string> = {};
      headers.forEach((h, idx) => {
        raw[h] = values[idx] || '';
      });

      const errors: string[] = [];
      const clientName = raw.client_name || raw.clientname || raw.name || '';
      const phoneNumber = raw.phone_number || raw.phonenumber || raw.phone || '';
      const businessName = raw.business_name || raw.businessname || raw.company || '';
      const city = raw.city || '';
      const businessType = raw.business_type || raw.businesstype || '';
      const priorityRaw = (raw.priority || 'MEDIUM').toUpperCase() as LeadPriority;
      const notes = raw.notes || '';

      if (!clientName) {
        errors.push('Client name is required');
      }

      if (!phoneNumber) {
        errors.push('Phone number is required');
      } else {
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
          errors.push('Phone must have at least 10 digits');
        } else if (existingPhones.has(phoneNumber.replace(/[\s-]/g, ''))) {
          errors.push('Phone number already exists in system');
        } else if (seenBatchPhones.has(phoneNumber.replace(/[\s-]/g, ''))) {
          errors.push('Duplicate phone in this CSV file');
        } else {
          seenBatchPhones.add(phoneNumber.replace(/[\s-]/g, ''));
        }
      }

      const priority: LeadPriority = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priorityRaw)
        ? priorityRaw
        : 'MEDIUM';

      rows.push({
        rowNumber: i + 1,
        raw,
        isValid: errors.length === 0,
        errors,
        parsedLead:
          errors.length === 0
            ? {
                clientName,
                businessName: businessName || undefined,
                phoneNumber,
                city: city || undefined,
                businessType: businessType || undefined,
                priority,
                notes: notes || undefined,
                status: 'NEW',
              }
            : undefined,
      });
    }

    setValidationResults(rows);
    setIsProcessing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target?.result as string;
        if (content) {
          parseCsvContent(content);
        }
      };
      reader.readAsText(selected);
    }
  };

  const validRows = validationResults.filter((r) => r.isValid);
  const invalidRows = validationResults.filter((r) => !r.isValid);

  const handleExecuteImport = () => {
    if (validRows.length === 0) return;
    setIsImporting(true);

    setTimeout(() => {
      const leadsToCreate = validRows.map((r) => r.parsedLead as any);
      dataStore.bulkCreateLeads(leadsToCreate);
      showToast(`✓ ${validRows.length} leads imported successfully`, 'success');
      onImportComplete();
      handleClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Leads via CSV"
      subtitle="Upload a CSV file to bulk import leads into NexGenAi"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Top bar with sample download */}
        <div className="flex items-center justify-between p-3 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
          <div className="text-xs text-[#6B756D]">
            Required columns: <span className="font-semibold text-[#172017]">client_name, phone_number</span>
          </div>
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#E9F9EF] text-[#0BAA45] border border-[#E5E9E5] hover:border-[#16C763] rounded-lg text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample CSV</span>
          </button>
        </div>

        {/* Upload Dropzone */}
        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#E5E9E5] hover:border-[#0BAA45] hover:bg-[#E9F9EF]/30 rounded-2xl p-8 text-center cursor-pointer transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#E9F9EF] text-[#0BAA45] flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#172017]">Click to select or drop CSV file</h4>
            <p className="text-xs text-[#6B756D] mt-1">Supports standard .csv format with UTF-8 encoding</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* File preview and summary */}
        {file && (
          <div>
            <div className="flex items-center justify-between p-3 bg-white border border-[#E5E9E5] rounded-xl mb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#0BAA45]" />
                <div>
                  <div className="text-xs font-bold text-[#172017]">{file.name}</div>
                  <div className="text-[11px] text-[#6B756D]">
                    {validationResults.length} rows detected
                  </div>
                </div>
              </div>
              <button
                onClick={resetState}
                className="p-1.5 text-[#6B756D] hover:text-[#E53935] hover:bg-[#FEE2E2]/40 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Validation Metrics Banner */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-center">
                <div className="text-xs text-[#6B756D] font-semibold">Total Rows</div>
                <div className="text-xl font-bold text-[#172017]">{validationResults.length}</div>
              </div>
              <div className="p-3 bg-[#E9F9EF] border border-[#16C763]/40 rounded-xl text-center">
                <div className="text-xs text-[#0BAA45] font-semibold">Valid</div>
                <div className="text-xl font-bold text-[#0BAA45]">{validRows.length}</div>
              </div>
              <div className="p-3 bg-[#FEE2E2] border border-[#E53935]/30 rounded-xl text-center">
                <div className="text-xs text-[#DC2626] font-semibold">Invalid</div>
                <div className="text-xl font-bold text-[#DC2626]">{invalidRows.length}</div>
              </div>
            </div>

            {/* Invalid Rows Alert (if any) */}
            {invalidRows.length > 0 && (
              <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl mb-4 max-h-36 overflow-y-auto">
                <div className="text-xs font-bold text-[#B45309] flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{invalidRows.length} Invalid rows will be skipped:</span>
                </div>
                <ul className="text-[11px] text-[#92400E] space-y-1 pl-4 list-disc">
                  {invalidRows.map((inv) => (
                    <li key={inv.rowNumber}>
                      Row #{inv.rowNumber} ({inv.raw.client_name || inv.raw.phone_number || 'Empty'}): {inv.errors.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Valid Rows Preview Table */}
            {validRows.length > 0 && (
              <div className="border border-[#E5E9E5] rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F8F6] text-[#6B756D] font-bold border-b border-[#E5E9E5] sticky top-0">
                    <tr>
                      <th className="p-2.5">Client</th>
                      <th className="p-2.5">Business</th>
                      <th className="p-2.5">Phone</th>
                      <th className="p-2.5">City</th>
                      <th className="p-2.5">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E9E5]">
                    {validRows.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F8F6]/60">
                        <td className="p-2.5 font-bold text-[#172017]">{row.parsedLead?.clientName}</td>
                        <td className="p-2.5 text-[#6B756D]">{row.parsedLead?.businessName || '-'}</td>
                        <td className="p-2.5 font-mono text-[#172017]">{row.parsedLead?.phoneNumber}</td>
                        <td className="p-2.5 text-[#6B756D]">{row.parsedLead?.city || '-'}</td>
                        <td className="p-2.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E9F9EF] text-[#0BAA45]">
                            {row.parsedLead?.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E5E9E5]">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={validRows.length === 0}
            isLoading={isImporting}
            loadingText={`IMPORTING ${validRows.length} LEADS...`}
            onClick={handleExecuteImport}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {validRows.length > 0 ? `IMPORT ${validRows.length} LEADS` : 'IMPORT LEADS'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
