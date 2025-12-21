import * as Lucide from "lucide-react";
import clsx from "clsx";

/**
 * Generic Icon component backed by lucide-react icons.
 * Usage: <Icon name="ShoppingCart" size={20} className="text-gray-600" />
 */
const Icon = ({ name, size = 20, className = "", title, ...props }) => {
  const Component = Lucide[name];
  if (!Component) return null;
  return (
    <Component
      size={size}
      className={clsx("inline-block align-middle", className)}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...props}
    />
  );
};

export default Icon;
