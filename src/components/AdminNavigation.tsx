import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart3, 
  Database, 
  Activity, 
  Settings,
  Key,
  AlertCircle,
  LogOut
} from 'lucide-react';

const AdminNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: BarChart3,
      description: 'Overview and analytics'
    },
    {
      name: 'Labels',
      href: '/admin/labels',
      icon: Database,
      description: 'Manage product labels'
    },
    {
      name: 'Logs',
      href: '/admin/logs',
      icon: Activity,
      description: 'View system logs'
    },
    {
      name: 'Requests',
      href: '/admin/requests',
      icon: AlertCircle,
      description: 'Map customer requests'
    },
    {
      name: 'PINs',
      href: '/admin/pins',
      icon: Key,
      description: 'Manage access PINs'
    }
  ];

  const handleLogout = () => {
    console.log('Logout button clicked');
    
    try {
      // Check current token before removal
      const currentToken = localStorage.getItem('admin_token');
      console.log('Current admin token:', currentToken ? 'Present' : 'Not found');
      
      // Remove admin token and related data
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_session');
      
      // Clear any cached data
      sessionStorage.clear();
      
      // Verify token removal
      const tokenAfterRemoval = localStorage.getItem('admin_token');
      console.log('Token after removal:', tokenAfterRemoval ? 'Still present' : 'Removed');
      
      // Use a small delay to ensure localStorage changes are processed
      setTimeout(() => {
        console.log('Navigating to login page...');
        // Force navigation to login page with replace to prevent back button issues
        navigate('/admin/login', { replace: true });
        
        // Force a hard reload to ensure clean state
        window.location.href = '/admin/login';
      }, 100);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force navigation even if there's an error
      window.location.href = '/admin/login';
    }
  };

  return (
    <Card className="w-64 h-full">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">System Management</p>
          </div>
          
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Button
                  key={item.name}
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start h-auto p-3 transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90' 
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => navigate(item.href)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`} />
                    <div className="text-left">
                      <div className={`font-medium ${
                        isActive ? 'text-primary-foreground' : 'text-foreground'
                      }`}>
                        {item.name}
                      </div>
                      <div className={`text-xs ${
                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </nav>
          
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium text-red-600">Logout</div>
                <div className="text-xs text-red-500">
                  Sign out of admin panel
                </div>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminNavigation;
