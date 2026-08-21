import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import * as XLSX from 'xlsx';
import { 
  Plus, Trash2, Edit, Search, RefreshCw, RotateCw, Printer, FileSpreadsheet,
  List, Filter, MoreVertical, Settings, ChevronRight, Home, CheckCircle2, AlertCircle,
  Eye, Copy, ChevronDown, Clock, X, FileText, Upload, BookOpen, Download
} from 'lucide-react';

export default function BookList({ initialView = 'list' }) {
  const [bookLists, setBookLists] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTitle, setFilterTitle] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({});
  const [showFilterBar, setShowFilterBar] = useState(false);

  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Header 3-Dots Menu state
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  // Row 3-Dots Menu State
  const [openRowMenuId, setOpenRowMenuId] = useState(null);

  // View modes: 'list' | 'add' | 'edit' | 'duplicate'
  const [viewMode, setViewMode] = useState(initialView);
  const [editingBook, setEditingBook] = useState(null);
  const [selectedBookModal, setSelectedBookModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [importModal, setImportModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);

  // Initial Form State matching Screenshot 5
  const initialForm = {
    type: 'Textbook',
    course: '',
    subject: '',
    title: '',
    author: '',
    publisher: 'PROVIDED IN THE SCHOOL',
    description: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, cRes, sRes] = await Promise.allSettled([
        API.get('/book-lists'),
        API.get('/courses'),
        API.get('/subjects')
      ]);

      if (bRes.status === 'fulfilled') setBookLists(Array.isArray(bRes.value.data) ? bRes.value.data : []);
      if (cRes.status === 'fulfilled') setCoursesList(Array.isArray(cRes.value.data) ? cRes.value.data : []);
      if (sRes.status === 'fulfilled') setSubjectsList(Array.isArray(sRes.value.data) ? sRes.value.data : []);

      setError('');
    } catch (err) {
      console.error('Error loading book list data:', err);
      setError('Failed to load book list records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useSchoolRefresh(fetchData);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target)) {
        setIsHeaderMenuOpen(false);
      }
      if (!event.target.closest('.row-menu-container')) {
        setOpenRowMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers for Add/Edit/Duplicate
  const handleOpenAdd = () => {
    setEditingBook(null);
    setFormData(initialForm);
    setViewMode('add');
  };

  const handleOpenEdit = (item) => {
    setOpenRowMenuId(null);
    setEditingBook(item);
    setFormData({
      type: item.type || 'Textbook',
      course: item.course || '',
      subject: item.subject || '',
      title: item.title || '',
      author: item.author || '',
      publisher: item.publisher || '',
      description: item.description || ''
    });
    setViewMode('edit');
  };

  const handleOpenDuplicate = (item) => {
    setOpenRowMenuId(null);
    setEditingBook(null);
    setFormData({
      type: item.type || 'Textbook',
      course: item.course || '',
      subject: item.subject || '',
      title: item.title ? `${item.title} (Copy)` : '',
      author: item.author || '',
      publisher: item.publisher || '',
      description: item.description || ''
    });
    setViewMode('duplicate');
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.course.trim()) {
      setError('Course is required');
      return;
    }
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      if (editingBook) {
        await API.put(`/book-lists/${editingBook._id}`, formData);
        setSuccessMsg('Book list item updated successfully!');
      } else {
        await API.post('/book-lists', formData);
        setSuccessMsg(viewMode === 'duplicate' ? 'Duplicated book list item saved!' : 'Book list item created successfully!');
      }

      await fetchData();

      if (keepAdding && viewMode !== 'edit') {
        setFormData(initialForm);
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Failed to save book list record');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action Trigger
  const handleActionDeleteTrigger = (id) => {
    setOpenRowMenuId(null);
    setConfirmModal({
      isOpen: true,
      title: 'Are you sure?',
      message: 'You might not be able to reverse this action. Confirm to proceed?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await API.delete(`/book-lists/${id}`);
          setBookLists(prev => prev.filter(item => item._id !== id));
          setSuccessMsg('Book record deleted successfully!');
        } catch (err) {
          console.error('Delete error:', err);
          setError('Failed to delete book record');
        }
      }
    });
  };

  // Header Menu Actions
  const handleRefreshAction = async () => {
    setIsHeaderMenuOpen(false);
    await fetchData();
    setSuccessMsg('Book list refreshed successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrintAction = () => {
    setIsHeaderMenuOpen(false);
    window.print();
  };

  const handleExportExcelAction = () => {
    setIsHeaderMenuOpen(false);
    if (bookLists.length === 0) {
      setError('No book list records to export');
      return;
    }

    try {
      const exportData = filteredBookLists.map((item, index) => ({
        '#': index + 1,
        'Type': item.type || '',
        'Course': item.course || '',
        'Subject': item.subject || '',
        'Title': item.title || '',
        'Publisher': item.publisher || '',
        'Created At': item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Book_List');

      XLSX.writeFile(workbook, `Campus_Pilot_Book_List_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccessMsg('Exported book list to Excel successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export to Excel');
    }
  };

  // Bulk Excel Import Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        setError('No data found in uploaded Excel file');
        setLoading(false);
        return;
      }

      const formatted = jsonData.map(row => ({
        type: row['Type'] || row['type'] || 'Textbook',
        course: row['Course'] || row['course'] || 'Nursery (NUR)',
        subject: row['Subject'] || row['subject'] || 'General',
        title: row['Title'] || row['title'] || 'Untitled',
        author: row['Author'] || row['author'] || '',
        publisher: row['Publisher'] || row['publisher'] || 'PROVIDED IN THE SCHOOL',
        description: row['Description'] || row['description'] || ''
      }));

      const res = await API.post('/book-lists/import', { items: formatted });
      setSuccessMsg(res.data.message || 'Imported books successfully!');
      setImportModal(false);
      await fetchData();
    } catch (err) {
      console.error('Import error:', err);
      setError('Failed to import Excel file. Check formatting.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSampleTemplate = () => {
    const sampleData = [
      {
        Type: 'Textbook',
        Course: 'Nursery (NUR)',
        Subject: 'English',
        Title: 'MY FIRST STRIDE - A (RHYMES)',
        Author: 'Sample Author',
        Publisher: 'UNITED PUBLICATION',
        Description: 'Sample Description'
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample_Template');
    XLSX.writeFile(workbook, 'Book_List_Import_Template.xlsx');
  };

  const formatCreatedAt = (d) => {
    if (!d) return '-';
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return '-';
    const month = dateObj.toLocaleDateString('en-US', { month: 'long' });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${month} ${day}, ${year} ${timeStr}`;
  };

  // Sorting
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Sort Logic
  const filteredBookLists = bookLists
    .filter(item => {
      const matchesSearch = 
        !searchTerm ||
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.subject && item.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.publisher && item.publisher.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = !appliedFilters.type || item.type === appliedFilters.type;
      const matchesCourse = !appliedFilters.course || (item.course && item.course.toLowerCase().includes(appliedFilters.course.toLowerCase()));
      const matchesSubject = !appliedFilters.subject || (item.subject && item.subject.toLowerCase().includes(appliedFilters.subject.toLowerCase()));
      const matchesTitle = !appliedFilters.title || (item.title && item.title.toLowerCase().includes(appliedFilters.title.toLowerCase()));
      const matchesAuthor = !appliedFilters.author || (item.author && item.author.toLowerCase().includes(appliedFilters.author.toLowerCase()));

      return matchesSearch && matchesType && matchesCourse && matchesSubject && matchesTitle && matchesAuthor;
    })
    .sort((a, b) => {
      let valA = (a[sortField] || '').toString().toLowerCase();
      let valB = (b[sortField] || '').toString().toLowerCase();
      if (sortField === 'createdAt') {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalResults = filteredBookLists.length;
  const totalPages = Math.ceil(totalResults / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedBookLists = filteredBookLists.slice(startIndex, startIndex + perPage);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#f4f6f9] dark:bg-slate-900 font-sans print:p-0 print:bg-white">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-booklist-area, #printable-booklist-area * {
            visibility: visible;
          }
          #printable-booklist-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="max-w-7xl w-full mx-auto space-y-6">
        
        {/* Top Breadcrumb & Page Header Bar matching Screenshots 1 & 5 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <nav className="flex items-center space-x-2 text-xs font-medium text-gray-400 dark:text-slate-400 mb-1">
              <a href="/admin/dashboard" className="flex items-center hover:text-teal-600 dark:hover:text-teal-400 transition">
                <Home className="w-3.5 h-3.5 mr-1" /> Dashboard
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <span className="hover:text-teal-600 dark:hover:text-teal-400 transition">Academic</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <button onClick={() => setViewMode('list')} className="hover:text-teal-600 dark:hover:text-teal-400 transition font-semibold text-gray-600 dark:text-slate-300">
                Book list
              </button>
              {viewMode !== 'list' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">
                    {viewMode === 'add' ? 'Add Book list' : viewMode === 'edit' ? 'Edit Book list' : 'Duplicate Book list'}
                  </span>
                </>
              )}
            </nav>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'list' ? 'Book list' : viewMode === 'add' ? 'Add Book list' : viewMode === 'edit' ? 'Edit Book list' : 'Duplicate Book list'}
            </h1>
          </div>

          {/* Top Right Header Buttons matching Screenshots 1, 3 & 5 */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            {viewMode === 'list' ? (
              <>
                {/* Add Book list Button (Screenshot 1) */}
                <button 
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  Add Book list
                </button>

                {/* Filter Icon Button */}
                <button 
                  onClick={() => setShowFilterBar(!showFilterBar)}
                  title="Filter"
                  className={`p-2.5 bg-white dark:bg-slate-800 border ${showFilterBar ? 'border-teal-500 text-teal-600' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs`}
                >
                  <Filter className="w-4 h-4" />
                </button>

                {/* HEADER 3-DOTS BUTTON & DROPDOWN MENU matching Screenshot 3 */}
                <div className="relative" ref={headerMenuRef}>
                  <button 
                    onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                    title="More Options"
                    className={`p-2.5 bg-white dark:bg-slate-800 border ${isHeaderMenuOpen ? 'border-teal-500 text-teal-600 ring-2 ring-teal-500/20' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu matching Screenshot 3 */}
                  {isHeaderMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200/80 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="divide-y divide-gray-100 dark:divide-slate-700/80">
                        
                        {/* 1. Import */}
                        <button
                          onClick={() => {
                            setIsHeaderMenuOpen(false);
                            setImportModal(true);
                          }}
                          className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3"
                        >
                          <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>Import</span>
                        </button>

                        {/* 2. Refresh */}
                        <button
                          onClick={handleRefreshAction}
                          className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3"
                        >
                          <RotateCw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>Refresh</span>
                        </button>

                        {/* 3. Print */}
                        <button
                          onClick={handlePrintAction}
                          className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3"
                        >
                          <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>Print</span>
                        </button>

                        {/* 4. Generate PDF */}
                        <button
                          onClick={handlePrintAction}
                          className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3"
                        >
                          <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>Generate PDF</span>
                        </button>

                        {/* 5. Export to Excel */}
                        <button
                          onClick={handleExportExcelAction}
                          className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>Export to Excel</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button 
                onClick={() => setViewMode('list')}
                className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                List all Book list
              </button>
            )}
          </div>
        </div>

        {/* Notifications Alert */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-2xl text-sm font-medium flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-sm font-medium flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
          </div>
        )}

        {/* FILTER CARD PANEL matching Screenshot 4 */}
        {showFilterBar && viewMode === 'list' && (
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm no-print space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Type Filter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Type
                </label>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                >
                  <option value="">Type</option>
                  <option value="Textbook">Textbook</option>
                  <option value="Reference Book">Reference Book</option>
                  <option value="Workbook">Workbook</option>
                  <option value="Story Book">Story Book</option>
                  <option value="Notebook">Notebook</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Course Filter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Course
                </label>
                <input 
                  type="text"
                  placeholder="Course"
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Subject Filter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Subject
                </label>
                <input 
                  type="text"
                  placeholder="Subject"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Title Filter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Title
                </label>
                <input 
                  type="text"
                  placeholder="Title"
                  value={filterTitle}
                  onChange={(e) => setFilterTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Author Filter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Author
                </label>
                <input 
                  type="text"
                  placeholder="Author"
                  value={filterAuthor}
                  onChange={(e) => setFilterAuthor(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

            </div>

            {/* Filter Action Buttons matching Screenshot 4 */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-slate-700">
              <button 
                onClick={() => {
                  setFilterType('');
                  setFilterCourse('');
                  setFilterSubject('');
                  setFilterTitle('');
                  setFilterAuthor('');
                  setAppliedFilters({});
                  setShowFilterBar(false);
                }}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setAppliedFilters({
                    type: filterType,
                    course: filterCourse,
                    subject: filterSubject,
                    title: filterTitle,
                    author: filterAuthor
                  });
                  setCurrentPage(1);
                }}
                className="px-5 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>Filter</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: LIST (Screenshots 1, 2, 3 Exact Match)
           ======================================================== */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-visible p-6 sm:p-8" id="printable-booklist-area">
            
            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-700 no-print">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search book list..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              <button 
                onClick={fetchData} 
                className="p-2 text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Print Header */}
            <div className="hidden print:block mb-4 text-center">
              <h2 className="text-xl font-bold">Campus Pilot - Academic Book List</h2>
              <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Table matching Screenshots 1 & 2 columns */}
            <div className="overflow-visible min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/50">
                    <th className="px-6 py-3.5">TYPE</th>
                    <th className="px-6 py-3.5">COURSE</th>
                    <th className="px-6 py-3.5">SUBJECT</th>
                    <th 
                      onClick={() => toggleSort('title')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>TITLE</span>
                        <span className="text-[10px]">⇅</span>
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('publisher')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>PUBLISHER</span>
                        <span className="text-[10px]">⇅</span>
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('createdAt')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>CREATED AT</span>
                        <span className="text-[10px]">⇅</span>
                      </div>
                    </th>
                    <th className="px-6 py-3.5 text-right no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                  {paginatedBookLists.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                        No book list items found. Click <button onClick={handleOpenAdd} className="text-teal-600 dark:text-teal-400 font-bold underline">Add Book list</button> to create one.
                      </td>
                    </tr>
                  ) : (
                    paginatedBookLists.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                        
                        {/* TYPE */}
                        <td className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-slate-300">
                          {item.type || 'Textbook'}
                        </td>

                        {/* COURSE */}
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {item.course}
                        </td>

                        {/* SUBJECT */}
                        <td className="px-6 py-4 text-xs font-medium text-gray-700 dark:text-slate-300">
                          {item.subject}
                        </td>

                        {/* TITLE Column */}
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                          {item.title}
                        </td>

                        {/* PUBLISHER Column */}
                        <td className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase">
                          {item.publisher || 'PROVIDED IN THE SCHOOL'}
                        </td>

                        {/* CREATED AT Column */}
                        <td className="px-6 py-4 text-xs text-gray-600 dark:text-slate-300 whitespace-nowrap">
                          {formatCreatedAt(item.createdAt)}
                        </td>

                        {/* ROW ACTIONS 3-DOT MENU matching Screenshot 2 */}
                        <td className="px-6 py-4 text-right no-print relative">
                          <div className="relative inline-block text-left row-menu-container">
                            <button 
                              onClick={() => setOpenRowMenuId(openRowMenuId === item._id ? null : item._id)}
                              className={`p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition ${openRowMenuId === item._id ? 'bg-slate-100 dark:bg-slate-700 text-teal-600 ring-2 ring-teal-500/20' : ''}`}
                              title="Actions Menu"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* ROW ACTION DROPDOWN MENU - 4 ITEMS matching Screenshot 2 */}
                            {openRowMenuId === item._id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200/90 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                                <div className="py-1">
                                  
                                  {/* 1. Show */}
                                  <button
                                    onClick={() => {
                                      setOpenRowMenuId(null);
                                      setSelectedBookModal(item);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Show</span>
                                  </button>

                                  {/* 2. Edit */}
                                  <button
                                    onClick={() => handleOpenEdit(item)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <Edit className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Edit</span>
                                  </button>

                                  {/* 3. Duplicate */}
                                  <button
                                    onClick={() => handleOpenDuplicate(item)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Duplicate</span>
                                  </button>

                                  {/* 4. Delete */}
                                  <button
                                    onClick={() => handleActionDeleteTrigger(item._id)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition flex items-center gap-2.5 border-t border-gray-100 dark:border-slate-700/60 mt-1 pt-1.5"
                                  >
                                    <Trash2 className="w-4 h-4 text-rose-500" />
                                    <span>Delete</span>
                                  </button>

                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls matching Screenshot 1 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-gray-100 dark:border-slate-700/80 no-print text-xs text-gray-500 dark:text-slate-400">
              <div>
                Showing {totalResults === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + perPage, totalResults)} of {totalResults} results
              </div>

              <div className="flex items-center space-x-3">
                <select 
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-teal-500 transition"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>

                <div className="flex items-center space-x-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    &lt;
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${currentPage === page ? 'bg-[#1e293b] text-white shadow-xs' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 text-gray-700 dark:text-slate-300'}`}
                    >
                      {page}
                    </button>
                  ))}

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Branding */}
            <div className="text-center pt-8 text-xs font-medium text-gray-400 dark:text-slate-500">
              Campus Pilot
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: ADD / EDIT / DUPLICATE (Screenshot 5 Exact Match)
           ======================================================== */}
        {(viewMode === 'add' || viewMode === 'edit' || viewMode === 'duplicate') && (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Form Inputs Panel matching Screenshot 5 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 p-6 sm:p-8 space-y-6 shadow-sm">
              
              {/* Type, Course & Subject (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Type Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                  >
                    <option value="Textbook">Textbook</option>
                    <option value="Reference Book">Reference Book</option>
                    <option value="Workbook">Workbook</option>
                    <option value="Story Book">Story Book</option>
                    <option value="Notebook">Notebook</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Course Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Course
                  </label>
                  {coursesList.length > 0 ? (
                    <select
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                    >
                      <option value="">Course</option>
                      {coursesList.map(c => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      placeholder="Course (e.g. Nursery (NUR))"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                  )}
                </div>

                {/* Subject Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Subject
                  </label>
                  {subjectsList.length > 0 ? (
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                    >
                      <option value="">Subject</option>
                      {subjectsList.map(s => (
                        <option key={s._id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      placeholder="Subject (e.g. English)"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                  )}
                </div>

              </div>

              {/* Title, Author & Publisher (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Title Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Title
                  </label>
                  <input 
                    type="text"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>

                {/* Author Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Author
                  </label>
                  <input 
                    type="text"
                    placeholder="Author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>

                {/* Publisher Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Publisher
                  </label>
                  <input 
                    type="text"
                    placeholder="Publisher"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>

              </div>

              {/* Description Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Description
                </label>
                <textarea 
                  rows={3}
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

            </div>

            {/* Bottom Toolbar matching Screenshot 5 */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData(initialForm)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 font-semibold text-xs rounded-xl transition"
                >
                  Reset
                </button>

                <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 dark:text-slate-300 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={keepAdding}
                    onChange={(e) => setKeepAdding(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Keep Adding</span>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            {/* Bottom Branding */}
            <div className="text-center pt-4 text-xs font-medium text-gray-400 dark:text-slate-500">
              Campus Pilot
            </div>
          </form>
        )}

      </div>

      {/* ========================================================
          SHOW DETAILS MODAL (When clicking "Show" in row menu)
         ======================================================== */}
      {selectedBookModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                  {selectedBookModal.title}
                </h3>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-1">
                  {selectedBookModal.course} | {selectedBookModal.subject}
                </p>
              </div>
              <button 
                onClick={() => setSelectedBookModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700 dark:text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-700">
                <span className="font-semibold text-gray-500">Book Type:</span>
                <span className="font-bold">{selectedBookModal.type || 'Textbook'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-700">
                <span className="font-semibold text-gray-500">Author:</span>
                <span className="font-medium">{selectedBookModal.author || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-700">
                <span className="font-semibold text-gray-500">Publisher:</span>
                <span className="font-semibold text-gray-900 dark:text-white uppercase">{selectedBookModal.publisher || 'PROVIDED IN THE SCHOOL'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-700">
                <span className="font-semibold text-gray-500">Created At:</span>
                <span>{formatCreatedAt(selectedBookModal.createdAt)}</span>
              </div>

              {selectedBookModal.description && (
                <div className="pt-2">
                  <span className="font-semibold text-gray-500 block mb-1">Description:</span>
                  <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-gray-600 dark:text-slate-300">
                    {selectedBookModal.description}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={() => setSelectedBookModal(null)}
                className="px-5 py-2 bg-[#1e293b] text-white font-semibold text-xs rounded-xl hover:bg-[#0f172a] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          BULK EXCEL IMPORT MODAL (When clicking "Import" in menu)
         ======================================================== */}
      {importModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-600" />
                Import Book List via Excel
              </h3>
              <button 
                onClick={() => setImportModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Upload an Excel file (.xlsx, .xls) containing book details (Columns: Type, Course, Subject, Title, Author, Publisher).
              </p>

              <button
                type="button"
                onClick={handleDownloadSampleTemplate}
                className="w-full py-2.5 px-4 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-teal-100 transition"
              >
                <Download className="w-4 h-4" />
                Download Sample Excel Template
              </button>

              <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-teal-500 transition cursor-pointer relative bg-gray-50/50 dark:bg-slate-900/50">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileSpreadsheet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 block">
                  Click or drag Excel file to upload
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setImportModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CONFIRMATION MODAL (Delete trigger)
         ======================================================== */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center border border-gray-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button 
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
