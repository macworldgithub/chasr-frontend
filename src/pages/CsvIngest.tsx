import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  FileCheck,
  Layers,
  Download,
} from 'lucide-react';
import { integrationsApi } from '../api/client';
import { CsvUploadResult, CsvMapping, CsvValidationResult, CsvTemplate } from '../types';

export const CsvIngest: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<CsvUploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mappings State
  const [mappings, setMappings] = useState<CsvMapping[]>([]);
  const [templateName, setTemplateName] = useState<string>('');
  const [templates, setTemplates] = useState<CsvTemplate[]>([]);

  // Validation & Commit State
  const [validation, setValidation] = useState<CsvValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitJobId, setCommitJobId] = useState<string | null>(null);

  // Target fields supported by Chasr Ledger
  const targetFields = [
    { key: 'contactName', label: 'Contact / Customer Name', required: true },
    { key: 'invoiceNumber', label: 'Invoice Number', required: true },
    { key: 'amount', label: 'Total Amount ($)', required: true },
    { key: 'dueDate', label: 'Due Date (YYYY-MM-DD)', required: false },
    { key: 'issueDate', label: 'Issue Date (YYYY-MM-DD)', required: false },
    { key: 'status', label: 'Payment Status (PAID/AUTHORISED)', required: false },
    { key: 'currency', label: 'Currency Code', required: false },
  ];

  useEffect(() => {
    integrationsApi.getCsvTemplates().then(setTemplates).catch(console.error);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setIsUploading(true);

    try {
      const res = await integrationsApi.uploadCsv(selectedFile);
      setUploadResult(res);

      // Auto-suggest mappings based on header matching
      const initialMappings: CsvMapping[] = targetFields.map((tf) => {
        const match = res.headers.find(
          (h) => h.toLowerCase().replace(/[^a-z0-9]/g, '') === tf.key.toLowerCase()
        );
        return {
          sourceColumn: match || res.headers[0] || '',
          targetField: tf.key,
        };
      });
      setMappings(initialMappings);
      setStep(2);
    } catch (err: any) {
      alert(`Upload Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMappingChange = (targetField: string, sourceColumn: string) => {
    setMappings((prev) =>
      prev.map((m) => (m.targetField === targetField ? { ...m, sourceColumn } : m))
    );
  };

  const handleValidateMappings = async () => {
    if (!uploadResult) return;
    setIsValidating(true);
    try {
      const res = await integrationsApi.validateCsvMappings(uploadResult.uploadId, mappings);
      setValidation(res);
      setStep(3);
    } catch (err: any) {
      alert(`Validation Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCommitUpload = async () => {
    if (!uploadResult) return;
    setIsCommitting(true);
    try {
      const res = await integrationsApi.commitCsv(
        uploadResult.uploadId,
        mappings,
        templateName || undefined
      );
      setCommitJobId(res.jobId);
      setStep(4);
    } catch (err: any) {
      alert(`Commit Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">CSV Ingestion & Column Mapper</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Upload accounting CSV exports, map headers to Chasr schema, and dispatch sync job
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {[
          { num: 1, title: 'Upload File' },
          { num: 2, title: 'Map Columns' },
          { num: 3, title: 'Validate Dataset' },
          { num: 4, title: 'Commit & Ingest' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 sm:p-3.5 rounded-2xl glass-panel border transition-all flex items-center gap-2.5 sm:gap-3 ${
              step === s.num
                ? 'border-cyan-500/60 bg-cyan-500/10 text-white shadow-glow-cyan'
                : step > s.num
                ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400'
                : 'border-dark-border text-slate-500'
            }`}
          >
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                step === s.num
                  ? 'bg-cyan-500 text-black'
                  : step > s.num
                  ? 'bg-emerald-500 text-black'
                  : 'bg-dark-card border border-dark-border text-slate-500'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : s.num}
            </div>
            <span className="font-semibold text-xs truncate">{s.title}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Upload File & Pick Templates */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-border text-center relative overflow-hidden">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mb-1">Select AR CSV Export File</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 px-2">
              Supports files up to 25MB exported from Xero, MYOB, QuickBooks, or custom ERP systems.
            </p>

            <label className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-glow-cyan">
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Staging CSV...' : 'Browse & Stage CSV'}</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Pre-configured Templates Download */}
          <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-dark-border">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Sample Ledger Templates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {templates.map((tpl) => (
                <div
                  key={tpl.name}
                  className="p-3.5 rounded-xl bg-dark-card/60 border border-dark-border flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-200 truncate">{tpl.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono capitalize">{tpl.provider} Spec</div>
                  </div>
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Interactive Column Mapper Matrix */}
      {step === 2 && uploadResult && (
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-dark-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Column Mapping Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Uploaded: <span className="font-mono text-cyan-300">{file?.name}</span> ({uploadResult.totalRows} rows)
              </p>
            </div>

            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Save Template Name (Optional)"
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Mapping Grid */}
          <div className="space-y-3">
            {targetFields.map((field) => {
              const currentMapping = mappings.find((m) => m.targetField === field.key);
              return (
                <div
                  key={field.key}
                  className="p-3.5 sm:p-4 rounded-xl bg-dark-card/60 border border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                >
                  <div>
                    <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                      {field.label}
                      {field.required && <span className="text-rose-400 text-[10px]">*Required</span>}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">Chasr Field: {field.key}</span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block shrink-0" />
                    <select
                      value={currentMapping?.sourceColumn || ''}
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                      className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-dark-bg border border-dark-border text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 sm:min-w-[220px]"
                    >
                      {uploadResult.headers.map((hdr) => (
                        <option key={hdr} value={hdr}>
                          CSV: {hdr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-dark-border">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white text-center"
            >
              Back to Upload
            </button>
            <button
              onClick={handleValidateMappings}
              disabled={isValidating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white text-xs font-semibold hover:opacity-90 shadow-glow-cyan flex items-center justify-center gap-2"
            >
              <span>{isValidating ? 'Validating...' : 'Validate Dataset'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Dataset Validation Results */}
      {step === 3 && validation && (
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-dark-border space-y-6">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Validation Results
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-dark-card border border-dark-border">
              <div className="text-xs text-slate-400 font-mono">Total Rows</div>
              <div className="text-xl sm:text-2xl font-bold text-white">{validation.totalRows}</div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-xs text-emerald-400 font-mono">Valid Rows</div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-300">{validation.validRows}</div>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div className="text-xs text-rose-400 font-mono">Row Errors</div>
              <div className="text-xl sm:text-2xl font-bold text-rose-300">{validation.errors.length}</div>
            </div>
          </div>

          {validation.errors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
              <div className="font-semibold text-xs text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Validation Warnings & Parse Errors:
              </div>
              <ul className="text-[11px] font-mono text-rose-200 space-y-1 max-h-40 overflow-y-auto">
                {validation.errors.map((err, idx) => (
                  <li key={idx} className="break-all">
                    Row {err.row}: <span className="font-bold">{err.field}</span> — {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-dark-border">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white text-center"
            >
              Re-map Columns
            </button>
            <button
              onClick={handleCommitUpload}
              disabled={isCommitting || validation.validRows === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white text-xs font-semibold hover:opacity-90 shadow-glow-cyan flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isCommitting ? 'Committing...' : 'Commit & Ingest Dataset'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success & Queue Confirmation */}
      {step === 4 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-border text-center space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-cyan">
            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">CSV Sync Dispatched!</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto px-2">
            Job ID <span className="font-mono text-cyan-300 break-all">{commitJobId}</span> has been queued into BullMQ. Your CSV ledger entries are now syncing into Chasr.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setStep(1)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-white text-xs font-semibold"
            >
              Upload Another CSV
            </button>
            <a
              href="/sync-logs"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 shadow-glow-indigo text-center"
            >
              Monitor Sync Operations
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
