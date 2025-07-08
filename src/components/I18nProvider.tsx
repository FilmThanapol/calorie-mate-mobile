import React from 'react';
import { I18nContext, useI18nState } from '@/hooks/useI18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const i18nState = useI18nState();

  return (
    <I18nContext.Provider value={i18nState}>
      {children}
    </I18nContext.Provider>
  );
};

export default I18nProvider;
