/**
 * Skeleton Loader Component
 * Provides loading placeholders for various content types
 */

export const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variants = {
    rectangular: 'w-full h-4',
    circular: 'rounded-full',
    text: 'w-full h-4',
    card: 'w-full h-48',
    avatar: 'w-12 h-12 rounded-full',
  };
  
  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}></div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="w-16 h-4" />
      </div>
      <Skeleton className="w-3/4 h-6 mb-2" />
      <Skeleton className="w-full h-4 mb-2" />
      <Skeleton className="w-2/3 h-4 mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
    </div>
  );
};

export const SkeletonActivity = () => {
  return (
    <div className="flex items-center space-x-3 animate-pulse">
      <Skeleton variant="avatar" className="w-10 h-10" />
      <div className="flex-1">
        <Skeleton className="w-3/4 h-4 mb-2" />
        <Skeleton className="w-1/2 h-3" />
      </div>
    </div>
  );
};

export default Skeleton;

