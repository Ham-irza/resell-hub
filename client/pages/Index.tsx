import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Check, Zap, TrendingUp, Wallet, Users, Shield } from "lucide-react";
import { useLocation } from "wouter";

export default function Index() {
  const [, setLocation] = useLocation();

  const handleSignUp = () => {
    setLocation("/auth");
  };

  const pricingPlans = [
    {
      name: "Starter",
      monthlyReturn: "4%",
      price: "PKR 50,000",
      description: "Perfect for beginners",
      features: [
        "Basic product portfolio",
        "Daily sales simulation (1 item/day)",
        "Basic wallet system",
        "Email notifications",
        "5% referral commission",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Growth",
      monthlyReturn: "4.5%",
      price: "PKR 100,000",
      description: "Best for active resellers",
      features: [
        "Extended product portfolio",
        "Daily sales simulation (1-2 items/day)",
        "Advanced wallet analytics",
        "SMS & email notifications",
        "7% referral commission",
        "Priority support",
      ],
      cta: "Get Started",
      highlighted: true,
    },
    {
      name: "Premium",
      monthlyReturn: "5%",
      price: "PKR 200,000",
      description: "Maximum returns",
      features: [
        "Full product portfolio",
        "Optimized sales simulation (1-2 items/day)",
        "Advanced analytics & reports",
        "Multi-channel notifications",
        "10% referral commission",
        "24/7 priority support",
        "Withdrawal priority processing",
      ],
      cta: "Get Started",
      highlighted: false,
    },
  ];

  const features = [
    {
      icon: Wallet,
      title: "Smart Wallet System",
      description:
        "Track your earnings in real-time as products sell daily. See your profits grow with automated updates.",
    },
    {
      icon: TrendingUp,
      title: "Sales Simulation",
      description:
        "Products sell automatically 1-2 items per day throughout the month. Full transparency on sales progress.",
    },
    {
      icon: Users,
      title: "Referral Program",
      description:
        "Share your unique referral link and earn commissions from every purchase. Unlimited earning potential.",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description:
        "Bank Alfalah integration ensures secure, reliable payment processing. Your money is always protected.",
    },
    {
      icon: Zap,
      title: "Instant Notifications",
      description:
        "Get real-time updates on sales, earnings, and referrals. Stay connected to your business.",
    },
    {
      icon: TrendingUp,
      title: "Easy Withdrawals",
      description:
        "Simple withdrawal process with transparent status tracking. Get your earnings when you want.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Grow Your Income with{" "}
            <span className="text-primary">Smart Reselling</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of resellers earning daily returns. Minimal effort,
            maximum profit. Let your products sell themselves.
          </p>
          
          {/* Main CTA Button */}
          <Button 
            size="lg" 
            onClick={handleSignUp}
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white"
          >
            Start Earning Now
          </Button>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 md:mt-24">
          {[
            { label: "Active Resellers", value: "5,000+" },
            { label: "Total Earnings", value: "PKR 50M+" },
            { label: "Avg. Return", value: "4.5%" },
            { label: "Uptime", value: "99.9%" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your goals. All plans include daily
              sales simulation and automated earnings.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-lg border transition-all ${
                  plan.highlighted
                    ? "border-primary bg-white shadow-lg md:scale-105"
                    : "border-border bg-white hover:shadow-md"
                }`}
              >
                <div className="p-8">
                  {plan.highlighted && (
                    <div className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <div className="text-4xl font-bold text-foreground mb-2">
                      {plan.price}
                    </div>
                    <div className="text-accent font-semibold">
                      {plan.monthlyReturn} Monthly Return
                    </div>
                  </div>

                  <Button
                    onClick={handleSignUp}
                    className={`w-full mb-8 ${
                      plan.highlighted
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-secondary hover:bg-secondary/90"
                    }`}
                  >
                    {plan.cta}
                  </Button>

                  <div className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to succeed as a reseller
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="p-6 rounded-lg border border-border hover:shadow-md transition-shadow">
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful resellers. No experience needed.
          </p>
          <Button
            size="lg"
            onClick={handleSignUp}
            className="bg-white text-primary hover:bg-white/90"
          >
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 ResellHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}