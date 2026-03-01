import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useRegisterDonor,
  useSaveCallerUserProfile,
} from "@/hooks/useQueries";
import {
  BLOOD_TYPES,
  isEligibleAge,
  isEligibleWeight,
} from "@/lib/bloodbank-utils";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplets,
  Heart,
  Loader2,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const WHY_DONATE_FACTS = [
  {
    icon: Users,
    stat: "1 in 3",
    label: "people will need blood in their lifetime",
  },
  {
    icon: Clock,
    stat: "Every 2s",
    label: "someone in India needs blood",
  },
  {
    icon: Heart,
    stat: "3 lives",
    label: "saved per single donation",
  },
  {
    icon: Award,
    stat: "450 ml",
    label: "is all it takes to make a difference",
  },
];

const STEPS = [
  { id: 1, label: "Personal Info", icon: User },
  { id: 2, label: "Medical Info", icon: Droplets },
  { id: 3, label: "Confirm", icon: CheckCircle2 },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const registerDonor = useRegisterDonor();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [location, setLocation] = useState("");
  const [healthStatus, setHealthStatus] = useState("");

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const isSubmitting = registerDonor.isPending || saveProfile.isPending;

  // Redirect if already registered — only when profile has a name (non-empty profile)
  useEffect(() => {
    if (isAuthenticated && isFetched && userProfile && userProfile.name) {
      toast.info("You are already registered");
      navigate({ to: "/donor" });
    }
  }, [isAuthenticated, isFetched, userProfile, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login first to register as a donor");
      return;
    }

    if (
      !name ||
      !contact ||
      !age ||
      !weight ||
      !bloodType ||
      !location ||
      !healthStatus
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const ageNum = Number.parseInt(age);
    const weightNum = Number.parseInt(weight);

    if (!isEligibleAge(ageNum)) {
      toast.error("Age must be between 18 and 65 years");
      return;
    }

    if (!isEligibleWeight(weightNum)) {
      toast.error("Weight must be at least 50 kg");
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

      // Try to save full profile including contact — non-fatal if it fails
      try {
        await saveProfile.mutateAsync({
          name,
          age: BigInt(ageNum),
          contact,
          bloodGroup: bloodType,
          location,
          weight: BigInt(weightNum),
          healthStatus,
          role: "donor",
        });
      } catch (profileError) {
        console.warn(
          "Profile save failed, but donor was registered:",
          profileError,
        );
      }

      toast.success("Registration successful! Welcome to BloodBank.");
      navigate({ to: "/donor" });
    } catch (error) {
      console.error("Error registering donor:", error);
      const message =
        error instanceof Error ? error.message : "Registration failed.";
      // If already registered, redirect to donor dashboard instead of showing error
      if (
        message.includes("already registered") ||
        message.includes("Donor already registered")
      ) {
        toast.error("You are already registered as a donor.");
        navigate({ to: "/donor" });
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  // Eligibility checks
  const ageNum = Number.parseInt(age) || 0;
  const weightNum = Number.parseInt(weight) || 0;
  const ageEligible = age ? isEligibleAge(ageNum) : null;
  const weightEligible = weight ? isEligibleWeight(weightNum) : null;

  // Determine current step for progress indicator
  const currentStep =
    !name && !contact ? 1 : !bloodType && !age && !weight ? 2 : 3;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary fill-primary" />
            <span className="text-xl font-display font-bold text-foreground">
              BloodBank
            </span>
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
      <main className="container mx-auto px-4 py-10 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
            {/* ── Left: Form ─────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Page heading */}
              <div className="mb-8">
                <Badge
                  variant="outline"
                  className="mb-3 text-primary border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium"
                >
                  <Heart className="mr-1.5 h-3 w-3 fill-primary" />
                  Donor Registration
                </Badge>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
                  Join Our Community of
                  <br />
                  <span className="text-primary">Life-Savers</span>
                </h1>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Fill in your details to register as a blood donor. Your
                  contribution can save up to three lives.
                </p>
              </div>

              {/* Step Progress */}
              {isAuthenticated && !profileLoading && (
                <div className="flex items-center gap-0 mb-8">
                  {STEPS.map((step, i) => {
                    const isActive = currentStep === step.id;
                    const isDone = currentStep > step.id;
                    return (
                      <div
                        key={step.id}
                        className="flex items-center flex-1 last:flex-none"
                      >
                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : isDone
                                ? "text-success"
                                : "text-muted-foreground"
                          }`}
                        >
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                              isActive
                                ? "border-primary bg-primary text-primary-foreground"
                                : isDone
                                  ? "border-success bg-success/10 text-success"
                                  : "border-border bg-background text-muted-foreground"
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              step.id
                            )}
                          </div>
                          <span className="text-xs font-medium hidden sm:block">
                            {step.label}
                          </span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <ChevronRight className="h-4 w-4 text-border flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <Card className="border-border shadow-sm">
                <CardContent className="p-6 md:p-8">
                  {!isAuthenticated ? (
                    <div className="space-y-5">
                      <Alert className="border-primary/20 bg-primary/5">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-foreground">
                          You need to login with Internet Identity before
                          registering as a donor.
                        </AlertDescription>
                      </Alert>

                      <div className="bg-muted/40 rounded-xl p-5 space-y-3">
                        <p className="text-sm font-medium text-foreground">
                          Why login is required:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            Your identity is securely verified on the blockchain
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            No passwords — cryptographically secure
                            authentication
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            Your donation history is tied to your unique
                            identity
                          </li>
                        </ul>
                      </div>

                      <Button
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        className="w-full h-12 text-base"
                      >
                        {isLoggingIn ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          <>
                            <Heart className="mr-2 h-5 w-5" />
                            Login to Continue
                          </>
                        )}
                      </Button>
                    </div>
                  ) : profileLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Checking your profile...
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Section: Personal Information */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                          <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                            <User className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                            Personal Information
                          </h3>
                        </div>

                        {/* Full Name */}
                        <div className="space-y-1.5">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Full Name{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Enter your full name"
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        {/* Contact / Phone */}
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="contact"
                            className="text-sm font-medium"
                          >
                            Phone Number{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="contact"
                              type="tel"
                              value={contact}
                              onChange={(e) => setContact(e.target.value)}
                              placeholder="e.g. +91 98765 43210"
                              className="pl-10"
                              required
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Used for emergency notifications and appointment
                            reminders only.
                          </p>
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="location"
                            className="text-sm font-medium"
                          >
                            Location (City){" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="location"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              placeholder="Enter your city"
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section: Medical Information */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                          <div className="h-6 w-6 rounded bg-destructive/10 flex items-center justify-center">
                            <Droplets className="h-3.5 w-3.5 text-destructive" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                            Medical Information
                          </h3>
                        </div>

                        {/* Age + Weight */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="age"
                              className="text-sm font-medium"
                            >
                              Age <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="age"
                              type="number"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                              placeholder="Years (18–65)"
                              min="1"
                              max="120"
                              required
                            />
                            {ageEligible === false && (
                              <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Must be 18–65 years
                              </p>
                            )}
                            {ageEligible === true && (
                              <p className="text-xs text-success flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Age eligible
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label
                              htmlFor="weight"
                              className="text-sm font-medium"
                            >
                              Weight (kg){" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="weight"
                              type="number"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              placeholder="Minimum 50 kg"
                              min="1"
                              max="500"
                              required
                            />
                            {weightEligible === false && (
                              <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Must be at least 50 kg
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

                        {/* Blood Type */}
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="bloodType"
                            className="text-sm font-medium"
                          >
                            Blood Type{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={bloodType}
                            onValueChange={setBloodType}
                            required
                          >
                            <SelectTrigger id="bloodType">
                              <SelectValue placeholder="Select your blood type" />
                            </SelectTrigger>
                            <SelectContent>
                              {BLOOD_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  <span className="font-semibold text-primary">
                                    {type}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Health Status */}
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="healthStatus"
                            className="text-sm font-medium"
                          >
                            Health Status{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={healthStatus}
                            onValueChange={setHealthStatus}
                            required
                          >
                            <SelectTrigger id="healthStatus">
                              <SelectValue placeholder="Select your health status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="healthy">Healthy</SelectItem>
                              <SelectItem value="under medication">
                                Under Medication
                              </SelectItem>
                              <SelectItem value="chronic condition">
                                Chronic Condition
                              </SelectItem>
                              <SelectItem value="recently donated">
                                Recently Donated
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Be honest — this ensures safe and healthy donations.
                          </p>
                        </div>
                      </div>

                      {/* Eligibility Summary */}
                      <div className="bg-muted/40 border border-border rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="h-4 w-4 text-primary" />
                          <h4 className="text-sm font-semibold text-foreground">
                            Eligibility Criteria
                          </h4>
                        </div>
                        <ul className="text-sm space-y-2">
                          <li
                            className={`flex items-center gap-2 ${
                              ageEligible === true
                                ? "text-success"
                                : ageEligible === false
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {ageEligible === true ? (
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            ) : ageEligible === false ? (
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-current flex-shrink-0" />
                            )}
                            Age: 18–65 years
                          </li>
                          <li
                            className={`flex items-center gap-2 ${
                              weightEligible === true
                                ? "text-success"
                                : weightEligible === false
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {weightEligible === true ? (
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            ) : weightEligible === false ? (
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-current flex-shrink-0" />
                            )}
                            Weight: at least 50 kg
                          </li>
                          <li className="flex items-center gap-2 text-muted-foreground">
                            <div className="h-4 w-4 rounded-full border-2 border-current flex-shrink-0" />
                            Good general health
                          </li>
                          <li className="flex items-center gap-2 text-muted-foreground">
                            <div className="h-4 w-4 rounded-full border-2 border-current flex-shrink-0" />
                            No recent illness or surgery
                          </li>
                        </ul>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold"
                        disabled={
                          isSubmitting ||
                          ageEligible === false ||
                          weightEligible === false
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <Heart className="mr-2 h-5 w-5" />
                            Complete Registration
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        By registering, you agree to be contacted for blood
                        donation requests. Your data is securely stored on the
                        Internet Computer blockchain.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Right: Why Donate Sidebar ──────────────────── */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="space-y-5 lg:sticky lg:top-24"
            >
              {/* Why Donate Card */}
              <div className="relative overflow-hidden rounded-2xl bg-primary/5 border border-primary/15 p-6">
                {/* Decorative background blob */}
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-primary/8 blur-xl pointer-events-none" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="h-5 w-5 text-primary fill-primary" />
                    <h2 className="font-display font-bold text-lg text-foreground">
                      Why Donate Blood?
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {WHY_DONATE_FACTS.map((fact, i) => (
                      <motion.div
                        key={fact.stat}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.08 }}
                        className="bg-card border border-border rounded-xl p-3 text-center"
                      >
                        <fact.icon className="h-5 w-5 text-primary mx-auto mb-1.5" />
                        <div className="text-base font-display font-bold text-foreground">
                          {fact.stat}
                        </div>
                        <div className="text-xs text-muted-foreground leading-tight mt-0.5">
                          {fact.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <blockquote className="border-l-2 border-primary/40 pl-4 py-1">
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      "Blood cannot be manufactured — it can only come from
                      generous donors. Your single donation can be the
                      difference between life and death."
                    </p>
                  </blockquote>
                </div>
              </div>

              {/* Blood Group Compatibility Card */}
              <div className="rounded-2xl bg-card border border-border p-5">
                <h3 className="font-display font-semibold text-base text-foreground mb-4 flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-destructive" />
                  Blood Groups Supported
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map((type) => (
                    <div
                      key={type}
                      className={`rounded-lg py-2 text-center text-sm font-bold transition-colors ${
                        bloodType === type
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {type}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  We accept all 8 blood groups. Select yours when filling the
                  form.
                </p>
              </div>

              {/* Process Steps Card */}
              <div className="rounded-2xl bg-card border border-border p-5">
                <h3 className="font-display font-semibold text-base text-foreground mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-secondary" />
                  Donation Process
                </h3>
                <ol className="space-y-3">
                  {[
                    { step: "01", text: "Register and complete your profile" },
                    { step: "02", text: "Book a donation appointment" },
                    {
                      step: "03",
                      text: "Visit the blood bank on your chosen date",
                    },
                    { step: "04", text: "Donate and receive your certificate" },
                  ].map((item) => (
                    <li key={item.step} className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {item.step}
                      </span>
                      <span className="text-sm text-muted-foreground pt-0.5">
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-8 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with{" "}
            <Heart className="inline h-3.5 w-3.5 text-primary fill-primary" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
