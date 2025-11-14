const mockActivities = [
  {
    id: 1,
    user: { name: 'John Doe', initials: 'JD' },
    action: 'uploaded a new document: Financial Report Q2.pdf',
    timestamp: '2 hours ago',
  },
  {
    id: 2,
    user: { name: 'Jane Smith', initials: 'JS' },
    action: 'updated the document: Marketing Plan.docx',
    timestamp: '5 hours ago',
  },
  {
    id: 3,
    user: { name: 'Admin', initials: 'A' },
    action: 'deleted a document: Old_Logos.zip',
    timestamp: '1 day ago',
  },
];

export const getRecentActivity = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockActivities);
    }, 500);
  });
};
