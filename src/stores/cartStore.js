import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const productId = product.id || product.slug;
        const existingItem = items.find(item => item.product?.id === productId);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.product?.id === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          set({
            items: [...items, { 
              id: Date.now().toString(),
              product: {
                id: productId,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || product.image,
                images: product.images || [product.image]
              },
              quantity,
              price: product.price
            }]
          });
        }
      },
      
      removeItem: (itemId) => {
        set({
          items: get().items.filter(item => item.id !== itemId)
        });
      },
      
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.discountPrice || item.product.price;
          return total + (parseFloat(price) * item.quantity);
        }, 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);