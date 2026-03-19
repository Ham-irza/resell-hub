import { Header } from "@/components/Header";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Terms & Conditions</h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>Welcome to eGrocify. By accessing our platform at seller.egrocify.com and using our AI-automated dropshipping and auto-sell services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please refrain from using our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. User Accounts</h2>
            <p>To use our services, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when registering.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Auto-Sell Mechanics & Performance</h2>
            <p>Our platform automates the buying and reselling of goods within an estimated 30-day timeframe. However, any past performance metrics, average profit percentages, or exact timeframes shown on the website are illustrative. They do not constitute a guaranteed financial return or timeline. Market conditions fluctuate, and sales are processed dynamically.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Payments and Earnings</h2>
            <p>Profits and capital are credited to your eGrocify wallet upon successful sale and fulfillment. Withdrawals are processed through Bank Alfalah or other supported local gateways. You are solely responsible for providing accurate banking information for withdrawals.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at our sole discretion, without prior notice, if we believe you have violated these Terms, manipulated our referral program, or engaged in fraudulent activity.</p>
          </section>

          <p className="text-sm mt-8 pt-8 border-t border-border">Last Updated: March 2026</p>
        </div>
      </main>
    </div>
  );
}