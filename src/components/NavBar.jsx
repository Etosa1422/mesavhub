import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Zap, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const navLinks = [
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "FAQ", path: "/faq" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setShowNavbar(true), 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const scrollToLogin = () => {
    const el = document.getElementById("login-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSignInClick = (e) => {
    e.preventDefault();
    closeMenu();
    if (location.pathname === "/") {
      scrollToLogin();
    } else {
      navigate("/", { replace: false });
      setTimeout(() => scrollToLogin(), 400);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transform transition-all duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      } ${
        scrolled
          ? "bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-gray-200 dark:border-brand-900/30 shadow-sm dark:shadow-brand-950/20"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            Mesav<span className="text-brand-500 dark:text-brand-400">hub</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ name, path }) => (
            <Link
              key={name}
              to={path}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium transition-colors duration-200"
            >
              {name}
            </Link>
          ))}
          <a
            href="/login"
            onClick={handleSignInClick}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium transition-colors duration-200 cursor-pointer"
          >
            Sign In
          </a>
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-brand-400 hover:text-brand-500 dark:hover:text-brand-400 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            to="/signup"
            className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-lg shadow-brand-600/20"
          >
            Get Started
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 transition-all"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleMenu}
            className="text-gray-700 dark:text-white text-2xl focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white dark:bg-[#0f0f1a] border-t border-gray-100 dark:border-brand-900/30 px-6 py-6 space-y-4"
          >
            {navLinks.map(({ name, path }) => (
              <Link
                key={name}
                to={path}
                onClick={closeMenu}
                className="block text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-base font-medium py-2 transition-colors"
              >
                {name}
              </Link>
            ))}
            <a
              href="#login-section"
              onClick={handleSignInClick}
              className="block text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-base font-medium py-2 transition-colors cursor-pointer"
            >
              Sign In
            </a>
            <Link
              to="/signup"
              onClick={closeMenu}
              className="block w-full text-center bg-brand-600 hover:bg-brand-500 text-white px-4 py-3 rounded-full font-semibold transition-all duration-200"
            >
              Get Started Free
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;