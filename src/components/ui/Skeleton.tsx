import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl ${className}`} />
  );
};

export const QuestionSkeleton: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-5 max-w-3xl mx-auto pt-6">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <Skeleton className="h-20 w-full mb-6" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
};
