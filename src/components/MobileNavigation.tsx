import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  QrCode, 
  Send, 
  History, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface MobileNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  subscriberCount?: number;
  hasUnreadLogs?: boolean;
}

const MobileNavigation = ({ 
  currentPage, 
  onNavigate, 
  onLogout,
  subscriberCount = 0,
  hasUnreadLogs = false
}: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'scanner', label: 'Scan', icon: QrCode },
    { id: 'audit-log', label: 'Logs', icon: History, badge: hasUnreadLogs },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)}>
          <div className="absolute bottom-20 right-4 bg-background rounded-lg shadow-xl border p-2 min-w-[200px]">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => handleNavigate(item.id)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="h-5 w-5 p-0 rounded-full">
                        !
                      </Badge>
                    )}
                  </Button>
                );
              })}
              
              <div className="border-t my-2" />
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive"
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden lg:block fixed top-4 right-4 z-30">
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
          <div className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="relative"
                  onClick={() => handleNavigate(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {item.badge && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 rounded-full text-xs">
                      !
                    </Badge>
                  )}
                </Button>
              );
            })}
            
            <div className="w-px bg-border mx-1" />
            
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Send Alerts */}
      {currentPage === 'dashboard' && subscriberCount > 0 && (
        <div className="lg:hidden fixed bottom-20 left-4 z-40">
          <Button
            size="lg"
            className="rounded-full h-14 px-6 shadow-lg"
            onClick={() => onNavigate('send-alerts')}
          >
            <Send className="h-5 w-5 mr-2" />
            Send Alerts
            <Badge variant="secondary" className="ml-2">
              {subscriberCount}
            </Badge>
          </Button>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;
