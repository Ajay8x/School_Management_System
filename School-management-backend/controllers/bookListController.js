const BookList = require('../models/BookList');

// Get all book lists
exports.getBookLists = async (req, res) => {
  try {
    const query = {};
    if (req.schoolId) {
      query.$or = [
        { school: req.schoolId },
        { school: null },
        { school: { $exists: false } }
      ];
    }
    const bookLists = await BookList.find(query).sort({ createdAt: -1 });
    res.status(200).json(bookLists);
  } catch (error) {
    console.error('Error fetching book lists:', error);
    res.status(500).json({ message: 'Error fetching book lists', error: error.message });
  }
};

// Get single book list by ID
exports.getBookListById = async (req, res) => {
  try {
    const bookList = await BookList.findById(req.params.id);
    if (!bookList) {
      return res.status(404).json({ message: 'Book list record not found' });
    }
    res.status(200).json(bookList);
  } catch (error) {
    console.error('Error fetching book list:', error);
    res.status(500).json({ message: 'Error fetching book list', error: error.message });
  }
};

// Create book list
exports.createBookList = async (req, res) => {
  try {
    const { type, course, subject, title, author, publisher, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!course || !course.trim()) {
      return res.status(400).json({ message: 'Course is required' });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: 'Subject is required' });
    }

    const newBookList = new BookList({
      school: req.schoolId || null,
      type: type || 'Textbook',
      course: course.trim(),
      subject: subject.trim(),
      title: title.trim(),
      author: author ? author.trim() : '',
      publisher: publisher ? publisher.trim() : 'PROVIDED IN THE SCHOOL',
      description: description || ''
    });

    const saved = await newBookList.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating book list:', error);
    res.status(500).json({ message: 'Error creating book list', error: error.message });
  }
};

// Update book list
exports.updateBookList = async (req, res) => {
  try {
    const { type, course, subject, title, author, publisher, description, status } = req.body;

    const bookList = await BookList.findById(req.params.id);
    if (!bookList) {
      return res.status(404).json({ message: 'Book list record not found' });
    }

    if (type !== undefined) bookList.type = type;
    if (course !== undefined) bookList.course = course.trim();
    if (subject !== undefined) bookList.subject = subject.trim();
    if (title !== undefined) bookList.title = title.trim();
    if (author !== undefined) bookList.author = author.trim();
    if (publisher !== undefined) bookList.publisher = publisher.trim();
    if (description !== undefined) bookList.description = description;
    if (status !== undefined) bookList.status = status;

    const updated = await bookList.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating book list:', error);
    res.status(500).json({ message: 'Error updating book list', error: error.message });
  }
};

// Delete book list
exports.deleteBookList = async (req, res) => {
  try {
    const bookList = await BookList.findByIdAndDelete(req.params.id);
    if (!bookList) {
      return res.status(404).json({ message: 'Book list record not found' });
    }
    res.status(200).json({ message: 'Book list deleted successfully' });
  } catch (error) {
    console.error('Error deleting book list:', error);
    res.status(500).json({ message: 'Error deleting book list', error: error.message });
  }
};

// Bulk Import book lists
exports.importBookLists = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for import' });
    }

    const docs = items.map(item => ({
      school: req.schoolId || null,
      type: item.type || 'Textbook',
      course: item.course ? item.course.trim() : 'Nursery (NUR)',
      subject: item.subject ? item.subject.trim() : 'General',
      title: item.title ? item.title.trim() : 'Untitled Book',
      author: item.author ? item.author.trim() : '',
      publisher: item.publisher ? item.publisher.trim() : 'PROVIDED IN THE SCHOOL',
      description: item.description || ''
    }));

    const inserted = await BookList.insertMany(docs);
    res.status(201).json({ message: `Successfully imported ${inserted.length} book records`, count: inserted.length });
  } catch (error) {
    console.error('Error importing book lists:', error);
    res.status(500).json({ message: 'Error importing book lists', error: error.message });
  }
};
