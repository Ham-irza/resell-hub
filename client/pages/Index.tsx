import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Check, Zap, TrendingUp, Wallet, Users, Shield, ShoppingCart, Clock, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Index() {
  const [, setLocation] = useLocation();

  const handleSignUp = () => {
    setLocation("/auth");
  };

  const steps = [
    {
      step: "1",
      title: "Browse Products",
      description: "Choose from a variety of products available in our marketplace."
    },
    {
      step: "2",
      title: "Purchase & Pay",
      description: "Buy products using our secure Bank Alfalah payment gateway."
    },
    {
      step: "3",
      title: "Auto-Sell (30 Days)",
      description: "Your products are automatically sold within 30 days. Track progress in real-time."
    },
    {
      step: "4",
      title: "Get Paid",
      description: "Receive your capital + profit directly in your wallet. Withdraw anytime!"
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "30-Day Auto-Sell",
      description: "Products sell automatically within 30 days. No waiting, no hassle - just pure profits.",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Tracking",
      description: "Watch your items sell in real-time with live progress updates and notifications.",
    },
    {
      icon: Wallet,
      title: "Instant Wallet",
      description: "Get paid immediately after sales complete. Withdraw to your bank account anytime.",
    },
    {
      icon: Users,
      title: "Referral Program",
      description: "Share your unique link and earn commissions from every new reseller who joins.",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Bank Alfalah integration ensures secure, reliable payment processing every time.",
    },
    {
      icon: ShoppingCart,
      title: "Wide Product Range",
      description: "Choose from hundreds of products across different categories and price points.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Auto-Sell in Just 30 Days!
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Turn Products Into{" "}
            <span className="text-primary">Profits</span> Automatically
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Buy products, we auto-sell them in 30 days. Track progress in real-time. 
            Get paid to your wallet instantly. It's that simple!
          </p>
          
          {/* Main CTA Button */}
          <Button 
            size="lg" 
            onClick={handleSignUp}
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white"
          >
            Start Selling Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 md:mt-24">
          {[
            { label: "Active Resellers", value: "5,000+" },
            { label: "Products Sold", value: "50,000+" },
            { label: "Avg. Profit", value: "15%" },
            { label: "Fast Payouts", value: "24/7" },
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

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to start earning. No experience needed!
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm text-center h-full">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-emerald-700">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-emerald-300">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
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
              Why Choose Us
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
          <p>&copy; 2024 eGrocify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
