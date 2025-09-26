import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Package, BarChart3 } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            RestockPing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Smart inventory management system with real-time notifications and team collaboration
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Admin Access */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/login')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <CardDescription>
                Full system control and management
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                size="lg" 
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/admin/login');
                }}
              >
                Admin Login
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Manage PINs, view logs, control system
              </p>
            </CardContent>
          </Card>

          {/* Team Access */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/team/login')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Team Access</CardTitle>
              <CardDescription>
                Team member dashboard and tools
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/team/login');
                }}
              >
                Team Login
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Scan products, send alerts, view dashboard
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Customer Access */}
        <div className="max-w-2xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Customer Portal</CardTitle>
              <CardDescription>
                Request product notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => navigate('/optin')}
              >
                Request Product Alerts
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Get notified when products are back in stock
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-sm text-gray-600">Track inventory and customer requests</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Secure Access</h3>
            <p className="text-sm text-gray-600">PIN-based authentication for teams</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="font-semibold mb-2">Team Collaboration</h3>
            <p className="text-sm text-gray-600">Multi-location team management</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>&copy; 2024 RestockPing. Smart inventory management system.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
