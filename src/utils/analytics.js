// Google Analytics 4
export const gtag = (...args) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

// Track page views
export const trackPageView = (url, title) => {
  gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
    page_title: title,
    page_location: url,
  });
};

// Track events
export const trackEvent = (action, category, label, value) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// E-commerce tracking
export const trackPurchase = (transactionId, items, value) => {
  gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: 'BDT',
    items: items.map(item => ({
      item_id: item.product.sku,
      item_name: item.product.name,
      category: item.product.category.name,
      quantity: item.quantity,
      price: item.unitPrice
    }))
  });
};

export const trackAddToCart = (product, quantity) => {
  gtag('event', 'add_to_cart', {
    currency: 'BDT',
    value: (product.discountPrice || product.price) * quantity,
    items: [{
      item_id: product.sku,
      item_name: product.name,
      category: product.category?.name,
      quantity: quantity,
      price: product.discountPrice || product.price
    }]
  });
};

export const trackSearch = (searchTerm, results) => {
  gtag('event', 'search', {
    search_term: searchTerm,
    results_count: results
  });
};

// Custom events
export const trackPrescriptionUpload = () => {
  trackEvent('prescription_upload', 'engagement', 'prescription_system');
};

export const trackPaymentMethod = (method) => {
  trackEvent('payment_method_selected', 'checkout', method);
};