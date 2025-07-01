import React, { useState } from 'react';
import { CheckCircle, Info, ChevronRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

type ProfileSection = 'personal' | 'about' | 'qualification' | 'files' | 'fees' | 'availability';

const Profile = () => {
  const [activeSection, setActiveSection] = useState<ProfileSection>('personal');
  
  // Sections with completion status
  const sections = [
    { id: 'personal', label: 'Personal Information', completed: true },
    { id: 'about', label: 'About', completed: true },
    { id: 'qualification', label: 'Qualification & Experience', completed: true },
    { id: 'files', label: 'Files & Documents', completed: true },
    { id: 'fees', label: 'Fees & Payment', completed: true },
    { id: 'availability', label: 'Availability', completed: true }
  ];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {sections.map(section => (
              <button
                key={section.id}
                className={`w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0 text-left ${
                  activeSection === section.id ? 'bg-olive-50' : ''
                }`}
                onClick={() => setActiveSection(section.id as ProfileSection)}
              >
                <div className="flex items-center">
                  <span className={`font-medium ${
                    activeSection === section.id ? 'text-olive-700' : 'text-gray-800'
                  }`}>
                    {section.label}
                  </span>
                  
                  {section.id === activeSection && (
                    <span className="ml-2 inline-block w-1.5 h-1.5 bg-olive-700 rounded-full"></span>
                  )}
                </div>
                
                {section.completed ? (
                  <CheckCircle className="w-5 h-5 text-olive-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
            ))}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm mt-6 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-olive-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-olive-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-olive-700">Your Profile is now complete.</h3>
                <Link to="#preview" className="text-sm text-olive-600 flex items-center mt-1">
                  Show preview
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              Great job! Your profile has all the necessary details now. Click here to see how your profile looks.
            </p>
            
            <button className="mt-6 w-full bg-olive-600 text-white py-2 px-4 rounded-md hover:bg-olive-700 transition-colors">
              SAVE CHANGES
            </button>
            
            <button className="mt-2 w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
              <Eye className="w-4 h-4 mr-2" />
              <span>Preview</span>
            </button>
          </div>
        </div>
        
        <div className="md:col-span-2">
          {activeSection === 'personal' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-6">Personal Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-500"
                    defaultValue="Nainika Makhija"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-500"
                    defaultValue="nainika.m@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-500"
                    defaultValue="+91 9876543210"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-500"
                    defaultValue="Safdarjung, Delhi"
                  />
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'fees' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-6">Fees & Payment</h3>
              
              <div className="flex items-start mb-6">
                <div className="w-full">
                  <h4 className="text-sm text-gray-600 mb-2">Online Packages</h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div></div>
                    <div className="text-center">
                      <span className="block text-sm font-medium text-gray-700">30 min Sessions</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-sm font-medium text-gray-700">50 min Sessions</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <span className="block text-sm text-gray-600">Per Session Price</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        defaultValue="900"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        defaultValue="1800"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <span className="block text-sm text-gray-600">Single Session</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <input type="checkbox" className="w-5 h-5 text-olive-600" defaultChecked />
                    </div>
                    <div className="flex items-center justify-center">
                      <input type="checkbox" className="w-5 h-5 text-olive-600" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <span className="block text-sm text-gray-600">6 Paid + 1 Free Package</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <input type="checkbox" className="w-5 h-5 text-olive-600" defaultChecked />
                    </div>
                    <div className="flex items-center justify-center">
                      <input type="checkbox" className="w-5 h-5 text-olive-600" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-sm text-gray-600 mb-4">Additional Services</h4>
                
                <div className="flex items-center">
                  <input type="checkbox" className="w-5 h-5 text-olive-600" />
                  <label className="ml-2 text-sm text-gray-700">I also offer Couple's Therapy</label>
                </div>
              </div>
            </div>
          )}
          
          {/* Other sections would be implemented similarly */}
          {(activeSection !== 'personal' && activeSection !== 'fees') && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-6">
                {sections.find(s => s.id === activeSection)?.label}
              </h3>
              
              <div className="flex items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    This section would contain the {activeSection} settings and options.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;