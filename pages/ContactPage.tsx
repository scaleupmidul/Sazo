
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useAppStore } from '../store';

const ContactPage: React.FC = () => {
  const { addContactMessage, notify, settings, loading } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
        notify('Please fill in all fields.', 'error');
        return;
    }

    setIsSubmitting(true);
    try {
      await addContactMessage(formData);
      notify('Message sent successfully!', 'success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      notify('Failed to send message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
      return (
          <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 animate-pulse">
              <div className="h-10 bg-stone-200 rounded w-48 mx-auto mb-12"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="h-64 bg-stone-200 rounded-xl"></div>
                  <div className="h-64 bg-stone-200 rounded-xl"></div>
              </div>
          </main>
      )
  }

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-8 sm:mb-12 text-center">Get in Touch</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-stone-100">
            <h3 className="text-2xl font-bold text-stone-800 mb-6">Contact Information</h3>
            <div className="space-y-6">
                {settings?.contactAddress && (
                    <div className="flex items-start space-x-4">
                        <div className="bg-pink-50 p-3 rounded-full">
                            <MapPin className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-stone-900">Address</p>
                            <p className="text-stone-600">{settings.contactAddress}</p>
                        </div>
                    </div>
                )}
                
                {settings?.contactPhone && (
                    <div className="flex items-start space-x-4">
                         <div className="bg-pink-50 p-3 rounded-full">
                            <Phone className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-stone-900">Phone</p>
                            <p className="text-stone-600">{settings.contactPhone}</p>
                        </div>
                    </div>
                )}

                {settings?.contactEmail && (
                    <div className="flex items-start space-x-4">
                         <div className="bg-pink-50 p-3 rounded-full">
                            <Mail className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-stone-900">Email</p>
                            <p className="text-stone-600">{settings.contactEmail}</p>
                        </div>
                    </div>
                )}
            </div>
          </div>
          
          <div className="bg-pink-600 text-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold mb-2">Business Hours</h3>
              <p className="opacity-90 mb-4">We are available to assist you during these times:</p>
              <div className="space-y-2 font-medium">
                  <p>Sunday - Thursday: 10:00 AM - 8:00 PM</p>
                  <p>Friday: 2:00 PM - 8:00 PM</p>
                  <p>Saturday: Closed</p>
              </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-stone-100">
          <h3 className="text-2xl font-bold text-stone-800 mb-6">Send us a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-stone-300 rounded-lg focus:ring-pink-600 focus:border-pink-600 transition bg-white text-black"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-stone-300 rounded-lg focus:ring-pink-600 focus:border-pink-600 transition bg-white text-black"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full p-3 border border-stone-300 rounded-lg focus:ring-pink-600 focus:border-pink-600 transition bg-white text-black"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink-600 text-white font-bold py-3.5 rounded-lg hover:bg-pink-700 transition duration-300 shadow-md flex items-center justify-center space-x-2 active:scale-95 disabled:bg-pink-400"
            >
              <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              {!isSubmitting && <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
