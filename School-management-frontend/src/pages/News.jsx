import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { SchoolContext } from '../context/SchoolContext';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import {
  Home, Plus, Search, Filter, Settings as SettingsIcon, Columns,
  MoreVertical, List, Newspaper, Edit3, Trash2, Eye, EyeOff,
  ArrowUp, ArrowDown, RotateCcw, Check, X, Bold, Italic,
  Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  Strikethrough, Quote, ListOrdered, Code, Image as ImageIcon,
  Link as LinkIcon, Table as TableIcon, Undo2, Redo2, Maximize2,
  Minimize2, Calendar, User, Clock, Sparkles, Share2, Printer,
  ChevronRight, RefreshCw, FileText, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function News({ initialView = 'list' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { currentSchool } = useContext(SchoolContext) || {};

  // View state: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState(initialView);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Data states
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [layoutMode, setLayoutMode] = useState('table'); // 'table' | 'grid'

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Fullscreen editor state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  // View modal for reading full article
  const [readingArticle, setReadingArticle] = useState(null);

  // Filter dropdown & settings modal state
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Modal input buffers
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    category: 'General',
    status: 'Published',
    coverImage: '',
    isFeatured: false
  });

  const editorRef = useRef(null);
  const editorContainerRef = useRef(null);
  const topRef = useRef(null);
  const bottomRef = useRef(null);

  const categories = ['All', 'General', 'Academic', 'Sports', 'Events', 'Achievements', 'Announcements', 'Campus Life'];
  const formCategories = ['General', 'Academic', 'Sports', 'Events', 'Achievements', 'Announcements', 'Campus Life'];

  // Sync initial view from props or query
  useEffect(() => {
    if (initialView === 'add') {
      handleOpenAdd();
    }
  }, [initialView]);

  // Fetch news articles
  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await API.get('/news');
      setNewsList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useSchoolRefresh(fetchNews);

  // Switch to Add View
  const handleOpenAdd = () => {
    setCurrentEditId(null);
    setFormData({
      title: '',
      subtitle: '',
      content: '',
      category: 'General',
      status: 'Published',
      coverImage: '',
      isFeatured: false
    });
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    setViewMode('add');
  };

  // Switch to Edit View
  const handleOpenEdit = (article) => {
    setCurrentEditId(article._id);
    setFormData({
      title: article.title || '',
      subtitle: article.subtitle || '',
      content: article.content || '',
      category: article.category || 'General',
      status: article.status || 'Published',
      coverImage: article.coverImage || '',
      isFeatured: Boolean(article.isFeatured)
    });
    setViewMode('edit');
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = article.content || '';
      }
    }, 50);
  };

  // Switch back to List View
  const handleBackToList = () => {
    setViewMode('list');
    setCurrentEditId(null);
    setShowLivePreview(false);
    setIsFullscreen(false);
  };

  // Reset form
  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to reset the form fields?')) {
      setFormData({
        title: '',
        subtitle: '',
        content: '',
        category: 'General',
        status: 'Published',
        coverImage: '',
        isFeatured: false
      });
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  };

  // Rich Text Editor Commands
  const executeCommand = (command, value = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setFormData(prev => ({ ...prev, content: editorRef.current.innerHTML }));
  };

  // Format Headings
  const handleFormatBlock = (tag) => {
    executeCommand('formatBlock', `<${tag}>`);
  };

  // Insert Table
  const handleInsertTable = () => {
    if (tableRows <= 0 || tableCols <= 0) return;
    let tableHtml = '<table class="w-full border-collapse border border-slate-300 dark:border-slate-700 my-4">';
    for (let r = 0; r < tableRows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < tableCols; c++) {
        if (r === 0) {
          tableHtml += `<th class="border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2 text-left font-semibold text-xs">Header ${c + 1}</th>`;
        } else {
          tableHtml += `<td class="border border-slate-300 dark:border-slate-700 p-2 text-sm">Data ${r},${c + 1}</td>`;
        }
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</table><p><br></p>';
    executeCommand('insertHTML', tableHtml);
    setShowTableModal(false);
  };

  // Insert Link
  const handleInsertLink = () => {
    if (!linkUrl) return;
    const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') ? linkUrl : `https://${linkUrl}`;
    const text = linkText.trim() || url;
    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline font-medium">${text}</a>`;
    executeCommand('insertHTML', linkHtml);
    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  // Insert Image
  const handleInsertImage = () => {
    if (!imageUrl) return;
    const imageHtml = `
      <figure class="my-4 text-center">
        <img src="${imageUrl}" alt="${imageCaption || 'News attachment'}" class="max-w-full rounded-xl shadow-md mx-auto object-cover max-h-96" />
        ${imageCaption ? `<figcaption class="text-xs text-slate-500 mt-1 italic">${imageCaption}</figcaption>` : ''}
      </figure>
      <p><br></p>
    `;
    executeCommand('insertHTML', imageHtml);
    setImageUrl('');
    setImageCaption('');
    setShowImageModal(false);
  };

  // Insert Math Symbol / Formula
  const handleInsertSymbol = (sym) => {
    executeCommand('insertHTML', `<span>${sym}</span>`);
    setShowFormulaModal(false);
  };

  // Scroll Helpers
  const scrollToTop = () => {
    if (editorContainerRef.current) {
      editorContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (editorContainerRef.current) {
      editorContainerRef.current.scrollTo({ top: editorContainerRef.current.scrollHeight, behavior: 'smooth' });
    } else if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Save News Article
  const handleSave = async (overrideStatus = null) => {
    const finalContent = editorRef.current ? editorRef.current.innerHTML : formData.content;

    if (!formData.title.trim()) {
      alert('Please provide a title for the news article.');
      return;
    }

    if (!finalContent || finalContent.trim() === '' || finalContent === '<p><br></p>') {
      alert('Please provide content for the news article.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        content: finalContent,
        status: overrideStatus || formData.status
      };

      if (viewMode === 'edit' && currentEditId) {
        await API.put(`/news/${currentEditId}`, payload);
      } else {
        await API.post('/news', payload);
      }

      await fetchNews();
      handleBackToList();
    } catch (err) {
      console.error('Error saving news:', err);
      alert(err.response?.data?.message || 'Failed to save news article.');
    } finally {
      setSaving(false);
    }
  };

  // Delete News Article
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this news article?')) return;
    try {
      await API.delete(`/news/${id}`);
      setNewsList(prev => prev.filter(item => item._id !== id));
      setSelectedIds(prev => prev.filter(selId => selId !== id));
    } catch (err) {
      console.error('Error deleting news:', err);
      alert('Failed to delete news article.');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected news articles?`)) return;
    try {
      await API.post('/news/bulk-delete', { ids: selectedIds });
      setNewsList(prev => prev.filter(item => !selectedIds.includes(item._id)));
      setSelectedIds([]);
    } catch (err) {
      console.error('Error bulk deleting news:', err);
      alert('Failed to bulk delete news articles.');
    }
  };

  // Toggle status (Draft <-> Published)
  const handleToggleStatus = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await API.patch(`/news/${id}/status`);
      setNewsList(prev => prev.map(item => (item._id === id ? res.data : item)));
    } catch (err) {
      console.error('Error toggling news status:', err);
      alert('Failed to update status.');
    }
  };

  // Toggle select checkbox
  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Select all checkbox
  const handleSelectAll = () => {
    if (selectedIds.length === filteredNews.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNews.map(item => item._id));
    }
  };

  // Open Reading Modal
  const handleReadArticle = async (article) => {
    setReadingArticle(article);
    try {
      const res = await API.get(`/news/${article._id}`);
      setReadingArticle(res.data);
      // update local view count
      setNewsList(prev => prev.map(item => (item._id === article._id ? { ...item, views: (item.views || 0) + 1 } : item)));
    } catch (err) {
      console.error('Error opening article:', err);
    }
  };

  // Filtered news items
  const filteredNews = newsList.filter(item => {
    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.authorName && item.authorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const mathSymbols = ['π', '√', '²', '³', '∑', '∫', '±', '≠', '≤', '≥', '∞', 'α', 'β', 'γ', 'θ', 'λ', 'μ', 'σ', 'Δ', 'Ω', '€', '$', '₹', '£', '¥', '©', '®', '™'];

  // Current school label fallback
  const schoolLabel = currentSchool?.name || 'Campus Tracker';

  // ----------------------------------------------------
  // RENDER: ADD / EDIT VIEW (Matches Screenshot 1)
  // ----------------------------------------------------
  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <div ref={topRef} className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-16 transition-colors duration-200 ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto p-4 bg-white dark:bg-slate-900' : 'p-4 md:p-6 lg:p-8'}`}>
        {/* Top Breadcrumbs & Header Bar */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer" onClick={handleBackToList}>Dashboard</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer" onClick={handleBackToList}>News</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{viewMode === 'edit' ? 'Edit News' : 'Add News'}</span>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {viewMode === 'edit' ? 'Edit News' : 'Add News'}
            </h1>
            <button
              id="list-all-news-btn"
              onClick={handleBackToList}
              className="px-5 py-2 rounded-lg bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs md:text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            >
              List all News
            </button>
          </div>
        </div>

        {/* Main Editor Card Container */}
        <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Title Input */}
            <div className="mb-4">
              <input
                id="news-title-input"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Give a title to your news"
                className="w-full text-xl md:text-2xl lg:text-3xl font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent border-none outline-none focus:ring-0 px-0 py-1"
              />
            </div>

            {/* Subtitle Input */}
            <div className="mb-6">
              <input
                id="news-subtitle-input"
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Does it have a sub title?"
                className="w-full text-sm md:text-base text-slate-600 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent border-none outline-none focus:ring-0 px-0 py-1"
              />
            </div>

            {/* Meta Attributes Bar: Category, Status, Cover Image, Featured */}
            <div className="flex flex-wrap items-center gap-4 py-3 px-4 mb-6 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Category:</span>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  {formCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Featured News</span>
                </label>
              </div>

              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="Cover image URL (optional)..."
                  className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Rich Text Editor Component */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-slate-900">
              {/* Editor Toolbar (Matches Screenshot 1 icon layout) */}
              <div className="flex flex-wrap items-center gap-0.5 md:gap-1 p-2 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                {/* Bold */}
                <button
                  type="button"
                  title="Bold"
                  onClick={() => executeCommand('bold')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition font-bold"
                >
                  <Bold className="w-4 h-4" />
                </button>

                {/* Underline */}
                <button
                  type="button"
                  title="Underline"
                  onClick={() => executeCommand('underline')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition underline font-medium"
                >
                  <UnderlineIcon className="w-4 h-4" />
                </button>

                {/* Italic */}
                <button
                  type="button"
                  title="Italic"
                  onClick={() => executeCommand('italic')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition italic"
                >
                  <Italic className="w-4 h-4" />
                </button>

                <span className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                {/* Heading Options */}
                <button
                  type="button"
                  title="Heading 1"
                  onClick={() => handleFormatBlock('h1')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition font-bold flex items-center text-xs"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Heading 2"
                  onClick={() => handleFormatBlock('h2')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition font-bold flex items-center text-xs"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Heading 3"
                  onClick={() => handleFormatBlock('h3')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition font-bold flex items-center text-xs"
                >
                  <Heading3 className="w-4 h-4" />
                </button>

                {/* Strikethrough */}
                <button
                  type="button"
                  title="Strikethrough"
                  onClick={() => executeCommand('strikeThrough')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition line-through"
                >
                  <Strikethrough className="w-4 h-4" />
                </button>

                {/* Subscript */}
                <button
                  type="button"
                  title="Subscript"
                  onClick={() => executeCommand('subscript')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition font-semibold text-xs"
                >
                  x<sub>2</sub>
                </button>

                {/* Superscript */}
                <button
                  type="button"
                  title="Superscript"
                  onClick={() => executeCommand('superscript')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition font-semibold text-xs"
                >
                  x<sup>2</sup>
                </button>

                <span className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                {/* Quote */}
                <button
                  type="button"
                  title="Quote"
                  onClick={() => handleFormatBlock('blockquote')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                >
                  <Quote className="w-4 h-4" />
                </button>

                {/* Bullet List */}
                <button
                  type="button"
                  title="Bullet List"
                  onClick={() => executeCommand('insertUnorderedList')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                >
                  <List className="w-4 h-4" />
                </button>

                {/* Numbered List */}
                <button
                  type="button"
                  title="Numbered List"
                  onClick={() => executeCommand('insertOrderedList')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>

                {/* Code */}
                <button
                  type="button"
                  title="Code Block"
                  onClick={() => handleFormatBlock('pre')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                >
                  <Code className="w-4 h-4" />
                </button>

                <span className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                {/* Image Embed */}
                <button
                  type="button"
                  title="Insert Image"
                  onClick={() => setShowImageModal(true)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Link */}
                <button
                  type="button"
                  title="Insert Link"
                  onClick={() => setShowLinkModal(true)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>

                {/* Table */}
                <button
                  type="button"
                  title="Insert Table"
                  onClick={() => setShowTableModal(true)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                >
                  <TableIcon className="w-4 h-4" />
                </button>

                <span className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                {/* Undo */}
                <button
                  type="button"
                  title="Undo"
                  onClick={() => executeCommand('undo')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                >
                  <Undo2 className="w-4 h-4" />
                </button>

                {/* Redo */}
                <button
                  type="button"
                  title="Redo"
                  onClick={() => executeCommand('redo')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                >
                  <Redo2 className="w-4 h-4" />
                </button>

                {/* Math Symbol / Formula */}
                <button
                  type="button"
                  title="Special Symbol & Formula"
                  onClick={() => setShowFormulaModal(true)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition font-serif font-bold text-xs"
                >
                  ∑
                </button>

                <div className="ml-auto flex items-center gap-1">
                  {/* Preview Toggle */}
                  <button
                    type="button"
                    title={showLivePreview ? 'Edit mode' : 'Preview mode'}
                    onClick={() => setShowLivePreview(!showLivePreview)}
                    className={`p-1.5 rounded transition ${showLivePreview ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    {showLivePreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  {/* Fullscreen Toggle */}
                  <button
                    type="button"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Editor Writing Area or Live Preview */}
              <div ref={editorContainerRef} className="relative min-h-[380px] max-h-[600px] overflow-y-auto p-4 md:p-6 bg-white dark:bg-slate-900">
                {showLivePreview ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <h2 className="text-2xl font-bold">{formData.title || 'Untitled Article'}</h2>
                    {formData.subtitle && <p className="text-slate-500 text-base italic">{formData.subtitle}</p>}
                    <hr className="my-4 border-slate-200 dark:border-slate-800" />
                    <div
                      dangerouslySetInnerHTML={{
                        __html: editorRef.current?.innerHTML || formData.content || '<p class="text-slate-400">No content entered.</p>'
                      }}
                    />
                  </div>
                ) : (
                  <div
                    id="news-rich-editor"
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={() => {
                      if (editorRef.current) {
                        setFormData(prev => ({ ...prev, content: editorRef.current.innerHTML }));
                      }
                    }}
                    data-placeholder="Write your news content here"
                    className="outline-none min-h-[340px] text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:font-mono empty:before:text-xs md:empty:before:text-sm"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action Footer Bar (Matches Screenshot 1: Reset on left, Up/Down arrow pill in center, Save on right) */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
            {/* Left: Reset Button */}
            <button
              type="button"
              id="news-reset-btn"
              onClick={handleResetForm}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>

            {/* Center: Floating Scroll Up / Down Controls */}
            <div className="flex items-center bg-[#1e293b] text-white rounded-full p-1 shadow-md gap-1">
              <button
                type="button"
                title="Scroll to Top"
                onClick={scrollToTop}
                className="w-7 h-7 rounded-full hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Scroll to Bottom"
                onClick={scrollToBottom}
                className="w-7 h-7 rounded-full hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Save / Publish Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('Draft')}
                className="hidden sm:inline-flex px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
              >
                Save as Draft
              </button>
              <button
                type="button"
                id="news-save-btn"
                disabled={saving}
                onClick={() => handleSave('Published')}
                className="px-6 py-2 rounded-lg bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs md:text-sm font-semibold shadow-md transition-all duration-200 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Link Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-indigo-600" /> Insert Hyperlink
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">Display Text</label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="e.g. Read full report"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">Destination URL *</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertLink}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" /> Insert Image
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">Image URL *</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">Caption / Alt Text</label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="e.g. Annual Sports Meet 2026"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertImage}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  Insert Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table Modal */}
        {showTableModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-indigo-600" /> Insert Grid Table
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={tableRows}
                    onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertTable}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  Insert Table
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Special Math Formula Modal */}
        {showFormulaModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> Insert Special Symbol
                </h3>
                <button onClick={() => setShowFormulaModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                {mathSymbols.map((sym, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertSymbol(sym)}
                    className="h-9 rounded-md bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 border border-slate-200 dark:border-slate-600 font-mono text-base font-medium flex items-center justify-center transition cursor-pointer"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: LIST VIEW (Matches Screenshot 2)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 md:p-6 lg:p-8 transition-colors duration-200">
      {/* Top Breadcrumbs & Header Bar */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">Dashboard</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-semibold">News</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            News
          </h1>

          {/* Right Action Icons (Matches Screenshot 2: Add News, Filter, Settings, Columns, 3-dots) */}
          <div className="flex items-center space-x-2 relative">
            <button
              id="add-news-top-btn"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-lg bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs md:text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            >
              Add News
            </button>

            {/* Filter Toggle Button */}
            <button
              id="filter-news-btn"
              title="Filter"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer ${showFilterDropdown ? 'border-indigo-500 text-indigo-600' : 'border-slate-200 dark:border-slate-800'}`}
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Settings Button */}
            <button
              id="settings-news-btn"
              title="Settings"
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* Layout Mode Button (Columns / Grid Toggle) */}
            <button
              id="layout-toggle-btn"
              title={layoutMode === 'table' ? 'Switch to Grid View' : 'Switch to Table View'}
              onClick={() => setLayoutMode(layoutMode === 'table' ? 'grid' : 'table')}
              className={`p-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer ${layoutMode === 'grid' ? 'border-indigo-500 text-indigo-600' : 'border-slate-200 dark:border-slate-800'}`}
            >
              <Columns className="w-4 h-4" />
            </button>

            {/* More Menu Toggle */}
            <button
              id="more-options-btn"
              title="More Actions"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Filter Dropdown Popover */}
            {showFilterDropdown && (
              <div className="absolute right-0 top-12 z-30 w-72 p-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Filters</span>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedStatus('All');
                      setSearchTerm('');
                    }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Reset All
                  </button>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>
            )}

            {/* More Options Popover */}
            {showMoreMenu && (
              <div className="absolute right-0 top-12 z-30 w-48 py-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => {
                    fetchNews();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Refresh Data
                </button>
                {selectedIds.length > 0 && (
                  <button
                    onClick={() => {
                      handleBulkDelete();
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-16 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading news articles...</p>
          </div>
        ) : newsList.length === 0 ? (
          /* Empty State (Matches Screenshot 2) */
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 md:p-20 flex flex-col items-center justify-center text-center">
            {/* Center Icon */}
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-6 shadow-xs">
              <div className="space-y-1.5 flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600 dark:bg-slate-300" />
                  <div className="w-6 h-1.5 rounded-full bg-slate-600 dark:bg-slate-300" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600 dark:bg-slate-300" />
                  <div className="w-6 h-1.5 rounded-full bg-slate-600 dark:bg-slate-300" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600 dark:bg-slate-300" />
                  <div className="w-6 h-1.5 rounded-full bg-slate-600 dark:bg-slate-300" />
                </div>
              </div>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Manage all News
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
              Love to write? Let's write your first news and share it with the world.
            </p>

            {/* Add News Button */}
            <button
              id="empty-add-news-btn"
              onClick={handleOpenAdd}
              className="px-6 py-2.5 rounded-lg bg-[#1e293b] hover:bg-[#0f172a] text-white text-sm font-semibold shadow-md transition-all duration-200 cursor-pointer"
            >
              Add News
            </button>
          </div>
        ) : (
          /* Populated State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Search & Filter Header Bar */}
            <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search news by title, subtitle, author, tags..."
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {categories.slice(0, 5).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${selectedCategory === cat ? 'bg-[#1e293b] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Table or Grid View */}
            {filteredNews.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No news articles match your active search filters.
              </div>
            ) : layoutMode === 'table' ? (
              /* Table Layout */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredNews.length && filteredNews.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="py-3.5 px-4">Article</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Author</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Views</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredNews.map(article => (
                      <tr
                        key={article._id}
                        onClick={() => handleReadArticle(article)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer group"
                      >
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(article._id)}
                            onChange={() => handleToggleSelect(article._id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition text-sm flex items-center gap-1.5">
                            {article.isFeatured && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                Featured
                              </span>
                            )}
                            <span>{article.title}</span>
                          </div>
                          {article.subtitle && (
                            <div className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-md">
                              {article.subtitle}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {article.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {article.authorName || 'Admin'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(article.publishedAt || article.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {article.views || 0}
                        </td>
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(article._id, e)}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition ${article.status === 'Published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'}`}
                          >
                            {article.status || 'Published'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Read"
                              onClick={() => handleReadArticle(article)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Edit"
                              onClick={() => handleOpenEdit(article)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Delete"
                              onClick={(e) => handleDelete(article._id, e)}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid Layout */
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map(article => (
                  <div
                    key={article._id}
                    onClick={() => handleReadArticle(article)}
                    className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col group"
                  >
                    {article.coverImage && (
                      <div className="h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {article.category || 'General'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${article.status === 'Published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                            {article.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 transition mb-1 line-clamp-2">
                          {article.title}
                        </h3>
                        {article.subtitle && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                            {article.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(article)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(article._id, e)}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/40 rounded text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Brand (Matches Screenshot 2 footer "Campus Tracker") */}
        <div className="text-center mt-12 text-xs font-medium text-slate-400 dark:text-slate-500">
          {schoolLabel}
        </div>
      </div>

      {/* Reader Modal (Full Article View) */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 relative">
            <button
              onClick={() => setReadingArticle(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {readingArticle.coverImage && (
              <img
                src={readingArticle.coverImage}
                alt={readingArticle.title}
                className="w-full h-64 object-cover rounded-xl mb-6 shadow-sm"
              />
            )}

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                {readingArticle.category || 'General'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(readingArticle.publishedAt || readingArticle.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {readingArticle.authorName || 'School Administration'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {readingArticle.views || 1} views
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight mb-2">
              {readingArticle.title}
            </h1>

            {readingArticle.subtitle && (
              <p className="text-base text-slate-600 dark:text-slate-300 font-medium italic mb-6">
                {readingArticle.subtitle}
              </p>
            )}

            <hr className="my-5 border-slate-100 dark:border-slate-800" />

            {/* Rich HTML Content */}
            <div
              className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: readingArticle.content }}
            />

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" /> Print Article
              </button>
              <button
                type="button"
                onClick={() => {
                  setReadingArticle(null);
                  handleOpenEdit(readingArticle);
                }}
                className="px-5 py-2 rounded-lg bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-semibold transition shadow-sm flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" /> Edit Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-indigo-600" /> News Settings
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">Default Display Layout</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLayoutMode('table')}
                    className={`p-2.5 rounded-lg border text-center font-medium transition ${layoutMode === 'table' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600' : 'border-slate-200 dark:border-slate-700'}`}
                  >
                    Table View
                  </button>
                  <button
                    onClick={() => setLayoutMode('grid')}
                    className={`p-2.5 rounded-lg border text-center font-medium transition ${layoutMode === 'grid' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600' : 'border-slate-200 dark:border-slate-700'}`}
                  >
                    Card Grid View
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-slate-500 leading-relaxed">
                  News modules allow administrators and teachers to broadcast campus announcements, achievements, press releases, and editorial articles with full rich text formatting.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-lg bg-[#1e293b] text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
