import React from 'react';
import PropTypes from 'prop-types';

/**
 * A responsive container that enforces site-wide width and padding conventions.
 * - Mobile: Full width with horizontal padding.
 * - Tablet & up: Centered with a max-width that grows with the viewport.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child elements to be rendered inside the container.
 * @param {string} [props.className=''] - Additional CSS classes to apply to the container.
 */
const Container = ({ children, className = '' }) => {
  return (
    <div
      className={`w-full mx-auto p-3 sm:p-4 md:p-5 lg:p-6 2xl:p-7 3xl:p-8 md:max-w-4xl lg:max-w-6xl xl:max-w-7xl ${className}`}
    >
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Container;