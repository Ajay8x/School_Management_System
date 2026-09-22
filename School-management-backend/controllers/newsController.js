const News = require('../models/News');
const School = require('../models/School');
const { logActivity } = require('../utils/logActivity');

// Helper to get active school ID
const getActiveSchoolId = async (req) => {
  if (req.schoolId) return req.schoolId;
  if (req.user && req.user.schoolId) return req.user.schoolId;
  const defaultSchool = await School.findOne({ isDefault: true }) || await School.findOne();
  return defaultSchool ? defaultSchool._id : null;
};

// @desc    Get all news articles strictly scoped to active school
// @route   GET /api/news
// @access  Private
exports.getNews = async (req, res) => {
  try {
    const { search, category, status, sortBy, limit } = req.query;
    const activeSchoolId = req.schoolId || (req.user && req.user.schoolId);

    let filter = {};
    if (activeSchoolId) {
      filter.schoolId = activeSchoolId;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchFilter = {
        $or: [
          { title: searchRegex },
          { subtitle: searchRegex },
          { content: searchRegex },
          { authorName: searchRegex },
          { category: searchRegex }
        ]
      };

      if (Object.keys(filter).length > 0) {
        filter = {
          $and: [
            filter,
            searchFilter
          ]
        };
      } else {
        filter = searchFilter;
      }
    }

    let query = News.find(filter);

    // Sorting
    if (sortBy === 'views') {
      query = query.sort({ views: -1, createdAt: -1 });
    } else if (sortBy === 'title') {
      query = query.sort({ title: 1 });
    } else {
      query = query.sort({ publishedAt: -1, createdAt: -1 });
    }

    if (limit && !isNaN(Number(limit))) {
      query = query.limit(Number(limit));
    }

    const newsList = await query.exec();
    res.json(newsList);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Server Error fetching news', error: error.message });
  }
};

// @desc    Get single news article by ID
// @route   GET /api/news/:id
// @access  Private
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    );

    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    res.json(news);
  } catch (error) {
    console.error('Error fetching single news:', error);
    res.status(500).json({ message: 'Server Error fetching news article' });
  }
};

// @desc    Create new news article strictly assigned to active school
// @route   POST /api/news
// @access  Private
exports.createNews = async (req, res) => {
  try {
    const { title, subtitle, content, category, coverImage, status, isFeatured } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Please provide a title for the news article' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Please provide content for the news article' });
    }

    const schoolId = await getActiveSchoolId(req);

    const newsData = {
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      content: content.trim(),
      category: category || 'General',
      coverImage: coverImage || '',
      status: status || 'Published',
      isFeatured: Boolean(isFeatured),
      author: req.user?._id || req.user?.id,
      authorName: req.user?.name || req.user?.username || 'School Administration',
      publishedAt: status === 'Draft' ? null : (req.body.publishedAt || new Date()),
      schoolId: schoolId
    };

    if (req.headers && req.headers['x-session-id']) {
      newsData.sessionId = req.headers['x-session-id'];
    }

    const news = await News.create(newsData);

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Created news article: "${news.title}"`
      });
    }

    res.status(201).json(news);
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(400).json({ message: error.message || 'Failed to create news article' });
  }
};

// @desc    Update existing news article
// @route   PUT /api/news/:id
// @access  Private
exports.updateNews = async (req, res) => {
  try {
    const { title, subtitle, content, category, coverImage, status, isFeatured, publishedAt } = req.body;

    const existingNews = await News.findById(req.params.id);
    if (!existingNews) {
      return res.status(404).json({ message: 'News article not found' });
    }

    const updateFields = {
      ...(title !== undefined && { title: title.trim() }),
      ...(subtitle !== undefined && { subtitle: subtitle ? subtitle.trim() : '' }),
      ...(content !== undefined && { content: content.trim() }),
      ...(category !== undefined && { category }),
      ...(coverImage !== undefined && { coverImage }),
      ...(status !== undefined && { status }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(publishedAt !== undefined && { publishedAt })
    };

    if (status === 'Published' && !existingNews.publishedAt) {
      updateFields.publishedAt = new Date();
    }

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { returnDocument: 'after', runValidators: true }
    );

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Updated news article: "${updatedNews.title}"`
      });
    }

    res.json(updatedNews);
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(400).json({ message: error.message || 'Failed to update news article' });
  }
};

// @desc    Delete news article
// @route   DELETE /api/news/:id
// @access  Private
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    await news.deleteOne();

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Deleted news article: "${news.title}"`
      });
    }

    res.json({ message: 'News article removed successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ message: 'Server Error deleting news article' });
  }
};

// @desc    Bulk delete news articles
// @route   POST /api/news/bulk-delete
// @access  Private
exports.bulkDeleteNews = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of IDs to delete' });
    }

    await News.deleteMany({ _id: { $in: ids } });

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Bulk deleted ${ids.length} news articles`
      });
    }

    res.json({ message: `Successfully deleted ${ids.length} news articles` });
  } catch (error) {
    console.error('Error bulk deleting news:', error);
    res.status(500).json({ message: 'Server Error in bulk deletion' });
  }
};

// @desc    Toggle news status (Draft <-> Published)
// @route   PATCH /api/news/:id/status
// @access  Private
exports.toggleNewsStatus = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    const nextStatus = news.status === 'Published' ? 'Draft' : 'Published';
    news.status = nextStatus;
    if (nextStatus === 'Published' && !news.publishedAt) {
      news.publishedAt = new Date();
    }
    await news.save();

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Toggled status of news article "${news.title}" to ${nextStatus}`
      });
    }

    res.json(news);
  } catch (error) {
    console.error('Error toggling news status:', error);
    res.status(500).json({ message: 'Server Error updating news status' });
  }
};
