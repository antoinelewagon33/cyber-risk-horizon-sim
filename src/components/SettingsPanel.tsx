
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Moon, Sun, Languages } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useTranslation } from '@/utils/translations';

const SettingsPanel = () => {
  const { theme, language, currency, toggleTheme, setLanguage, setCurrency } = useSettings();
  const { t } = useTranslation(language);

  return (
    <div className="flex items-center space-x-2">
      {/* Theme Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="border-cyber-blue/30 hover:border-cyber-blue/60"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-cyber-blue" />
        ) : (
          <Moon className="h-4 w-4 text-cyber-blue" />
        )}
      </Button>

      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-cyber-purple/30 hover:border-cyber-purple/60"
          >
            <Languages className="h-4 w-4 text-cyber-purple mr-1" />
            {language.toUpperCase()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border-border">
          <DropdownMenuItem onClick={() => setLanguage('en')}>
            English
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLanguage('fr')}>
            Français
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Currency Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-cyber-green/30 hover:border-cyber-green/60"
          >
            <span className="text-cyber-green mr-1">$</span>
            {currency}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border-border">
          <DropdownMenuItem onClick={() => setCurrency('USD')}>
            USD ($)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCurrency('EUR')}>
            EUR (€)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCurrency('CAD')}>
            CAD (C$)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SettingsPanel;
