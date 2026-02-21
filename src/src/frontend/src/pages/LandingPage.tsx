import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, 
  Users, 
  Calendar, 
  AlertCircle, 
  Activity,
  Shield,
  Clock,
  MapPin
} from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '@/hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ProfileSetupModal from '@/components/ProfileSetupModal';

export default function LandingPage() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    toast.success('Logged out successfully');
  };

  const features = [
    {
      icon: Heart,
      title: 'Save Lives',
      description: 'Your blood donation can save up to three lives',
    },
    {
      icon: Users,
      title: 'Find Donors',
      description: 'Search for donors by blood type and location',
    },
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Schedule your donation appointment online',
    },
    {
      icon: AlertCircle,
      title: 'Emergency Requests',
      description: 'Submit urgent blood requests 24/7',
    },
    {
      icon: Activity,
      title: 'Track History',
      description: 'Keep records of all your donations',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Your data is protected with blockchain technology',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Profile Setup Modal */}
      <ProfileSetupModal 
        open={showProfileSetup} 
        onComplete={() => queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] })}
      />

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">BloodBank</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#emergency" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Emergency
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {userProfile && (
                  <Link to={isAdmin ? '/admin' : '/donor'}>
                    <Button variant="secondary" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </Button>
                <Link to="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Register as Donor
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Saving Lives Through Technology</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 tracking-tight">
              Donate Blood,
              <br />
              <span className="text-primary">Save Lives</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect donors with those in need through our secure, blockchain-powered blood bank management system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/emergency">
                <Button size="lg" className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-glow">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Emergency Request
                </Button>
              </Link>
              {!isAuthenticated && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                >
                  <Users className="mr-2 h-5 w-5" />
                  {isLoggingIn ? 'Logging in...' : 'Become a Donor'}
                </Button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">Safe</div>
                <div className="text-sm text-muted-foreground">& Secure</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">Fast</div>
                <div className="text-sm text-muted-foreground">Response</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive blood bank management system built with modern technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-display">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section id="emergency" className="py-20 bg-gradient-to-br from-destructive/5 to-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-destructive/20 bg-card">
            <CardHeader className="text-center pb-8">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-destructive animate-pulse-glow" />
              </div>
              <CardTitle className="text-3xl font-display">Need Blood Urgently?</CardTitle>
              <CardDescription className="text-lg mt-2">
                Submit an emergency request and we'll notify available donors immediately
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pb-8">
              <Link to="/emergency">
                <Button size="lg" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  <Clock className="mr-2 h-5 w-5" />
                  Submit Emergency Request
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">No login required • Available 24/7</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-foreground mb-8">
              Built on Internet Computer
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-center text-lg leading-relaxed">
                Our blood bank management system leverages blockchain technology to ensure 
                data security, transparency, and reliability. Every donation, request, and 
                transaction is securely recorded on the Internet Computer, making it tamper-proof 
                and always accessible when you need it most.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Blockchain-powered security ensures your data is protected
                </p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Accessible</h3>
                <p className="text-sm text-muted-foreground">
                  Find donors and blood availability in your area instantly
                </p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Transparent</h3>
                <p className="text-sm text-muted-foreground">
                  Track your donation history and impact over time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary fill-primary" />
              <span className="font-display font-semibold text-foreground">BloodBank</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2026. Built with <Heart className="inline h-4 w-4 text-primary fill-primary" /> using{' '}
              <a 
                href="https://caffeine.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
