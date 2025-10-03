import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/4 mb-8 md:mb-0">
            <h2 className="text-2xl font-medium mb-6">TheraSync</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Transform your body and mind through the power of Pilates. Join our community 
              and experience the benefits of controlled movement and mindful exercise.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-indigo-400 transition-colors duration-300">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-indigo-400 transition-colors duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-indigo-400 transition-colors duration-300">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div className="w-full sm:w-1/2 md:w-1/4 mb-8 md:mb-0">
            <h3 className="text-lg font-medium mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['about', 'classes', 'instructors', 'testimonials', 'faq', 'contact'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item}`} 
                    className="text-gray-400 hover:text-white transition-colors duration-300 capitalize"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="w-full sm:w-1/2 md:w-1/4 mb-8 md:mb-0">
            <h3 className="text-lg font-medium mb-6">Our Classes</h3>
            <ul className="space-y-3">
              {['Mat Pilates', 'Reformer Pilates', 'Clinical Pilates', 'Prenatal Pilates', 'Private Sessions'].map((item) => (
                <li key={item}>
                  <a 
                    href="#classes" 
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="w-full md:w-1/4">
            <h3 className="text-lg font-medium mb-6">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for tips, class updates, and special offers.
            </p>
            <form className="mb-4">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-gray-800 text-white px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-r-md transition-colors duration-300"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} PurePilates. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;