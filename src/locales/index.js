/**
 * Centralized translation loader
 * Imports all translation files and combines them
 */

// English translations
import enCommon from './en/common.json';
import enHome from './en/home.json';
import enAuth from './en/auth.json';
import enCart from './en/cart.json';
import enProducts from './en/products.json';

// Bengali translations
import bnCommon from './bn/common.json';
import bnHome from './bn/home.json';

export const en = {
  common: enCommon,
  home: enHome,
  auth: enAuth,
  cart: enCart,
  products: enProducts
};

export const bn = {
  common: bnCommon,
  home: bnHome,
  auth: enAuth, // Fallback to English for incomplete translations
  cart: enCart,
  products: enProducts
};

export default { en, bn };
