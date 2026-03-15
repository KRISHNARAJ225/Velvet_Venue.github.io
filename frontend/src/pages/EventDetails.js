import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  User,
  Share2,
  Heart,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Ticket,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { api, user, isAuthenticated } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}`);
      
      if (response.data.success) {
        setEvent(response.data.data.event);
        
        // Check if current user is registered
        if (isAuthenticated) {
          const registered = response.data.data.event.attendees.some(
            attendee => attendee.user._id === user.id
          );
          setIsRegistered(registered);
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      if (error.response?.status === 404) {
        toast.error('Event not found');
        navigate('/explore');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. This is a private event.');
        navigate('/explore');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register for this event');
      navigate('/login');
      return;
    }

    try {
      setIsRegistering(true);
      const response = await api.post(`/events/${id}/register`);
      
      if (response.data.success) {
        setIsRegistered(true);
        setEvent(prev => ({
          ...prev,
          attendeeCount: prev.attendeeCount + 1
        }));
        toast.success('Successfully registered for the event!');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      const message = error.response?.data?.message || 'Failed to register for event';
      toast.error(message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async () => {
    try {
      setIsRegistering(true);
      const response = await api.delete(`/events/${id}/unregister`);
      
      if (response.data.success) {
        setIsRegistered(false);
        setEvent(prev => ({
          ...prev,
          attendeeCount: prev.attendeeCount - 1
        }));
        toast.success('Successfully unregistered from the event');
      }
    } catch (error) {
      console.error('Error unregistering from event:', error);
      const message = error.response?.data?.message || 'Failed to unregister from event';
      toast.error(message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await api.delete(`/events/${id}`);
        toast.success('Event deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const shareEvent = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Event link copied to clipboard!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velvet-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
          <Link to="/explore" className="btn-primary">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const isOrganizer = user && event.organizer._id === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative">
        <img
          src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${event.bannerImage}`}
          alt={event.title}
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <Link
              to="/explore"
              className="inline-flex items-center space-x-2 text-white hover:text-velvet-200 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Events</span>
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                  {event.visibility === 'private' && (
                    <span className="px-3 py-1 bg-gray-800 bg-opacity-75 text-white rounded-full text-sm font-medium">
                      Private Event
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {event.title}
                </h1>
                <p className="text-xl text-gray-200 max-w-3xl">
                  {event.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-4 mt-6 md:mt-0">
                <button
                  onClick={shareEvent}
                  className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {isAuthenticated && !isOrganizer && event.visibility === 'public' && (
                  <button
                    onClick={isRegistered ? handleUnregister : handleRegister}
                    disabled={isRegistering || event.isFull}
                    className="px-6 py-3 bg-velvet-600 text-white rounded-lg font-semibold hover:bg-velvet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Ticket className="w-5 h-5" />
                    <span>
                      {isRegistering ? 'Processing...' : isRegistered ? 'Cancel Registration' : 'Register for Event'}
                    </span>
                  </button>
                )}
                {isOrganizer && (
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/edit-event/${event._id}`}
                      className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-all"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={handleDeleteEvent}
                      className="p-3 bg-red-600 bg-opacity-75 backdrop-blur-sm rounded-full text-white hover:bg-opacity-100 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-velvet-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Date</p>
                    <p className="text-gray-600">
                      {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-velvet-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Time</p>
                    <p className="text-gray-600">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-velvet-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-velvet-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Attendees</p>
                    <p className="text-gray-600">
                      {event.attendeeCount} attending
                      {event.maxAttendees && ` (Max: ${event.maxAttendees})`}
                    </p>
                    {event.maxAttendees && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-velvet-600 h-2 rounded-full"
                            style={{ width: `${Math.min((event.attendeeCount / event.maxAttendees) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {event.isFull ? 'Event is full' : `${event.maxAttendees - event.attendeeCount} spots left`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <Tag className="w-5 h-5 text-velvet-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Tags</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {event.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-velvet-100 text-velvet-700 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <div className="prose prose-lg text-gray-600">
                <p>{event.description}</p>
              </div>
            </div>

            {/* Attendees */}
            {event.visibility === 'public' && event.attendees.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Attendees ({event.attendees.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.attendees.map((attendee) => (
                    <div key={attendee.user._id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-velvet-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-velvet-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{attendee.user.name}</p>
                        <p className="text-sm text-gray-500">
                          Registered {format(new Date(attendee.registeredAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-velvet-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-velvet-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{event.organizer.name}</p>
                  <p className="text-sm text-gray-500">Event Organizer</p>
                </div>
              </div>
            </div>

            {/* Registration Status */}
            {isAuthenticated && !isOrganizer && event.visibility === 'public' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Status</h3>
                {isRegistered ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>You are registered for this event</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <XCircle className="w-5 h-5" />
                    <span>You are not registered yet</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={shareEvent}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Event</span>
                </button>
                
                {isAuthenticated && !isOrganizer && event.visibility === 'public' && (
                  <button
                    onClick={isRegistered ? handleUnregister : handleRegister}
                    disabled={isRegistering || event.isFull}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRegistering ? 'Processing...' : isRegistered ? 'Cancel Registration' : 'Register Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
