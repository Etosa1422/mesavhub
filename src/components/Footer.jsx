import { Link } from "react-router-dom";
import { Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-50 dark:bg-[#0a0a0f] border-t border-gray-200 dark:border-brand-900/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Mesavhub" className="h-24 w-auto" />
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm">
              Your all-in-one platform for social media boosting and all-country number verification. Real results, instant delivery.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 hover:border-brand-400/50 transition-all"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 hover:border-brand-400/50 transition-all"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 hover:border-brand-400/50 transition-all"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              {["Instagram", "TikTok", "YouTube", "Telegram", "WhatsApp"].map(s => (
                <li key={s}><Link to="/services" className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 text-sm transition-colors">{s}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {[["Home", "/"], ["About", "/about"], ["Services", "/services"], ["FAQ", "/faq"], ["Contact", "/contact"], ["Terms", "/terms"], ["Sign Up", "/signup"]].map(([label, path]) => (
                <li key={label}><Link to={path} className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 dark:text-gray-500 text-xs">&copy; {currentYear} Mesavhub. All rights reserved.</p>
          <p className="text-gray-400 dark:text-gray-600 text-xs">Built for creators, marketers &amp; resellers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;