import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Check, Zap, TrendingUp, Wallet, Users, Shield, ShoppingCart, Clock, ArrowRight, Phone, X } from "lucide-react";
import { useLocation, Link } from "wouter";

export default function Index() {
  const [, setLocation] = useLocation();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about eGrocify Reseller Center
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* FAQ Item 1 */}
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                What is eGrocify Reseller Center?
              </h3>
              <p className="text-muted-foreground">
                It's Pakistan's first AI-powered dropshipping platform for reselling premium products (mainly phone cases and accessories). The AI handles the entire workflow automatically — from product selection to selling within set periods (e.g., auto-sold in 30 days in some models), fulfillment, and payouts. You don't need to build/customize a store, market products yourself, manage stock, or deal with shipping. Sign up for free at seller.egrocify.com.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                How do I join and is it free?
              </h3>
              <p className="text-muted-foreground">
                Yes — completely free to create a Basic account. Just visit seller.egrocify.com, sign up (quick process), and start. No upfront fees, inventory investment, or limits mentioned. It's beginner-friendly for anyone in Pakistan (influencers, TikTokers, marketers, or side-hustlers).
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Who is this for?
              </h3>
              <p className="text-muted-foreground">
                Perfect for people in Pakistan wanting passive/semi-automated online income. Over 5,000+ active resellers reportedly use it. Great if you want to resell trending phone accessories without the usual hassle.
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                How does the AI-Automated Workflow work?
              </h3>
              <p className="text-muted-foreground">
                Egrocify uses AI technology to automate dropshipping: You select/access products from their marketplace/catalog (50,000+ items sold claimed), and the system handles the rest — auto-marketing elements, order processing, fulfillment (packing + shipping), and even auto-selling products within timelines in some workflows. Profits go to your wallet instantly or on fast 24/7 payouts. No manual store setup, no customer service for logistics, no shipping management required.
              </p>
            </div>

            {/* FAQ Item 5 */}
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                Do I need to customize a store, market products, or handle shipping?
              </h3>
              <p className="text-muted-foreground">
                No — that's the key benefit. All automation is done via the AI workflow: No store building/customization needed (use their system or promote simply). Marketing is streamlined/minimized (focus on sharing if you want, but AI assists). Shipping, inventory, packing — fully handled by the platform/suppliers. You just onboard, select products/packages, and earn from sales.
              </p>
            </div>

            {/* FAQ Item 6 */}
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                What products can I resell?
              </h3>
              <p className="text-muted-foreground">
                Primarily premium/trending phone accessories: MagSafe clear cases, aesthetic wavy cases, glitter/shimmer cases, diamond/bling cases, silicon protectors, and more for iPhone & Samsung. The catalog features stylish, protective items with discounts (e.g., 28–64% off retail for good margins).
              </p>
            </div>

            {/* FAQ Item 7 */}
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-3">
                <Wallet className="w-5 h-5 text-primary" />
                How much can I earn and how do payouts work?
              </h3>
              <p className="text-muted-foreground">
                Average profit around 15% per sale (platform claims), with potential to scale. Earnings depend on volume — promotions highlight growing income easily. Some packages/models promise products auto-sold in 30 days with instant wallet credits. Fast and easy — 24/7 payouts to your wallet, then withdraw (likely via local methods like bank/JazzCash). Instant profit credits after sales/fulfillment.
              </p>
            </div>

            {/* FAQ Item 8 */}
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                Is there a referral program?
              </h3>
              <p className="text-muted-foreground">
                Yes — refer others to join (via your link), and earn commissions (e.g., up to PKR 5,000 per successful referral, heavily promoted).
              </p>
            </div>

            {/* FAQ Item 9 */}
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                How do I get help and is it beginner-friendly?
              </h3>
              <p className="text-muted-foreground">
                After signup, use the dashboard for support. Or DM/message via their Facebook/Instagram (e.g., @egrocifyresellercenter or Egrocify pages) — they respond actively with video guides and details. Yes — low/no risk (no inventory), local focus (PKR, fast delivery), and AI automation makes it one of the simplest ways to start reselling phone accessories. Ideal for Karachi/Pakistan users wanting automated side income.
              </p>
            </div>
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
      <footer className="bg-muted/50 border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 mb-8 text-sm md:text-base text-muted-foreground">
            <Link href="/terms" className="hover:text-primary transition-colors cursor-pointer">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors cursor-pointer">
              Privacy Policy
            </Link>
            <Link href="/refund" className="hover:text-primary transition-colors cursor-pointer">
              Refund & Return Policy
            </Link>
            {/* Replaced Link with a Button for the Modal */}
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Contact Us
            </button>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} eGrocify. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setIsContactModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full relative text-center border border-border animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-primary" />
            </div>
            
            <h3 className="text-2xl font-bold text-foreground mb-2">Get in Touch</h3>
            <p className="text-muted-foreground mb-6">
              Have questions? Reach out to our support team directly.
            </p>
            
            <div className="bg-muted/50 py-4 px-6 rounded-lg border border-border">
              <a 
                href="tel:03005443718" 
                className="text-2xl font-bold text-primary tracking-wide hover:underline"
              >
                0300 5443718
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Available via Phone & WhatsApp
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
