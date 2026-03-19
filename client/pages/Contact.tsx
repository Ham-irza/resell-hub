import React from "react";
import { Header } from "@/components/Header";
import { Mail, MessageCircle, Clock } from "lucide-react";

export default function Contact() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add form submission logic here later
    console.log("Form submitted");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Need help or have questions about the reseller program? Our team is here for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Methods */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-muted/30 rounded-xl border border-border">
              <Mail className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground text-lg">Email Support</h3>
                <p className="text-muted-foreground mb-2">Drop us a line anytime. We usually reply within 24 hours.</p>
                <a href="mailto:support@egrocify.com" className="text-primary font-medium hover:underline">
                  support@egrocify.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-muted/30 rounded-xl border border-border">
              <MessageCircle className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground text-lg">Social Media</h3>
                <p className="text-muted-foreground mb-2">Send us a direct message on Instagram or Facebook.</p>
                <a href="#" className="text-primary font-medium hover:underline">
                  @egrocifyresellercenter
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-muted/30 rounded-xl border border-border">
              <Clock className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground text-lg">Dashboard Support</h3>
                <p className="text-muted-foreground">
                  Existing users can open a high-priority support ticket directly from the Reseller Dashboard for fastest resolution.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form / Info area */}
          <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6">Send us a message</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}