import { Suspense } from 'react';
import { useInView } from 'react-intersection-observer';

const LazyLoad = ({ children, fallback, rootMargin = '200px' }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin,
    threshold: 0,
  });

  return (
    <div ref={ref}>
      {inView ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
};

export default LazyLoad;
