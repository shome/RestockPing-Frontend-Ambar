import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const TestLinks = () => {
  const sampleLocationId = "0a2fd80f-9808-4121-8afa-efc0257107dd";

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Test Location Links</h1>
          <p className="text-muted-foreground">
            Test different ways to pass location ID to the application
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Query Parameter Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Query Parameter Method
              </CardTitle>
              <CardDescription>
                Using ?location= in the URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm font-mono bg-muted p-2 rounded">
                /optin?location={sampleLocationId}
              </div>
              <Link to={`/optin?location=${sampleLocationId}`}>
                <Button className="w-full">
                  Test Query Parameter
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* URL Path Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                URL Path Method
              </CardTitle>
              <CardDescription>
                Using /location/:id in the URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm font-mono bg-muted p-2 rounded">
                /location/{sampleLocationId}
              </div>
              <Link to={`/location/${sampleLocationId}`}>
                <Button className="w-full">
                  Test URL Path
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* No Location ID */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                No Location ID
              </CardTitle>
              <CardDescription>
                Default behavior without location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm font-mono bg-muted p-2 rounded">
                /optin
              </div>
              <Link to="/optin">
                <Button className="w-full" variant="outline">
                  Test Without Location
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Back to Home
              </CardTitle>
              <CardDescription>
                Return to main application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm font-mono bg-muted p-2 rounded">
                /
              </div>
              <Link to="/">
                <Button className="w-full" variant="secondary">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            All methods should now work without showing "Location ID is required" error
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestLinks;
