import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  ArrowRight,
  Search,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events?limit=6`);
        const data = await response.json();
        if (data.success) {
          setFeaturedEvents(data.data.events);
        }
      } catch (error) {
        console.error('Error fetching featured events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Easy Event Creation",
      description: "Create and manage events with our intuitive interface in minutes"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Discover Events",
      description: "Find exciting events happening around you with smart search and filters"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Attendee Management",
      description: "Track registrations and manage attendees effortlessly"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Your data is safe with enterprise-grade security measures"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized performance for smooth event management experience"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Analytics & Insights",
      description: "Get detailed analytics about your events and attendees"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-velvet-600 via-purple-600 to-velvet-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Discover Amazing Events
              <span className="block text-3xl md:text-5xl mt-2 text-velvet-200">
                Create Unforgettable Moments
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-velvet-100 max-w-3xl mx-auto">
              Join Velvet Venue - the ultimate platform for event organizers and attendees. 
              From workshops to conferences, find your next experience here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/explore"
                    className="px-8 py-3 bg-white text-velvet-600 rounded-lg font-semibold hover:bg-velvet-50 transition-all duration-200 transform hover:scale-105"
                  >
                    Explore Events
                  </Link>
                  <Link
                    to="/create-event"
                    className="px-8 py-3 bg-velvet-800 text-white rounded-lg font-semibold hover:bg-velvet-900 transition-all duration-200 transform hover:scale-105"
                  >
                    Create Event
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="px-8 py-3 bg-white text-velvet-600 rounded-lg font-semibold hover:bg-velvet-50 transition-all duration-200 transform hover:scale-105"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/explore"
                    className="px-8 py-3 bg-velvet-800 text-white rounded-lg font-semibold hover:bg-velvet-900 transition-all duration-200 transform hover:scale-105"
                  >
                    Browse Events
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 fill-white" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Velvet Venue?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of event management with our powerful features designed for both organizers and attendees.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-velvet-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-velvet-200 transition-colors">
                  <div className="text-velvet-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured Events
              </h2>
              <p className="text-xl text-gray-600">
                Discover trending events in your area
              </p>
            </div>
            <Link
              to="/explore"
              className="flex items-center space-x-2 text-velvet-600 hover:text-velvet-700 font-semibold"
            >
              <span>View All Events</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <div key={event._id} className="card card-hover">
                  <div className="relative">
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${event.bannerImage}`}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white bg-opacity-90 rounded-full text-xs font-semibold text-velvet-600">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{event.attendeeCount} attending</span>
                      </div>
                    </div>
                    
                    <Link
                      to={`/events/${event._id}`}
                      className="w-full btn-primary text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No events yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to create an amazing event!
              </p>
              {isAuthenticated && (
                <Link to="/create-event" className="btn-primary">
                  Create Your First Event
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-velvet-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Amazing Events?
          </h2>
          <p className="text-xl mb-8 text-velvet-100">
            Join thousands of event organizers who trust Velvet Venue for their events.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-3 bg-white text-velvet-600 rounded-lg font-semibold hover:bg-velvet-50 transition-all duration-200 transform hover:scale-105"
              >
                Sign Up Free
              </Link>
              <Link
                to="/explore"
                className="px-8 py-3 bg-velvet-800 text-white rounded-lg font-semibold hover:bg-velvet-900 transition-all duration-200 transform hover:scale-105"
              >
                Explore Events
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
