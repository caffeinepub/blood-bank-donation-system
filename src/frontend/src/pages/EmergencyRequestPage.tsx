import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, ArrowLeft, Heart, Loader2 } from 'lucide-react';
import { useSubmitEmergencyRequest } from '@/hooks/useQueries';
import { BLOOD_TYPES, URGENCY_LEVELS } from '@/lib/bloodbank-utils';
import { toast } from 'sonner';

export default function EmergencyRequestPage() {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [location, setLocation] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const submitRequest = useSubmitEmergencyRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName || !bloodType || !location || !urgencyLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await submitRequest.mutateAsync({
        patientName,
        bloodType,
        location,
        urgencyLevel,
      });

      toast.success('Emergency request submitted successfully');
      
      // Reset form
      setPatientName('');
      setBloodType('');
      setLocation('');
      setUrgencyLevel('');
      setContactInfo('');

      // Navigate back to home after a short delay
      setTimeout(() => navigate({ to: '/' }), 2000);
    } catch (error) {
      console.error('Error submitting emergency request:', error);
      toast.error('Failed to submit request. Please try again.');
    }
  };

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
          {/* Alert Banner */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 animate-pulse-glow shrink-0" />
            <div>
              <h2 className="font-display font-semibold text-destructive mb-1">Emergency Blood Request</h2>
              <p className="text-sm text-destructive/80">
                This form is for urgent blood requirements. Our system will notify available donors and administrators immediately.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-display">Submit Emergency Request</CardTitle>
              <CardDescription>
                Fill in the details below. No login required. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="patientName">
                    Patient Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient's full name"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">
                      Blood Type Required <span className="text-destructive">*</span>
                    </Label>
                    <Select value={bloodType} onValueChange={setBloodType} required>
                      <SelectTrigger id="bloodType">
                        <SelectValue placeholder="Select blood type" />
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
                    <Label htmlFor="urgencyLevel">
                      Urgency Level <span className="text-destructive">*</span>
                    </Label>
                    <Select value={urgencyLevel} onValueChange={setUrgencyLevel} required>
                      <SelectTrigger id="urgencyLevel">
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        {URGENCY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Hospital/Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter hospital name or city"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Contact Information (Optional)</Label>
                  <Textarea
                    id="contactInfo"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Phone number, email, or any additional contact details"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    This information will help us reach you faster, but it's optional.
                  </p>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-2">What happens next?</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your request will be visible to all administrators immediately</li>
                    <li>• Available donors matching your requirements will be notified</li>
                    <li>• You can track the status of your request after logging in</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={submitRequest.isPending}
                  >
                    {submitRequest.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Submit Emergency Request
                      </>
                    )}
                  </Button>
                  <Link to="/">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-6 border-secondary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Need help or have questions?
                </p>
                <p className="text-sm">
                  For immediate assistance, call our 24/7 helpline or{' '}
                  <Link to="/" className="text-primary hover:underline font-medium">
                    return to homepage
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
