import { useEffect, useRef, useState, memo } from "react";
import ProductCard from "./ProductCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const ProductCarousel = memo(({ products = [] }) => {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanPrev(scrollLeft > 0);
      setCanNext(scrollLeft + clientWidth < scrollWidth - 1);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [products]);

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (!products?.length) return null;

  return (
    <div className="relative w-full">
      <div ref={trackRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 py-2">
        {products.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-48 sm:w-56 md:w-64">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      {canPrev && (
        <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-emerald-600 hover:bg-emerald-700 text-background rounded-full p-3 shadow-lg transition-all">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      )}
      {canNext && (
        <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-emerald-600 hover:bg-emerald-700 text-background rounded-full p-3 shadow-lg transition-all">
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
});

ProductCarousel.displayName = "ProductCarousel";
export default ProductCarousel;
