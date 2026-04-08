import React, { useState, useEffect } from 'react';
import { ArrowRight, BarChart2, Shield, Clock, Zap, Database, Brain, MessageSquare, ChevronRight, ExternalLink, Star, Users } from 'lucide-react';

const GlassmorphicLandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/80 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">DataSynth</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-sm font-medium hover:text-white transition-colors">Services</a>
              <a href="#" className="text-sm font-medium hover:text-white transition-colors">Process</a>
              <a href="#" className="text-sm font-medium hover:text-white transition-colors">Case Studies</a>
              <a href="#" className="text-sm font-medium hover:text-white transition-colors">About</a>
            </div>
            <button className="hidden md:block px-5 py-2 rounded-full bg-gray-800 border border-gray-700 backdrop-blur-sm bg-opacity-50 hover:bg-gray-700 transition-all">
              <span className="text-sm font-medium">Contact Us</span>
            </button>
            <button className="md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">You don't understand</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">your data.</span>
                <span className="block text-white mt-2">We can help.</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-xl">
                Transform chaotic information into strategic insights that drive business growth and competitive advantage.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="px-8 py-3 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 text-gray-900 font-semibold hover:opacity-90 transition-opacity">
                  Get Started
                </button>
                <button className="px-8 py-3 rounded-full border border-gray-600 backdrop-blur-sm hover:bg-gray-800/50 transition-colors flex items-center justify-center">
                  <span className="mr-2">Case Studies</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-12 flex items-center">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-${(i+3)*100}`}></div>
                  ))}
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-400">Trusted by <span className="font-medium text-white">200+</span> innovative companies</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden backdrop-blur-lg border border-gray-800 bg-gray-900/30 p-1">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl transform rotate-3 scale-105 -z-10"></div>
                <div className="h-full w-full rounded-xl overflow-hidden bg-gray-900 relative">
                  <div className="absolute top-0 left-0 right-0 h-12 bg-gray-800 flex items-center px-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                    </div>
                    <div className="mx-auto px-16 py-1 bg-gray-700 rounded-full text-xs text-gray-400">dashboard.datasynth.ai</div>
                  </div>
                  <div className="pt-12 p-4 h-full">
                    <div className="grid grid-cols-2 gap-4 h-full">
                      <div className="col-span-2 bg-gray-800 rounded-lg p-4 h-40">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-medium">Customer Retention Overview</h3>
                          <div className="flex space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-end h-20 space-x-2">
                          {[40, 55, 35, 80, 65, 75, 90].map((height, i) => (
                            <div key={i} className="flex-1 h-full flex flex-col justify-end">
                              <div className={`w-full bg-gradient-to-t from-gray-500 to-gray-400 rounded-sm`} style={{ height: `${height}%` }}></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-4">Conversion Rate</h3>
                        <div className="flex flex-col items-center justify-center h-32">
                          <div className="relative w-24 h-24">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-gray-400 border-l-transparent" style={{ transform: 'rotate(45deg)' }}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold">74%</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">+12% from last month</p>
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-4">User Sentiment</h3>
                        <div className="space-y-2 mt-6">
                          {['Positive', 'Neutral', 'Negative'].map((label, i) => (
                            <div key={i} className="flex items-center">
                              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div className={`bg-gray-${i === 0 ? '400' : i === 1 ? '500' : '600'} h-full rounded-full`} style={{ width: i === 0 ? '70%' : i === 1 ? '20%' : '10%' }}></div>
                              </div>
                              <span className="ml-2 text-xs text-gray-400 w-16">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clients */}
      <div className="py-12 border-t border-b border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-50">
            {['ACME', 'TechCorp', 'Innovate', 'FutureLabs', 'DataFlow', 'Quantum'].map((client, i) => (
              <div key={i} className="text-center">
                <p className="font-semibold tracking-widest text-xl">{client}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Offerings */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Transform your data into strategic advantages</h2>
            <p className="text-gray-400">Our data solutions unlock hidden patterns and actionable insights, helping you make smarter business decisions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-6 h-6" />,
                title: "Customer Retention",
                description: "Develop strategies to prevent churn and boost long-term user retention by understanding and responding to customer needs."
              },
              {
                icon: <BarChart2 className="w-6 h-6" />,
                title: "Conversion Optimization",
                description: "Identify points of drop-off in the sales funnel to boost conversion rates and maximize your marketing ROI."
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: "Voice of the Customer",
                description: "Transform qualitative feedback into quantitative insights for data-driven product development."
              },
              {
                icon: <Database className="w-6 h-6" />,
                title: "Data Infrastructure",
                description: "Review existing data infrastructure and suggest improvements for scalability and effectiveness."
              },
              {
                icon: <MessageSquare className="w-6 h-6" />,
                title: "Qualitative Analysis",
                description: "Gather qualitative insights and convert them into measurable, actionable quantitative data points."
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Data Ownership",
                description: "Avoid lock-in by enabling clients to maintain full control of their data and infrastructure."
              }
            ].map((service, i) => (
              <div key={i} className="group">
                <div className="p-8 rounded-2xl border border-gray-800 backdrop-blur-sm bg-gray-900/30 h-full transition-all group-hover:bg-gray-800/50 group-hover:border-gray-700">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-6 group-hover:bg-gray-700 transition-colors">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                  <p className="text-gray-400 mb-6">{service.description}</p>
                  <button className="flex items-center text-gray-300 text-sm font-medium group-hover:text-white transition-colors">
                    <span>Learn more</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process */}
      <div className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our proven process</h2>
            <p className="text-gray-400">We follow a systematic approach to unlock the full potential of your data.</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-800 hidden md:block"></div>
            
            {[
              {
                number: "01",
                title: "Discovery & Assessment",
                description: "We start by understanding your business goals, current data landscape, and key challenges.",
                icon: <Brain className="w-5 h-5" />
              },
              {
                number: "02",
                title: "Strategy Development",
                description: "Our team designs a tailored data strategy that aligns with your business objectives.",
                icon: <BarChart2 className="w-5 h-5" />
              },
              {
                number: "03",
                title: "Implementation",
                description: "We build and integrate the solution into your workflows with minimal disruption.",
                icon: <Zap className="w-5 h-5" />
              },
              {
                number: "04",
                title: "Optimization & Support",
                description: "Continuous refinement ensures your data solutions evolve with your business needs.",
                icon: <Clock className="w-5 h-5" />
              }
            ].map((step, i) => (
              <div key={i} className={`flex flex-col md:flex-row md:items-center py-8 relative ${i % 2 === 0 ? 'md:justify-end' : ''}`}>
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full border-4 border-gray-800 bg-gray-900 z-10"></div>
                <div className={`md:w-5/12 ${i % 2 === 0 ? 'md:pr-16' : 'md:pl-16 md:order-1'}`}>
                  <div className="backdrop-blur-sm bg-gray-900/30 border border-gray-800 p-8 rounded-2xl">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mr-4">
                        {step.icon}
                      </div>
                      <span className="text-xl font-bold text-gray-400">{step.number}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">What our clients say</h2>
            <p className="text-gray-400">Leaders trust our data expertise to transform their businesses.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "Their team transformed our chaotic data into clear, actionable insights that drove a 32% increase in customer retention.",
                author: "Sarah Johnson",
                role: "CTO at TechNova",
                rating: 5
              },
              {
                quote: "The data infrastructure they built has scaled seamlessly with our growth from startup to enterprise.",
                author: "Michael Chen",
                role: "Head of Product at ScaleUp",
                rating: 5
              },
              {
                quote: "DataSynth's qualitative analysis revealed customer pain points we never knew existed. Game-changing insights.",
                author: "Priya Sharma",
                role: "VP of Customer Success at GrowthBox",
                rating: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="backdrop-blur-sm bg-gray-900/30 border border-gray-800 p-8 rounded-2xl h-full">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-gray-400 fill-gray-400" />
                  ))}
                </div>
                <p className="text-lg mb-6 text-gray-300">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-800 mr-4"></div>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden backdrop-blur-md border border-gray-800 bg-gray-900/30">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
            </div>
            <div className="p-12 md:p-20 text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to unlock the power of your data?</h2>
              <p className="text-gray-400 text-lg md:text-xl mb-10">
                Let's transform your data into your most valuable strategic asset.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="px-8 py-4 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 text-gray-900 font-semibold hover:opacity-90 transition-opacity">
                  Schedule a Discovery Call
                </button>
                <button className="px-8 py-4 rounded-full border border-gray-600 backdrop-blur-sm hover:bg-gray-800/50 transition-colors flex items-center justify-center">
                  <span className="mr-2">View Case Studies</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">DataSynth</span>
              </div>
              <p className="text-gray-400 mb-6">
                Transforming data chaos into strategic clarity.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'linkedin', 'github', 'dribble'].map((social, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-gray-800 transition-colors">
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-gray-500 rounded-full"></div>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-6">Services</h3>
              <ul className="space-y-3">
                {['Customer Retention', 'Conversion Optimization', 'Data Infrastructure', 'Voice of Customer', 'Qualitative Analysis'].map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6">Company</h3>
              <ul className="space-y-3">
                {['About Us', 'Case Studies', 'Blog', 'Careers', 'Contact'].map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6">Newsletter</h3>
              <p className="text-gray-400 mb-4">Stay updated with the latest in data science.</p>
              <div className="flex">
                <input type="email" placeholder="Your email" className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-gray-600 w-full" />
                <button className="px-4 py-2 bg-gray-700 border border-gray-700 rounded-r-lg hover:bg-gray-600 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>© 2025 DataSynth. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add extra CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default GlassmorphicLandingPage;