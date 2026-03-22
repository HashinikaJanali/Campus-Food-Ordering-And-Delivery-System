import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Github, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-4">
              Grab & Go
            </h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Your trusted campus food delivery service. Fast, fresh, and delivered right to your door!
            </p>
            <div className="flex gap-3">
              <SocialIcon href="#" icon={<Facebook />} label="Facebook" />
              <SocialIcon href="#" icon={<Instagram />} label="Instagram" />
              <SocialIcon href="#" icon={<Twitter />} label="Twitter" />
              <SocialIcon href="#" icon={<Github />} label="Github" />
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-bold mb-4 text-orange-400">Quick Links</h4>
            <ul className="space-y-2">
              <FooterLink href="#home">Home</FooterLink>
              <FooterLink href="#menu">Menu</FooterLink>
              <FooterLink href="#rewards">Rewards</FooterLink>
              <FooterLink href="#orders">My Orders</FooterLink>
              <FooterLink href="#about">About Us</FooterLink>
              <FooterLink href="#contact">Contact</FooterLink>
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-bold mb-4 text-orange-400">Support</h4>
            <ul className="space-y-2">
              <FooterLink href="#faq">FAQ</FooterLink>
              <FooterLink href="#help">Help Center</FooterLink>
              <FooterLink href="#terms">Terms & Conditions</FooterLink>
              <FooterLink href="#privacy">Privacy Policy</FooterLink>
              <FooterLink href="#refund">Refund Policy</FooterLink>
              <FooterLink href="#delivery">Delivery Info</FooterLink>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-lg font-bold mb-4 text-orange-400">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                <span>SLIIT Malabe Campus, New Kandy Road, Malabe.</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <a href="tel:+94112345678" className="hover:text-orange-400 transition-colors">
                  +94 11 234 5678
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <a href="mailto:support@grabandgo.lk" className="hover:text-orange-400 transition-colors">
                  support@grabandgo.lk
                </a>
              </li>
            </ul>

            {/* Operating Hours */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h5 className="font-semibold text-orange-400 mb-2">Operating Hours</h5>
              <p className="text-sm text-gray-400">Monday - Friday: 8:00 AM - 8:00 PM</p>
              <p className="text-sm text-gray-400">Saturday: 9:00 AM - 6:00 PM</p>
              <p className="text-sm text-gray-400">Sunday: Closed</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Grab & Go. All rights reserved.
            </p>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              </motion.div>
              <span>for Campus Students</span>
            </div>

            <div className="flex gap-4 text-sm">
              <a href="#sitemap" className="text-gray-400 hover:text-orange-400 transition-colors">
                Sitemap
              </a>
              <a href="#accessibility" className="text-gray-400 hover:text-orange-400 transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Social Icon Component
const SocialIcon = ({ href, icon, label }) => (
  <motion.a
    href={href}
    aria-label={label}
    whileHover={{ scale: 1.1, y: -3 }}
    whileTap={{ scale: 0.95 }}
    className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-orange-500 hover:to-yellow-500 hover:border-transparent transition-all duration-300"
  >
    {icon}
  </motion.a>
);

// Footer Link Component
const FooterLink = ({ href, children }) => (
  <li>
    <a
      href={href}
      className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group"
    >
      <span className="group-hover:translate-x-1 transition-transform">{children}</span>
    </a>
  </li>
);

export default Footer;