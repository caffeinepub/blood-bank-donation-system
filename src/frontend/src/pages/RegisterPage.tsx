import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Heart, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useRegisterDonor, useGetCallerUserProfile } from '@/hooks/useQueries';
import { BLOOD_TYPES, isEligibleAge, isEligibleWeight } from '@/lib/bloodbank-utils';
import { toast } from 'sonner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const registerDonor = useRegisterDonor();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [location, setLocation] = useState('');
  const [healthStatus, setHealthStatus] = useState('');

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Redirect if already registered
  useEffect(() => {
    if (isAuthenticated && isFetched && userProfile) {
      toast.info('You are already registered');
      navigate({ to: '/donor' });
    }
  }, [isAuthenticated, isFetched, userProfile, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login first to register as a donor');
      return;
    }

    if (!name || !age || !weight || !bloodType || !location || !healthStatus) {
      toast.error('Please fill in all required fields');
      return;
    }

    const ageNum = parseInt(age);
    const weightNum = parseInt(weight);

    if (!isEligibleAge(ageNum)) {
      toast.error('Age must be between 18 and 65 years');
      return;
    }

    if (!isEligibleWeight(weightNum)) {
      toast.error('Weight must be at least 50 kg');
      return;
    }

    try {
      await registerDonor.mutateAsync({
        name,
        age: BigInt(ageNum),
        bloodType,
        location,
        weight: BigInt(weightNum),
        healthStatus,
      });

      toast.success('Registration successful! Welcome to BloodBank.');
      navigate({ to: '/donor' });
    } catch (error) {
      console.error('Error registering donor:', error);
      toast.error('Registration failed. Please try again.');
    }
  };

  // Check eligibility as user types
  const ageNum = parseInt(age) || 0;
  const weightNum = parseInt(weight) || 0;
  const ageEligible = age ? isEligibleAge(ageNum) : null;
  const weightEligible = weight ? isEligibleWeight(weightNum) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">BloodBank</h1>
          </Link>
          
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-display">Register as Blood Donor</CardTitle>
              <CardDescription>
                Join our community of life-savers. Fill in your details to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You need to login with Internet Identity before registering as a donor.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="w-full"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Login to Continue'
                    )}
                  </Button>
                </div>
              ) : profileLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">
                        Age <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Years"
                        min="1"
                        max="120"
                        required
                      />
                      {ageEligible === false && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Age must be between 18-65 years
                        </p>
                      )}
                      {ageEligible === true && (
                        <p className="text-xs text-success flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Age eligible
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">
                        Weight (kg) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="Kilograms"
                        min="1"
                        max="500"
                        required
                      />
                      {weightEligible === false && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Weight must be at least 50 kg
                        </p>
                      )}
                      {weightEligible === true && (
                        <p className="text-xs text-success flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Weight eligible
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodType">
                      Blood Type <span className="text-destructive">*</span>
                    </Label>
                    <Select value={bloodType} onValueChange={setBloodType} required>
                      <SelectTrigger id="bloodType">
                        <SelectValue placeholder="Select your blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location (City) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter your city"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="healthStatus">
                      Health Status <span className="text-destructive">*</span>
                    </Label>
                    <Select value={healthStatus} onValueChange={setHealthStatus} required>
                      <SelectTrigger id="healthStatus">
                        <SelectValue placeholder="Select your health status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Healthy">Healthy</SelectItem>
                        <SelectItem value="Under Medication">Under Medication</SelectItem>
                        <SelectItem value="Chronic Condition">Chronic Condition</SelectItem>
                        <SelectItem value="Recently Donated">Recently Donated</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Be honest about your health status. This helps us ensure safe donations.
                    </p>
                  </div>

                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <h3 className="font-semibold text-sm mb-2">Eligibility Criteria</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className={ageEligible === true ? 'text-success' : ageEligible === false ? 'text-destructive' : ''}>
                        • Age: 18-65 years
                      </li>
                      <li className={weightEligible === true ? 'text-success' : weightEligible === false ? 'text-destructive' : ''}>
                        • Weight: At least 50 kg
                      </li>
                      <li>• Good general health</li>
                      <li>• No recent illness or surgery</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerDonor.isPending || ageEligible === false || weightEligible === false}
                  >
                    {registerDonor.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
