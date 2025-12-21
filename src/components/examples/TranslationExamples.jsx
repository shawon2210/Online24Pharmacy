import { useTranslation } from '../../hooks/useTranslation';

/**
 * Examples of using translations in components
 */

// Example 1: Basic translation
export function BasicExample() {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <button>{t('buttons.save')}</button>
    </div>
  );
}

// Example 2: With interpolation
export function InterpolationExample({ count }) {
  const { t } = useTranslation('cart');
  
  return (
    <p>{t('itemsCount', { count })}</p>
  );
}

// Example 3: Multiple namespaces
export function MultiNamespaceExample() {
  const { t: tCommon } = useTranslation('common');
  const { t: tHome } = useTranslation('home');
  
  return (
    <div>
      <h1>{tHome('hero.title')}</h1>
      <button>{tCommon('buttons.shopNow')}</button>
    </div>
  );
}

// Example 4: With language switcher
export function LanguageSwitcherExample() {
  const { t, language, changeLanguage } = useTranslation('common');
  
  return (
    <div>
      <p>Current language: {language}</p>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('bn')}>বাংলা</button>
      <p>{t('nav.home')}</p>
    </div>
  );
}

// Example 5: SEO with translations
export function SEOExample() {
  const { t } = useTranslation('home');
  
  return (
    <>
      <title>{t('seoTitle')}</title>
      <meta name="description" content={t('seoDescription')} />
    </>
  );
}
