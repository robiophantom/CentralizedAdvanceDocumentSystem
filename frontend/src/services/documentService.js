const mockDocuments = [
  {
    id: 1,
    title: 'Project Proposal 2025',
    description: 'Comprehensive project proposal for the upcoming fiscal year',
    tags: ['proposal', 'pbl', '2025'],
    createdDate: '2024-10-01',
    owner: 'John Doe',
    fileType: 'PDF',
    versions: 3,
    snippet: 'This document outlines the strategic initiatives...',
  },
  {
  id: 2,
  title: 'AI Assignment - Search Algorithms',
  description: 'Detailed explanation and implementation of BFS, DFS, and A* algorithms.',
  tags: ['ai', 'assignment', 'search'],
  createdDate: '2025-04-10',
  owner: 'Neha Gupta',
  fileType: 'PDF',
  versions: 1,
  snippet: 'In this assignment, we explore uninformed and informed search strategies...',
},
  {
    id: 3,
    title: 'Time Table Sem 5',
    description: 'Updated Time Table for Fifth Semester',
    tags: ['timetable', 'sem5', 'tt'],
    createdDate: '2024-09-20',
    owner: 'Mike Johnson',
    fileType: 'PDF',
    versions: 2,
    snippet: 'Updated time table after clash resolution...',
  },
  {
  id: 4,
  title: 'Data Structures Notes',
  description: 'Comprehensive notes on stacks, queues, trees, and graphs.',
  tags: ['cs', 'notes', 'semester3'],
  createdDate: '2025-01-12',
  owner: 'Keshav Sharma',
  fileType: 'PDF',
  versions: 3,
  snippet: 'Stacks and queues are fundamental linear data structures used in...',
},
{
  id: 5,
  title: 'DBMS Mini Project Report',
  description: 'Report for the “Library Management System” mini project.',
  tags: ['dbms', 'project', 'report'],
  createdDate: '2025-03-28',
  owner: 'Ananya Singh',
  fileType: 'DOCX',
  versions: 2,
  snippet: 'This project aims to simplify book tracking and student record management...',
},
{
  id: 6,
  title: 'Operating Systems Lab Manual',
  description: 'Lab exercises and solutions for process scheduling, memory management, etc.',
  tags: ['os', 'lab', 'manual'],
  createdDate: '2025-02-18',
  owner: 'Rohit Verma',
  fileType: 'PDF',
  versions: 1,
  snippet: 'This manual covers core lab experiments such as FCFS, SJF, and Round Robin...',
},

];

const mockVersions = [
  { version: 3, date: '2024-10-01', modifiedBy: 'John Doe' },
  { version: 2, date: '2024-09-25', modifiedBy: 'John Doe' },
  { version: 1, date: '2024-09-20', modifiedBy: 'Jane Smith' },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getDocuments = async () => {
  await delay(500);
  return mockDocuments;
};

export const searchDocuments = async (query) => {
  await delay(300);
  if (!query) return mockDocuments;

  const lowerQuery = query.toLowerCase();
  return mockDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.description.toLowerCase().includes(lowerQuery) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};

export const uploadDocument = async (formData) => {
  await delay(800);
  const newDoc = {
    id: mockDocuments.length + 1,
    ...formData,
    createdDate: new Date().toISOString().split('T')[0],
    owner: 'Current User',
    versions: 1,
  };
  return newDoc;
};

export const getDocumentById = async (id) => {
  await delay(400);
  return mockDocuments.find((doc) => doc.id === parseInt(id));
};

export const getVersions = async (id) => {
  await delay(300);
  return mockVersions;
};
