import { Header } from "@/components/Header";
import { AlertTriangle } from "lucide-react";

export default function Refund() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Refund & Return Policy</h1>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm">
            Please read this policy carefully before funding your wallet or purchasing inventory. Due to the automated nature of our system, strict rules apply.
          </p>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">The Auto-Sell Commitment</h2>
            <p>At eGrocify, our platform is designed entirely around an automated ecosystem. When you purchase products for resale, the AI immediately allocates those items, triggers marketing protocols, and begins the fulfillment process on your behalf. Because these wheels are set in motion instantly, reversing the process is highly disruptive to the supply chain.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Strict No-Refund Policy</h2>
            <p>Therefore, <strong>all purchases made on the eGrocify platform are final</strong>. We do not accept returns, process exchanges, or issue refunds once an item has entered the automated workflow. Once capital is deployed into inventory, it must complete its cycle.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Exceptional Circumstances</h2>
            <p>We understand that technology isn't perfect and rare anomalies can occur. If you believe there is a genuine, documented issue—such as a fundamental platform malfunction, an erroneous duplicate charge, or a critical wallet error directly caused by our systems—you may reach out to us.</p>
            <p className="mt-2">We evaluate these claims on a strictly case-by-case basis. Any exceptions made are entirely at our sole discretion. We reserve the right to refuse refund requests that do not meet our internal criteria for exceptional circumstances.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Contacting Us for Disputes</h2>
            <p>If you believe your situation qualifies as an exceptional circumstance, please submit a detailed support ticket through your reseller dashboard or contact us via our standard support channels within 48 hours of the incident.</p>
          </section>
        </div>
      </main>
    </div>
  );
}