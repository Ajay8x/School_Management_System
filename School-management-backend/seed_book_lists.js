const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const BookList = require('./models/BookList');

dotenv.config();

const seedBookListsNow = async () => {
  try {
    await connectDB();

    const count = await BookList.countDocuments();
    if (count > 0) {
      console.log(`BookLists already exist (count: ${count}). Clearing and re-seeding for full exact match...`);
      await BookList.deleteMany({});
    }

    const bookListData = [
      { type: 'Textbook', course: 'Nursery (NUR)', subject: 'English', title: 'MY FIRST STRIDE - A (RHYMES)', publisher: 'UNITED PUBLICATION', createdAt: new Date('2025-02-08T00:53:00.000Z') },
      { type: 'Textbook', course: 'Nursery (NUR)', subject: 'HINDI', title: 'BOUNCY BEARS - 1', publisher: 'EDUTREE PUBLISHERS', createdAt: new Date('2025-02-08T00:54:00.000Z') },
      { type: 'Textbook', course: 'Nursery (NUR)', subject: 'HINDI', title: 'AAO GUNGUNAYE - A (RHYMES)', publisher: 'FIREFLY BOOKS', createdAt: new Date('2025-02-08T00:54:00.000Z') },
      { type: 'Textbook', course: 'Nursery (NUR)', subject: 'MATHS', title: 'ZOOM NUMERACY PRESCHOOL-1', publisher: 'EUPHEUS LEARNING', createdAt: new Date('2025-02-08T00:55:00.000Z') },
      { type: 'Textbook', course: 'Nursery (NUR)', subject: 'MATHS', title: 'PRE WRITING BOOK', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-08T00:56:00.000Z') },
      { type: 'Textbook', course: 'Nursery (NUR)', subject: 'EVS', title: 'VISTA WORD BOOK', publisher: 'VISTA EDUCATIONAL BOOKS', createdAt: new Date('2025-02-08T00:56:00.000Z') },
      { type: 'Textbook', course: 'Nursery (NUR)', subject: 'ARTS and CRAFTS', title: 'ART FILE', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-08T00:57:00.000Z') },
      { type: 'Textbook', course: 'Nursery (NUR)', subject: 'English', title: 'ZOOM THE ALPHABET - PRESCHOOL - 1', publisher: 'EUPHEUS LEARNING', createdAt: new Date('2025-02-08T00:52:00.000Z') },
      { type: 'Textbook', course: 'LKG (LKG)', subject: 'HINDI', title: 'HINDI', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:18:00.000Z') },
      { type: 'Textbook', course: 'LKG (LKG)', subject: 'English', title: 'English', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:19:00.000Z') },
      { type: 'Textbook', course: 'LKG (LKG)', subject: 'ARTS and CRAFTS', title: 'Art Life', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:19:00.000Z') },
      { type: 'Textbook', course: 'UKG (UKG)', subject: 'MUSIC', title: 'Music', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:20:00.000Z') },
      { type: 'Textbook', course: 'UKG (UKG)', subject: 'HINDI', title: 'Hindi', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:21:00.000Z') },
      { type: 'Textbook', course: 'UKG (UKG)', subject: 'English', title: 'English', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:21:00.000Z') },
      { type: 'Textbook', course: 'UKG (UKG)', subject: 'ARTS and CRAFTS', title: 'Art Life', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:20:00.000Z') },
      { type: 'Textbook', course: 'I (I)', subject: 'General Knowledge', title: 'General Knowledge', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:22:00.000Z') },
      { type: 'Textbook', course: 'I (I)', subject: 'Environment Science', title: 'Environment Science', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:22:00.000Z') },
      { type: 'Textbook', course: 'I (I)', subject: 'Basic Mathematics', title: 'Basic Mathematics', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:22:00.000Z') },
      { type: 'Textbook', course: 'I (I)', subject: 'HINDI', title: 'Hindi', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:22:00.000Z') },
      { type: 'Textbook', course: 'II (II)', subject: 'Social Science', title: 'Social Science', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:25:00.000Z') },
      { type: 'Textbook', course: 'II (II)', subject: 'General Knowledge', title: 'General Knowledge', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:26:00.000Z') },
      { type: 'Textbook', course: 'II (II)', subject: 'Basic Mathematics', title: 'Basic Mathematics', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:25:00.000Z') },
      { type: 'Textbook', course: 'II (II)', subject: 'Art and Craft', title: 'Art and Craft', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:25:00.000Z') },
      { type: 'Textbook', course: 'III (III)', subject: 'Social Science', title: 'Social Science', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:29:00.000Z') },
      { type: 'Textbook', course: 'III (III)', subject: 'Conclusion', title: 'Conclusion', publisher: 'PROVIDED IN THE SCHOOL', createdAt: new Date('2025-02-11T10:28:00.000Z') }
    ];

    for (let item of bookListData) {
      await BookList.create(item);
    }

    console.log(`Seeded ${bookListData.length} Book List items successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedBookListsNow();
