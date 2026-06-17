// components/common/AgencyImportExportButtons.tsx
import React, { useRef, useState } from 'react';
import { Button, Box, Typography, Alert, CircularProgress } from '@mui/material';
import { Upload, Download, FileText } from 'lucide-react';
import { Agency } from '../../api/types';
import { CSVValidationResult } from '../../api/csvtype';
import { convertAgenciesToCSV, generateAgencyCSVTemplate } from '../services/agencyCsvTemplateService';
import { validateAgencyCSVFile } from '../services/agencyCsvValidationService';
import { importAgencies } from '../services/agencyImportService';


interface AgencyImportExportButtonsProps {
  items: Agency[];
  onImportComplete: () => void;
  isLoading?: boolean;
}

export const AgencyImportExportButtons: React.FC<AgencyImportExportButtonsProps> = ({
  items,
  onImportComplete,
  isLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    loading: boolean;
    result: CSVValidationResult | null;
    showPreview: boolean;
  }>({
    loading: false,
    result: null,
    showPreview: false,
  });

  const handleExport = () => {
    const csvContent = convertAgenciesToCSV(items);
    downloadCSV(csvContent, 'agencies_export.csv');
  };

  const handleTemplateDownload = () => {
    const templateContent = generateAgencyCSVTemplate();
    downloadCSV(templateContent, 'agency_import_template.csv');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus(prev => ({ ...prev, loading: true, result: null }));

    try {
      const validationResult = await validateAgencyCSVFile(file);
      setImportStatus(prev => ({ 
        ...prev, 
        result: validationResult,
        showPreview: !validationResult.isValid || validationResult.validRows > 0
      }));
    } catch (error) {
      setImportStatus(prev => ({
        ...prev,
        result: {
          isValid: false,
          errors: ['Failed to read CSV file'],
          validatedData: [],
          totalRows: 0,
          validRows: 0,
        },
        showPreview: true,
      }));
    } finally {
      setImportStatus(prev => ({ ...prev, loading: false }));
    }

    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!importStatus.result?.validatedData.length) return;

    setImportStatus(prev => ({ ...prev, loading: true }));

    try {
      await importAgencies(importStatus.result.validatedData);
      onImportComplete();
      setImportStatus({ loading: false, result: null, showPreview: false });
    } catch (error) {
      setImportStatus(prev => ({
        ...prev,
        result: {
          ...prev.result!,
          errors: [...prev.result?.errors || [], 'Failed to import agencies'],
        },
        loading: false,
      }));
    }
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".csv"
        style={{ display: 'none' }}
      />
      
      <Button
        variant="outlined"
        startIcon={<Upload size={14} />}
        onClick={handleImportClick}
        disabled={isLoading || importStatus.loading}
        sx={{ fontSize: 12, py: 0.8 }}
      >
        <span className="hidden md:block">Import CSV</span>
      </Button>

      <Button
        variant="outlined"
        startIcon={<Download size={14} />}
        onClick={handleExport}
        disabled={isLoading || items.length === 0}
        sx={{ fontSize: 12, py: 0.8 }}
      >
        <span className="hidden md:block">Export CSV</span>
      </Button>

      <Button
        variant="outlined"
        startIcon={<FileText size={14} />}
        onClick={handleTemplateDownload}
        disabled={isLoading}
        sx={{ fontSize: 12, py: 0.8 }}
      >
        <span className="hidden md:block">Template</span>
      </Button>

      {/* Import Preview Modal */}
      {importStatus.showPreview && importStatus.result && (
        <AgencyImportPreviewModal
          result={importStatus.result}
          loading={importStatus.loading}
          onConfirm={handleConfirmImport}
          onCancel={() => setImportStatus(prev => ({ ...prev, showPreview: false }))}
        />
      )}
    </Box>
  );
};

// Agency Import Preview Modal Component
const AgencyImportPreviewModal: React.FC<{
  result: CSVValidationResult;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ result, loading, onConfirm, onCancel }) => {
  
  const getErrorSummary = () => {
    const referenceErrors = result.errors.filter(error => 
      error.includes('not found:') || error.includes('City not found') || error.includes('State not found')
    ).length;
    
    const validationErrors = result.errors.length - referenceErrors;
    
    return { referenceErrors, validationErrors };
  };

  const { referenceErrors, validationErrors } = getErrorSummary();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          padding: 3,
          borderRadius: 1,
          maxWidth: 700,
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Agency CSV Import Preview
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {result.totalRows} rows found • {result.validRows} valid rows • {result.totalRows - result.validRows} errors
        </Typography>

        {/* Error Summary */}
        {(referenceErrors > 0 || validationErrors > 0) && (
          <Box sx={{ mb: 2 }}>
            {referenceErrors > 0 && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {referenceErrors} reference errors (city or state not found)
                </Typography>
              </Alert>
            )}
            {validationErrors > 0 && (
              <Alert severity="error" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {validationErrors} validation errors (missing or invalid fields)
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {/* Detailed Errors */}
        {result.errors.length > 0 && (
          <Box sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
            <Typography variant="subtitle2" gutterBottom>
              Detailed Errors:
            </Typography>
            <Box sx={{ 
              backgroundColor: 'grey.50', 
              p: 1, 
              borderRadius: 1,
              fontSize: '0.75rem',
              fontFamily: 'monospace'
            }}>
              {result.errors.slice(0, 10).map((error, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                  {error}
                </Typography>
              ))}
              {result.errors.length > 10 && (
                <Typography variant="body2" color="text.secondary">
                  ... and {result.errors.length - 10} more errors
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {result.validRows > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {result.validRows} agencies ready to import. References will be resolved automatically.
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={loading || result.validRows === 0}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Importing...' : `Import ${result.validRows} Agencies`}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};