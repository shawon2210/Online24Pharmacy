import useMeta from "../../hooks/useMeta";

export default function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  product,
}) {
  const siteTitle = "Online24 Pharmacy - Medicine Delivery in Dhaka";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const siteUrl = "https://online24pharmacy.com";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

  const structuredData = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        brand: product.brand,
        sku: product.sku,
        image: product.images,
        offers: {
          "@type": "Offer",
          price: product.discountPrice || product.price,
          priceCurrency: "BDT",
          availability:
            product.stockQuantity > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "Online24 Pharmacy",
          },
        },
      }
    : {
        "@context": "https://schema.org",
        "@type": "Pharmacy",
        name: "Online24 Pharmacy",
        description: "24/7 online pharmacy service in Dhaka",
        url: siteUrl,
        telephone: "+88017XXXXXXXX",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dhaka",
          addressCountry: "BD",
        },
      };

  useMeta({
    title: fullTitle,
    description,
    keywords,
    image,
    url: fullUrl,
    type,
    structuredData,
  });

  return null;
}
