import { Stethoscope, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-teal-600 p-2 rounded-lg">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">Book My Doc</span>
            </div>
            <p className="text-sm text-gray-400">
              Your trusted platform for booking appointments with qualified healthcare professionals.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/doctors" className="text-sm hover:text-teal-400 transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link href="/specializations" className="text-sm hover:text-teal-400 transition-colors">
                  Specializations
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-teal-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-teal-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">For Doctors</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/signup?role=doctor" className="text-sm hover:text-teal-400 transition-colors">
                  Join as Doctor
                </Link>
              </li>
              <li>
                <Link href="/doctor/dashboard" className="text-sm hover:text-teal-400 transition-colors">
                  Doctor Dashboard
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm hover:text-teal-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-teal-400" />
                <span>support@bookmydoc.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-teal-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-teal-400 mt-0.5" />
                <span>123 Healthcare Ave,<br />Medical District, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Book My Doc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
