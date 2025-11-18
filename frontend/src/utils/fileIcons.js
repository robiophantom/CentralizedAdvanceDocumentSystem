/**
 * File Icon Utility
 * Returns appropriate icon component for file types
 */

import { 
  FaFilePdf, 
  FaFileWord, 
  FaFileExcel, 
  FaFilePowerpoint, 
  FaFileImage, 
  FaFileAlt,
  FaFileArchive,
  FaFileCode,
  FaFileVideo,
  FaFileAudio
} from 'react-icons/fa';

/**
 * Get icon component for file type
 * @param {string} fileType - File extension or type
 * @returns {React.Component} Icon component
 */
export const getFileIcon = (fileType) => {
  if (!fileType) return FaFileAlt;
  
  const type = fileType.toLowerCase();
  
  // PDF
  if (type === 'pdf') return FaFilePdf;
  
  // Word documents
  if (['doc', 'docx', 'rtf'].includes(type)) return FaFileWord;
  
  // Excel
  if (['xls', 'xlsx', 'csv'].includes(type)) return FaFileExcel;
  
  // PowerPoint
  if (['ppt', 'pptx'].includes(type)) return FaFilePowerpoint;
  
  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(type)) return FaFileImage;
  
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) return FaFileArchive;
  
  // Code files
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c'].includes(type)) return FaFileCode;
  
  // Video
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(type)) return FaFileVideo;
  
  // Audio
  if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(type)) return FaFileAudio;
  
  // Default
  return FaFileAlt;
};

/**
 * Get color class for file type
 * @param {string} fileType - File extension or type
 * @returns {string} Tailwind color class
 */
export const getFileIconColor = (fileType) => {
  if (!fileType) return 'text-gray-500';
  
  const type = fileType.toLowerCase();
  
  // PDF - Red
  if (type === 'pdf') return 'text-red-600';
  
  // Word - Blue
  if (['doc', 'docx', 'rtf'].includes(type)) return 'text-blue-600';
  
  // Excel - Green
  if (['xls', 'xlsx', 'csv'].includes(type)) return 'text-green-600';
  
  // PowerPoint - Orange
  if (['ppt', 'pptx'].includes(type)) return 'text-orange-600';
  
  // Images - Purple
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(type)) return 'text-purple-600';
  
  // Archives - Yellow
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) return 'text-yellow-600';
  
  // Code - Indigo
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c'].includes(type)) return 'text-indigo-600';
  
  // Video - Pink
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(type)) return 'text-pink-600';
  
  // Audio - Teal
  if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(type)) return 'text-teal-600';
  
  // Default - Gray
  return 'text-gray-500';
};

/**
 * Get background color class for file type
 * @param {string} fileType - File extension or type
 * @returns {string} Tailwind background color class
 */
export const getFileIconBg = (fileType) => {
  if (!fileType) return 'bg-gray-100';
  
  const type = fileType.toLowerCase();
  
  // PDF - Red
  if (type === 'pdf') return 'bg-red-100';
  
  // Word - Blue
  if (['doc', 'docx', 'rtf'].includes(type)) return 'bg-blue-100';
  
  // Excel - Green
  if (['xls', 'xlsx', 'csv'].includes(type)) return 'bg-green-100';
  
  // PowerPoint - Orange
  if (['ppt', 'pptx'].includes(type)) return 'bg-orange-100';
  
  // Images - Purple
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(type)) return 'bg-purple-100';
  
  // Archives - Yellow
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) return 'bg-yellow-100';
  
  // Code - Indigo
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c'].includes(type)) return 'bg-indigo-100';
  
  // Video - Pink
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(type)) return 'bg-pink-100';
  
  // Audio - Teal
  if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(type)) return 'bg-teal-100';
  
  // Default - Gray
  return 'bg-gray-100';
};

