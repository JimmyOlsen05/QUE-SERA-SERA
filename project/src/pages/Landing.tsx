import { Link } from 'react-router-dom';
import { Users, MessageSquare, BookOpen, Globe2, ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "African Student Network",
      description: "Connect with fellow African students and share cultural experiences.",
      image: "https://uct.ac.za/sites/default/files/media/images/uct_ac_za/study-at-uct-section-image.jpg",
      alt: "African students collaborating"
    },
    {
      title: "Asian Academic Community",
      description: "Join a thriving community of Asian students across campus.",
      image: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg",
      alt: "Asian students studying"
    },
    {
      title: "European Student Exchange",
      description: "Connect with European students and explore cultural diversity.",
      image: "https://images.pexels.com/photos/6147369/pexels-photo-6147369.jpeg",
      alt: "European students on campus"
    },
    {
      title: "Latin American Unidos",
      description: "Be part of the vibrant Latin American student community.",
      image: "https://images.pexels.com/photos/8199562/pexels-photo-8199562.jpeg",
      alt: "Latin American students"
    },
    {
      title: "Global Connections",
      description: "Experience true diversity with students from around the world.",
      image: "https://uct.ac.za/sites/default/files/styles/slide_full_width/public/media/images/uct_ac_za/chemical_engineering.webp?h=8d924784&itok=jN7tAH4q",
      alt: "Multicultural student group"
    }
  ];
  
  

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000); // Changed to 7 seconds for slower transitions

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed z-50 w-full shadow-sm backdrop-blur-md bg-white/80">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">UniConnect</Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden items-center space-x-8 md:flex">
              <Link to="/features" className="text-gray-600 transition-colors hover:text-indigo-600">Features</Link>
              <Link to="/about" className="text-gray-600 transition-colors hover:text-indigo-600">About</Link>
              <Link to="/contact" className="text-gray-600 transition-colors hover:text-indigo-600">Contact</Link>
              <Link
                to="/register"
                className="px-4 py-2 text-white bg-indigo-600 rounded-md transition-colors hover:bg-indigo-700"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 transition-colors hover:text-indigo-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute w-full bg-white border-b md:hidden animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/features"
                className="block px-3 py-2 text-gray-600 rounded-md transition-colors hover:text-indigo-600 hover:bg-indigo-50"
              >
                Features
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-gray-600 rounded-md transition-colors hover:text-indigo-600 hover:bg-indigo-50"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-gray-600 rounded-md transition-colors hover:text-indigo-600 hover:bg-indigo-50"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="overflow-hidden relative pt-16">
        <div className="absolute inset-0 opacity-5 bg-grid-pattern" />
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <div className="px-4 mx-auto mt-10 max-w-7xl sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:flex sm:justify-center mb-12 opacity-0 animate-slide-up [animation-delay:600ms]">
                <div className="rounded-md shadow">
                  <Link
                    to="/register"
                    className="flex justify-center items-center px-8 py-3 w-full text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md border border-transparent transition transform hover:from-indigo-700 hover:to-purple-700 md:py-4 md:text-lg md:px-10 hover:scale-105"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    to="/login"
                    className="flex justify-center items-center px-8 py-3 w-full text-base font-medium text-indigo-600 bg-indigo-100 rounded-md border border-transparent transition-colors hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                  >
                    Sign in
                  </Link>
                </div>
              </div>

              <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                {/* Text Content */}
                <div className="lg:col-span-6">
                  <div className="relative h-40 sm:h-48">
                    {slides.map((slide, index) => (
                      <div
                        key={index}
                        className={`
                          absolute w-full transition-all duration-1000 transform
                          ${index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}
                        `}
                      >
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 xl:inline">
                            {slide.title}
                          </span>
                        </h1>
                        <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl md:mt-5 md:text-xl">
                          {slide.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Content */}
                <div className="mt-10 lg:col-span-6 lg:mt-0">
                  <div className="relative h-64 sm:h-72 md:h-96">
                    {slides.map((slide, index) => (
                      <div
                        key={index}
                        className={`
                          absolute w-full h-full transition-all duration-1000 transform
                          ${index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
                        `}
                      >
                        <img
                          className="object-cover w-full h-full rounded-xl shadow-lg"
                          src={slide.image}
                          alt={slide.alt}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Slide Indicators */}
                  <div className="flex justify-center mt-4 space-x-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide ? 'bg-indigo-600 w-4' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hidden justify-center mt-8 animate-bounce md:flex">
        <ChevronDown className="w-6 h-6 text-indigo-600" />
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base font-semibold tracking-wide text-indigo-600 uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight leading-8 text-gray-900 sm:text-4xl">
              Everything you need to connect
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              UniConnect provides all the tools you need to build meaningful connections and collaborate with your peers.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div 
                  key={feature.name}
                  className="relative transition-all duration-300 transform group hover:-translate-y-1"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-25 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />
                  <div className="flex relative flex-col items-center p-6 leading-none bg-white rounded-lg ring-1 ring-gray-900/5">
                    <div className="flex justify-center items-center mb-4 w-12 h-12 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md transition-transform transform group-hover:rotate-6">
                      {feature.icon}
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">{feature.name}</h3>
                    <p className="text-center text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div className="transition-transform transform hover:scale-105">
              <div className="text-4xl font-bold text-indigo-600">10k+</div>
              <div className="text-gray-500">Active Users</div>
            </div>
            <div className="transition-transform transform hover:scale-105">
              <div className="text-4xl font-bold text-indigo-600">50+</div>
              <div className="text-gray-500">Universities</div>
            </div>
            <div className="transition-transform transform hover:scale-105">
              <div className="text-4xl font-bold text-indigo-600">1k+</div>
              <div className="text-gray-500">Study Groups</div>
            </div>
            <div className="transition-transform transform hover:scale-105">
              <div className="text-4xl font-bold text-indigo-600">100k+</div>
              <div className="text-gray-500">Messages Sent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 transition-colors hover:text-gray-500">About</a>
            <a href="#" className="text-gray-400 transition-colors hover:text-gray-500">Privacy</a>
            <a href="#" className="text-gray-400 transition-colors hover:text-gray-500">Terms</a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-base text-center text-gray-400">
              &copy; 2024 UniConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    name: 'Connect with Peers',
    description: 'Find and connect with students from your university and courses.',
    icon: <Users className="w-6 h-6" />
  },
  {
    name: 'Real-time Chat',
    description: 'Communicate instantly with your friends and study groups.',
    icon: <MessageSquare className="w-6 h-6" />
  },
  {
    name: 'Study Groups',
    description: 'Create or join study groups for better collaboration.',
    icon: <BookOpen className="w-6 h-6" />
  },
  {
    name: 'Campus Updates',
    description: 'Stay informed about the latest events and news on campus.',
    icon: <Globe2 className="w-6 h-6" />
  }
]; 