import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import API from '../api/axios';
import { 
  FileSpreadsheet, Download, Upload, CheckCircle2, AlertCircle, 
  RefreshCw, LayoutDashboard, FileCheck, X
} from 'lucide-react';

export default function DownloadFormat() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeItem, setActiveItem] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [activeFileName, setActiveFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Grouped Template Definitions matching User Screenshots with Batch & Course Linking
  const formatCategories = [
    {
      title: 'Academic',
      items: [
        { name: 'Batch.xlsx', key: 'batch', headers: ['Batch Name', 'Class Name', 'Max Strength', 'Roll Prefix', 'Description'] },
        { name: 'Course.xlsx', key: 'course', headers: ['Course Code', 'Course Name', 'Department', 'Credits', 'Description'] },
        { name: 'Subject Incharge.xlsx', key: 'subject_incharge', headers: ['Subject Name', 'Teacher Name', 'Employee ID', 'Class Name', 'Section'] }
      ]
    },
    {
      title: 'Employee',
      items: [
        { name: 'Employee Account.xlsx', key: 'employee_account', headers: ['Employee ID', 'Bank Name', 'Account Number', 'IFSC Code', 'PAN Number'] },
        { name: 'Employee Document.xlsx', key: 'employee_document', headers: ['Employee ID', 'Document Type', 'Document Number', 'Issue Date'] },
        { name: 'Employee Experience.xlsx', key: 'employee_experience', headers: ['Employee ID', 'Previous Organization', 'Designation', 'Years of Experience'] },
        { name: 'Employee Qualification.xlsx', key: 'employee_qualification', headers: ['Employee ID', 'Degree/Diploma', 'Passing Year', 'University/Board', 'Percentage'] },
        { name: 'Employee Update.xlsx', key: 'employee_update', headers: ['Employee ID', 'Full Name', 'Contact Number', 'Email Address', 'Current Address'] },
        { name: 'Employee.xlsx', key: 'employee', headers: ['Employee ID', 'Full Name', 'Gender', 'Role', 'Department', 'Designation', 'Email', 'Contact'] }
      ]
    },
    {
      title: 'Exam',
      items: [
        { name: 'Exam Mark.xlsx', key: 'exam_mark', headers: ['Student Roll No', 'Student Name', 'Exam Title', 'Total Marks', 'Obtained Marks'] },
        { name: 'Subject Wise Exam Mark.xlsx', key: 'subject_wise_exam_mark', headers: ['Roll No', 'Student Name', 'Subject', 'Theory Marks', 'Practical Marks', 'Grade'] }
      ]
    },
    {
      title: 'Fee',
      items: [
        { name: 'Custom Fee.xlsx', key: 'custom_fee', headers: ['Roll No', 'Student Name', 'Fee Group', 'Custom Amount', 'Due Date'] },
        { name: 'Fee Payment Import.xlsx', key: 'fee_payment', headers: ['Receipt No', 'Roll No', 'Paid Amount', 'Payment Mode', 'Payment Date'] },
        { name: 'Transaction.xlsx', key: 'transaction', headers: ['Transaction ID', 'Account Head', 'Type (Income/Expense)', 'Amount', 'Date', 'Description'] }
      ]
    },
    {
      title: 'Finance',
      items: [
        { name: 'Vendor.xlsx', key: 'vendor', headers: ['Vendor Name', 'Company Name', 'Contact Person', 'Email', 'Phone', 'GST Number', 'Address'] }
      ]
    },
    {
      title: 'HR / Admin',
      items: [
        { name: 'Department.xlsx', key: 'department', headers: ['Department Code', 'Department Name', 'Head of Department', 'Location'] },
        { name: 'Designation.xlsx', key: 'designation', headers: ['Designation Name', 'Department', 'Grade Level', 'Responsibilities'] },
        { name: 'Timesheet.xlsx', key: 'timesheet', headers: ['Employee ID', 'Employee Name', 'Date', 'Check In Time', 'Check Out Time', 'Hours Worked'] }
      ]
    },
    {
      title: 'Inventory',
      items: [
        { name: 'Stock Category.xlsx', key: 'stock_category', headers: ['Category Code', 'Category Name', 'Description'] },
        { name: 'Stock Item.xlsx', key: 'stock_item', headers: ['Item Code', 'Item Name', 'Category', 'Quantity In Stock', 'Unit Price', 'Supplier'] }
      ]
    },
    {
      title: 'Library',
      items: [
        { name: 'Book List.xlsx', key: 'book_list', headers: ['ISBN', 'Book Title', 'Author', 'Publisher', 'Edition', 'Total Copies', 'Rack No'] },
        { name: 'Library Book Copy.xlsx', key: 'library_book_copy', headers: ['Barcode', 'Book Title', 'Copy Number', 'Condition', 'Status'] },
        { name: 'Library Book With Copy.xlsx', key: 'library_book_with_copy', headers: ['ISBN', 'Book Title', 'Author', 'Barcode', 'Shelf Location'] },
        { name: 'Library Book.xlsx', key: 'library_book', headers: ['Book Code', 'Title', 'Author', 'Category', 'Price', 'Quantity'] }
      ]
    },
    {
      title: 'Other',
      items: [
        { name: 'Historical Student.xlsx', key: 'historical_student', headers: ['Roll Number', 'Student Name', 'Class Name', 'Batch', 'Passing Year', 'Grade/Class', 'Leaving Certificate No'] }
      ]
    },
    {
      title: 'Reception',
      items: [
        { name: 'Enquiry.xlsx', key: 'enquiry', headers: ['Enquiry No', 'Visitor Name', 'Phone', 'Email', 'Class Interested', 'Reference', 'Followup Date'] }
      ]
    },
    {
      title: 'Student',
      items: [
        { name: 'Guardian.xlsx', key: 'guardian', headers: ['Guardian Name', 'Relation', 'Phone', 'Email', 'Occupation', 'Address'] },
        { name: 'Student Account.xlsx', key: 'student_account', headers: ['Roll Number', 'Student Name', 'Class Name', 'Batch', 'Bank Name', 'Account No', 'IFSC Code'] },
        { name: 'Student Create User Account.xlsx', key: 'student_create_user', headers: ['Roll Number', 'Student Name', 'Class Name', 'Batch', 'Username', 'Email', 'Default Password'] },
        { name: 'Student Document.xlsx', key: 'student_document', headers: ['Roll Number', 'Document Name', 'Document Number', 'Verification Status'] },
        { name: 'Student Qualification.xlsx', key: 'student_qualification', headers: ['Roll Number', 'Previous School', 'Board', 'Passing Grade', 'Percentage'] },
        { name: 'Student Update User Account.xlsx', key: 'student_update_user', headers: ['Roll Number', 'Email', 'Phone', 'New Status'] },
        { name: 'Student Update.xlsx', key: 'student_update', headers: ['Roll Number', 'Full Name', 'Class Name', 'Batch', 'Contact Number', 'Email Address'] },
        { name: 'Student.xlsx', key: 'student', headers: ['Roll Number', 'First Name', 'Last Name', 'Class Name', 'Batch', 'Gender', 'Email', 'Contact Number', 'Guardian Name', 'Address'] }
      ]
    },
    {
      title: 'Transport',
      items: [
        { name: 'Transport Stoppage.xlsx', key: 'transport_stoppage', headers: ['Route Name', 'Stop Name', 'Pickup Time', 'Drop Time', 'Monthly Fare'] },
        { name: 'Vehicle Document.xlsx', key: 'vehicle_document', headers: ['Vehicle No', 'Document Name', 'Expiry Date', 'Insurance Policy No'] },
        { name: 'Vehicle Expense.xlsx', key: 'vehicle_expense', headers: ['Vehicle No', 'Expense Type', 'Amount', 'Date', 'Fuel Vendor'] },
        { name: 'Vehicle Incharge.xlsx', key: 'vehicle_incharge', headers: ['Vehicle No', 'Driver Name', 'Driver Phone', 'License No'] },
        { name: 'Vehicle.xlsx', key: 'vehicle', headers: ['Vehicle Number', 'Vehicle Model', 'Seating Capacity', 'Driver Name', 'Contact Number'] }
      ]
    }
  ];

  // Client-side Excel Generator using SheetJS (XLSX)
  const handleDownloadFormat = (item) => {
    const headers = item.headers || ['ID', 'Name', 'Description'];
    const sampleRow = {};
    headers.forEach(h => {
      if (h.toLowerCase().includes('date')) sampleRow[h] = '2026-08-15';
      else if (h.toLowerCase().includes('email')) sampleRow[h] = 'example@school.local';
      else if (h.toLowerCase().includes('phone') || h.toLowerCase().includes('contact')) sampleRow[h] = '9876543210';
      else if (h.toLowerCase().includes('amount') || h.toLowerCase().includes('price') || h.toLowerCase().includes('marks')) sampleRow[h] = '100';
      else if (h === 'Class Name' || h === 'Class') sampleRow[h] = 'LKG';
      else if (h === 'Batch' || h === 'Section') sampleRow[h] = 'Section A';
      else sampleRow[h] = `Sample ${h}`;
    });

    const worksheet = XLSX.utils.json_to_sheet([sampleRow]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Template');
    XLSX.writeFile(workbook, item.name);
  };

  // Open Upload Modal
  const handleOpenUpload = (item) => {
    setActiveItem(item);
    setActiveModule(item.key);
    setActiveFileName(item.name);
    setUploadResult(null);
    setIsUploadModalOpen(true);
  };

  // Handle XLSX File Read & Upload to Backend with Strict Header Validation
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const dataStr = evt.target.result;
        const workbook = XLSX.read(dataStr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet);

        if (jsonRows.length === 0) {
          setUploadResult({ success: false, message: 'The uploaded XLSX file is empty.' });
          setUploading(false);
          return;
        }

        // ==========================================
        // STRICT FORMAT VALIDATION (Headers Check)
        // ==========================================
        const uploadedHeaders = Object.keys(jsonRows[0] || {});
        const expectedHeaders = activeItem?.headers || [];

        // Normalize helper function
        const normalize = (str) => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');

        const normUploaded = uploadedHeaders.map(normalize);
        const normExpected = expectedHeaders.map(normalize);

        // Count how many expected headers are present in uploaded file
        const matchedHeadersCount = normExpected.filter(h => normUploaded.includes(h)).length;
        const matchPercentage = (matchedHeadersCount / normExpected.length) * 100;

        // If less than 40% matching headers, block the upload!
        if (matchedHeadersCount === 0 || (expectedHeaders.length > 2 && matchPercentage < 40)) {
          setUploadResult({
            success: false,
            message: `❌ Format Mismatch Error! The uploaded file columns (${uploadedHeaders.slice(0, 3).join(', ')}) do not match the expected template format for "${activeFileName}" (${expectedHeaders.slice(0, 3).join(', ')}). Please download the exact format file and upload again!`
          });
          setUploading(false);
          // Reset file input so user can pick the right file
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        // Send parsed rows to Backend Database Import API
        const res = await API.post('/import/bulk', {
          moduleKey: activeModule,
          data: jsonRows
        });

        setUploadResult({
          success: true,
          message: res.data.message || `Successfully imported ${jsonRows.length} rows into database!`,
          importedCount: res.data.importedCount || jsonRows.length
        });
      } catch (err) {
        console.error('Import failed:', err);
        setUploadResult({
          success: false,
          message: err.response?.data?.message || err.message || 'Failed to process and save XLSX data to database.'
        });
      } finally {
        setUploading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Main Title Matching User Screenshot */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-100 tracking-tight">
            Download Format
          </h1>
          <span className="text-xs font-semibold px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full border border-teal-200 dark:border-teal-800">
            XLSX Template & Import Engine
          </span>
        </div>

        {/* Categories Fieldsets Grid */}
        <div className="space-y-6">
          {formatCategories.map((cat, idx) => (
            <fieldset 
              key={idx} 
              className="border border-slate-300 dark:border-slate-700 rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-800/80 shadow-sm"
            >
              <legend className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700/60 rounded-lg">
                {cat.title}
              </legend>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-2">
                {cat.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx}
                    className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800 hover:border-teal-400 dark:hover:border-teal-500 transition-all group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <FileSpreadsheet className="w-4 h-4 text-slate-400 group-hover:text-teal-500 flex-shrink-0 transition-colors" />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      {/* Download Format XLSX */}
                      <button
                        type="button"
                        onClick={() => handleDownloadFormat(item)}
                        title={`Download ${item.name}`}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-1 border border-slate-200 dark:border-slate-700"
                      >
                        <Download className="w-3 h-3" />
                        <span className="hidden sm:inline">Download</span>
                      </button>

                      {/* Upload Data to DB */}
                      <button
                        type="button"
                        onClick={() => handleOpenUpload(item)}
                        title={`Upload data for ${item.name}`}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors flex items-center space-x-1 shadow-sm"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        {/* Dashboard Button Matching Bottom Screenshot */}
        <div className="flex justify-center pt-4 pb-8">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-teal-500 dark:hover:bg-teal-600 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center space-x-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>

      </div>

      {/* Upload XLSX Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-teal-500" />
                <span>Upload XLSX Data: {activeFileName}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please select the exact <strong>{activeFileName}</strong> spreadsheet file formatted with column headers: <span className="font-semibold text-teal-600 dark:text-teal-400">{activeItem?.headers?.slice(0, 4).join(', ')}...</span>
            </p>

            {/* File Input Box */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-teal-500 dark:hover:border-teal-500 transition-colors">
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                id="xlsx-upload-input"
              />
              <label 
                htmlFor="xlsx-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                  Click to select {activeFileName} file
                </span>
                <span className="text-[11px] text-slate-400">Excel Spreadsheets (.xlsx, .xls)</span>
              </label>
            </div>

            {/* Status Message */}
            {uploading && (
              <div className="flex items-center justify-center space-x-2 py-3 text-xs font-semibold text-teal-600 dark:text-teal-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Validating format & importing to database...</span>
              </div>
            )}

            {uploadResult && (
              <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-start space-x-2.5 ${
                uploadResult.success 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              }`}>
                {uploadResult.success ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                )}
                <div>
                  <p className="font-bold">{uploadResult.message}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
