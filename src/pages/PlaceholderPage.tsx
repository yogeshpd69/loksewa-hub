import React from 'react';

interface Props {
  title: string;
}

export const PlaceholderPage: React.FC<Props> = ({ title }) => {
  return (
    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">
        This is a placeholder page for {title}. The actual content will be implemented later.
      </p>
    </div>
  );
};
