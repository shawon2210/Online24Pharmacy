export const themeClasses = {
  // Background colors
  bg: {
    primary: 'bg-white dark:bg-slate-900',
    secondary: 'bg-gray-50 dark:bg-slate-800',
    tertiary: 'bg-gray-100 dark:bg-slate-700',
    card: 'bg-white dark:bg-slate-800',
    input: 'bg-white dark:bg-slate-700',
  },
  
  // Text colors
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-300',
    tertiary: 'text-gray-500 dark:text-gray-400',
    muted: 'text-gray-400 dark:text-gray-500',
  },
  
  // Border colors
  border: {
    primary: 'border-gray-200 dark:border-slate-700',
    secondary: 'border-gray-300 dark:border-slate-600',
    light: 'border-gray-100 dark:border-slate-800',
  },
  
  // Hover states
  hover: {
    bg: 'hover:bg-gray-50 dark:hover:bg-slate-700',
    text: 'hover:text-gray-700 dark:hover:text-gray-200',
  },
  
  // Cards and containers
  card: 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg',
  input: 'bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
  button: 'transition-colors duration-300',
};

export const getThemeClass = (isDark, lightClass, darkClass) => {
  return isDark ? darkClass : lightClass;
};

export const combineThemeClasses = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
