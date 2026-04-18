import { Shield, FileText } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By registering for or using Mesavs ("the Platform"), you agree to be legally bound by these Terms and Conditions. If you do not agree, do not use the Platform. We may update these terms at any time; continued use of the Platform constitutes acceptance of the revised terms.`,
  },
  {
    title: "2. Account Registration",
    content: `You must be at least 16 years old to create an account. You agree to provide accurate, complete, and current information during registration. You are responsible for keeping your password confidential and for all activities that occur under your account. Mesavs will not be liable for any loss or damage resulting from unauthorized use of your account.`,
  },
  {
    title: "3. Services & Orders",
    content: `Mesavs provides SMM (Social Media Marketing) services and virtual number verification. Services are described at the time of purchase. Delivery times are estimates and not guarantees. Once an order is placed and begins processing, it cannot be cancelled. Mesavs reserves the right to modify, suspend, or discontinue any service at any time without notice.`,
  },
  {
    title: "4. Payments & Billing",
    content: `All payments are made in advance by topping up your Mesavs balance. Prices are displayed in USD and are subject to change. Third-party payment processors may apply additional fees. By submitting a payment, you authorize Mesavs to charge the specified amount. Disputed payments or chargebacks may result in immediate account suspension.`,
  },
  {
    title: "5. Refund Policy",
    content: `Refunds are only issued in the following cases: a service was not started within the stated delivery window; a service was started but cannot be completed due to a platform change or technical error on our side. Refunds are credited back to your Mesavs account balance. Cash refunds to original payment methods are not offered. No refunds are issued for completed orders.`,
  },
  {
    title: "6. Prohibited Uses",
    content: `You agree not to use Mesavs to: violate any law or regulation; promote illegal activity; spam, harass, or abuse others; attempt to defraud Mesavs or other users; create fake or misleading accounts on any platform; use automation tools against our system; resell services in a way that misrepresents their origin; attempt to reverse-engineer or exploit the platform's API without authorization.`,
  },
  {
    title: "7. API Usage",
    content: `Users who connect via the Mesavs API agree to all terms herein. API keys are personal and must not be shared. Abusive or excessive API usage that impacts platform stability may result in rate limiting or termination. Mesavs is not liable for any third-party integrations or applications built using the API.`,
  },
  {
    title: "8. Intellectual Property",
    content: `All content, branding, code, and design on the Mesavs platform is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without written permission from Mesavs. User-generated content remains the property of the respective user.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `Mesavs provides services "as is" without warranty of any kind. To the maximum extent permitted by law, Mesavs is not liable for any indirect, incidental, special, or consequential damages arising from your use of the platform — including loss of social media accounts, loss of revenue, or data loss. Our total liability to any user for any claim shall not exceed the amount paid in the 30 days prior to the claim.`,
  },
  {
    title: "10. Account Suspension & Termination",
    content: `Mesavs reserves the right to suspend or permanently terminate any account found to be in violation of these terms, engaged in fraudulent activity, or causing harm to the platform or other users. Upon termination, any remaining balance may be forfeited depending on the nature of the violation. You may delete your account at any time from the Account settings.`,
  },
  {
    title: "11. Privacy",
    content: `Your use of Mesavs is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal data. By using the platform, you consent to those practices. We do not sell your personal data to third parties.`,
  },
  {
    title: "12. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms or your use of the Platform shall be resolved through good-faith negotiation or, if necessary, binding arbitration.`,
  },
  {
    title: "13. Contact",
    content: `If you have questions about these Terms and Conditions, please contact us via the Support section in your dashboard, or visit our Contact page.`,
  },
];

const TermsPage = () => (
  <div className="min-h-screen bg-white dark:bg-[#0a0a0f]">
    {/* Hero */}
    <section className="relative pt-28 pb-16 px-6 bg-gradient-to-b from-brand-50 via-white to-white dark:from-[#0a0a0f] dark:via-[#0a0a0f] dark:to-[#0a0a0f]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(22,163,74,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.05)_1px,transparent_1px)] bg-[size:50px_50px] dark:opacity-40" />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-brand-100 dark:bg-brand-950/60 border border-brand-300/60 dark:border-brand-700/40 rounded-full px-4 py-1.5 text-xs text-brand-700 dark:text-brand-400 font-semibold uppercase tracking-widest mb-6">
          <Shield className="w-3.5 h-3.5" />
          Legal
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">Terms &amp; Conditions</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Last updated: July 2025 &nbsp;·&nbsp; Please read these terms carefully before using Mesavs.
        </p>
      </div>
    </section>

    {/* Content */}
    <section className="py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-0">
        {sections.map(({ title, content }, i) => (
          <div key={i} className="group border-b border-gray-100 dark:border-white/5 py-8 first:pt-0">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h2 className="text-gray-900 dark:text-white font-bold text-base mb-2">{title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Footer note */}
    <div className="bg-brand-50 dark:bg-brand-950/20 border-t border-brand-100 dark:border-brand-900/30 py-8 px-6 text-center">
      <p className="text-sm text-brand-700 dark:text-brand-400 max-w-xl mx-auto">
        By continuing to use Mesavs, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
      </p>
    </div>
  </div>
);

export default TermsPage;