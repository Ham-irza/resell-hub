import { Header } from "@/components/Header";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>eGrocify collects minimal personal data required to operate our reseller services. This includes your name, email address, phone number, and payment/banking details needed to process withdrawals and maintain your wallet.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Data</h2>
            <p>We use your information strictly to: provide and maintain your account, process transactions, allocate auto-sell inventory, communicate with you regarding your account status, and improve our AI-automated workflows.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Sharing</h2>
            <p>We do not sell, rent, or trade your personal information to third parties. We only share necessary data with trusted service providers, such as secure payment gateways (e.g., Bank Alfalah), purely for the purpose of facilitating your transactions and platform operations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Security</h2>
            <p>We implement industry-standard security measures to protect your financial and personal information. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Your Rights</h2>
            <p>You have the right to access, update, or request the deletion of your personal data stored on our platform. To exercise these rights, please contact our support team through your dashboard.</p>
          </section>

          <p className="text-sm mt-8 pt-8 border-t border-border">Last Updated: March 2026</p>
        </div>
      </main>
    </div>
  );
}