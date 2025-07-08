import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages, Globe } from 'lucide-react';
import { useI18n, type SupportedLanguage } from '@/hooks/useI18n';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'card' | 'button';
  isDark?: boolean;
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'dropdown', 
  isDark = false,
  className = '' 
}) => {
  const { language, setLanguage, availableLanguages, t } = useI18n();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as SupportedLanguage);
  };

  // Get flag emoji for language
  const getFlagEmoji = (langCode: SupportedLanguage): string => {
    const flags: Record<SupportedLanguage, string> = {
      en: '🇺🇸',
      es: '🇪🇸',
    };
    return flags[langCode] || '🌐';
  };

  if (variant === 'button') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {availableLanguages.map((lang) => (
          <Button
            key={lang.code}
            variant={language === lang.code ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-2 transition-all duration-200 ${
              language === lang.code 
                ? 'bg-blue-600 text-white' 
                : isDark 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <span className="text-sm">{getFlagEmoji(lang.code)}</span>
            <span className="hidden sm:inline">{lang.nativeName}</span>
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm ${className}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Languages className="h-5 w-5" />
            {t('settings.language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('settings.languageDescription')}
            </p>
            
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{getFlagEmoji(language)}</span>
                    <span>{availableLanguages.find(lang => lang.code === language)?.nativeName}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{getFlagEmoji(lang.code)}</span>
                      <span>{lang.nativeName}</span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({lang.name})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default dropdown variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-auto min-w-[120px] border-none bg-transparent">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{getFlagEmoji(language)}</span>
              <span className="hidden sm:inline">
                {availableLanguages.find(lang => lang.code === language)?.nativeName}
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span>{getFlagEmoji(lang.code)}</span>
                <span>{lang.nativeName}</span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({lang.name})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
