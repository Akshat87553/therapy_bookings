import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    interest: 'mat-pilates'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to a server
    alert('Thanks for your message! We\'ll get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
      interest: 'mat-pilates'
    });
  };

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto text-center mb-16" data-aos="fade-up" data-aos-duration="1000">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Get In <span className="text-green-600">Touch</span>
          </h2>
          <div className="w-20 h-1 bg-green-600 mx-auto mb-8"></div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Have questions or ready to start your Pilates journey? Contact us today to learn more about our classes or to schedule your first session.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row max-w-6xl mx-auto">
          <div className="lg:w-2/5 mb-12 lg:mb-0" data-aos="fade-right" data-aos-duration="1000">
            <div className="bg-white rounded-lg shadow-md p-8 h-full">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <MapPin className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Studio Location</h4>
                    <p className="text-gray-600">123 Wellness Way, Fitness District<br />New York, NY 10001</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Mail className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Email Us</h4>
                    <a href="mailto:info@purepilates.com" className="text-green-600 hover:underline">info@purepilates.com</a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Phone className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Call Us</h4>
                    <a href="tel:+12125551234" className="text-green-600 hover:underline">(212) 555-1234</a>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-medium text-gray-800 mb-3">Studio Hours</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>6:00 AM - 9:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span>9:00 AM - 2:00 PM</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="lg:w-3/5 lg:pl-12" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="200">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h3>
              
              <div className="mb-6">
                <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="interest" className="block text-gray-700 mb-2">I'm Interested In</label>
                <select
                  id="interest"
                  name="interest"
                  value={formData.interest}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="mat-pilates">Mat Pilates</option>
                  <option value="reformer-pilates">Reformer Pilates</option>
                  <option value="clinical-pilates">Clinical Pilates</option>
                  <option value="prenatal-pilates">Prenatal Pilates</option>
                  <option value="private-sessions">Private Sessions</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tell us about your goals or any questions you have..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
        {/* Flower divider */}
        <div className="mt-16 flex items-center justify-center" data-aos="fade-up" data-aos-duration="1000">
          <div className="flex-grow border-t border-gray-300"></div>
          <div className="mx-4 text-green-600 animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              fill="currentColor"
              className="w-8 h-8"
            >
              {/* Center circle */}
              <circle cx="32" cy="32" r="6" />
              {/* Petals */}
              <path d="M32 12c-4 0-8 4-8 8s4 8 8 8 8-4 8-8-4-8-8-8z" />
              <path d="M12 32c0-4 4-8 8-8s8 4 8 8-4 8-8 8-8-4-8-8z" />
              <path d="M32 52c-4 0-8-4-8-8s4-8 8-8 8 4 8 8-4 8-8 8z" />
              <path d="M52 32c0-4-4-8-8-8s-8 4-8 8 4 8 8 8 8-4 8-8z" />
              <path d="M20 20c-3-3-6-3-8 0s-3 6 0 8 6 3 8 0 3-6 0-8z" />
            </svg>
          </div>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
      </div>
    </section>
  );
};

export default Contact;