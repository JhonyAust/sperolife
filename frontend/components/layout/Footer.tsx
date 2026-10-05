import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";
import Link from "next/link";
import { Mail, Phone, MapPin, Heart, ExternalLink } from "lucide-react";

export default function Footer() {
  const socialIcons = [
    { 
      icon: <FaFacebookF />, 
      link: "https://www.facebook.com/profile.php?id=61582154486580",
      name: "Facebook",
      color: "hover:bg-blue-600"
    },
    { 
      icon: <FaInstagram />, 
      link: "https://www.instagram.com/sperolife",
      name: "Instagram",
      color: "hover:bg-gradient-to-r hover:from-[#be185d] hover:to-[#FE0002]"
    },
    { 
      icon: <FaTiktok />, 
      link: "https://www.tiktok.com/@sperolife",
      name: "TikTok",
      color: "hover:bg-black"
    },
    { 
      icon: <FaXTwitter />, 
      link: "https://twitter.com/sperolife",
      name: "Twitter/X",
      color: "hover:bg-black"
    },
  ];

  const linkClass =
    "text-gray-600 hover:text-[#FE0002] hover:translate-x-1 inline-block transition-all duration-300";

  return (
    <footer className="bg-white py-12 px-6 sm:px-8   relative overflow-hidden">
      {/* Decorative gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gray-200 "></div>
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #FE0002 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2 sm:px-8 md:px-12 mb-8">
          
          {/* Social Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-[#FE0002] to-[#be185d] rounded-full"></div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-[#FE0002] to-[#be185d] bg-clip-text text-transparent">
                Connect With Us
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Follow us on social media for updates, offers, and more!
            </p>
            <div className="flex gap-3">
              {socialIcons.map((s, i) => (
                <a
                  key={i}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg ${s.color}`}
                  aria-label={s.name}
                >
                  <span className="text-lg relative z-10">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Resources Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-[#be185d] to-[#FE0002] rounded-full"></div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-[#be185d] to-[#FE0002] bg-clip-text text-transparent">
                Resources
              </h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FE0002]/60"></span>
                <Link href="/about" className={linkClass}>
                  About Us
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FE0002]/60"></span>
                <Link href="/contact" className={linkClass}>
                  Contact Us
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FE0002]/60"></span>
                <Link href="/terms" className={linkClass}>
                  Terms & Conditions
                </Link>
              </li>
              {/* <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FE0002]/60"></span>
                <Link href="/privacy" className={linkClass}>
                  Privacy Policy
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Contact Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-[#FE0002] to-[#be185d] rounded-full"></div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-[#FE0002] to-[#be185d] bg-clip-text text-transparent">
                Get In Touch
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3 hover:text-[#FE0002] transition-colors duration-300">
                <Mail className="w-4 h-4 mt-0.5 text-[#FE0002]" />
                <span>sperolifebd@gmail.com</span>
              </li>
              <li className="flex items-start gap-3 hover:text-[#FE0002] transition-colors duration-300">
                <Phone className="w-4 h-4 mt-0.5 text-[#FE0002]" />
                <span>+880 1750-873525</span>
              </li>
              {/* <li className="flex items-start gap-3 hover:text-[#FE0002] transition-colors duration-300">
              <MapPin className="w-4 h-4 mt-1 shrink-0 text-[#FE0002]" />
              <span>Shop: 1/01, 2nd floor, Eastern Banabithi Shopping Complex (10 tola market), Dhaka-1219.</span>
            </li> */}
            </ul>
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#FE0002]/30 to-transparent my-8"></div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 sm:px-8 md:px-12">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600">
              © 2025 <span className="font-semibold text-gray-800">SperoLife</span>. All rights reserved.
            </p>
          </div>

          {/* Developed by */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Developed with</span>
            <Heart className="w-4 h-4 text-[#FE0002] fill-[#FE0002] animate-pulse" />
            <span>by</span>
            <a
              href="https://insynq.net"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 font-semibold bg-gradient-to-r from-[#FE0002] to-[#be185d] bg-clip-text text-transparent hover:from-[#FE0002] hover:to-[#be185d] transition-all duration-300"
            >
              Insynq
              <ExternalLink className="w-3 h-3 text-[#FE0002] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-[#FE0002]/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-[#be185d]/10 rounded-full blur-3xl -z-10"></div>
      </div>
    </footer>
  );
}