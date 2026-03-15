import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Calendar, 
  Users, 
  MapPin, 
  Mail,
  Edit,
  Save,
  X,
  Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { api, user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      
      if (response.data.success) {
        const data = response.data.data;
        setProfileData(data.user);
        setUserEvents(data.userEvents);
        setRegisteredEvents(data.registeredEvents);
        
        // Set form values
        setValue('name', data.user.name);
        setValue('email', data.user.email);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await api.put('/users/profile', {
        name: data.name,
        avatar: data.avatar
      });

      if (response.data.success) {
        setProfileData(response.data.data.user);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setValue('name', profileData.name);
    setValue('email', profileData.email);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velvet-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h2>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-velvet-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            My Profile
          </h1>
          <p className="text-xl text-velvet-100">
            Manage your account and view your activity
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-velvet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-velvet-600" />
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-2 right-2 p-2 bg-velvet-600 text-white rounded-full hover:bg-velvet-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {!isEditing ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {profileData.name}
                    </h2>
                    <p className="text-gray-600 mb-4">{profileData.email}</p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <span className="px-3 py-1 bg-velvet-100 text-velvet-700 rounded-full">
                        {profileData.role}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-6 flex items-center space-x-2 px-4 py-2 bg-velvet-600 text-white rounded-lg hover:bg-velvet-700 transition-colors mx-auto"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        {...register('name', {
                          required: 'Name is required',
                          minLength: {
                            value: 2,
                            message: 'Name must be at least 2 characters',
                          },
                        })}
                        type="text"
                        className="input-field"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="input-field bg-gray-100"
                        disabled
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                        Avatar URL (Optional)
                      </label>
                      <input
                        {...register('avatar')}
                        type="url"
                        className="input-field"
                        placeholder="Enter avatar image URL"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-velvet-600 text-white rounded-lg hover:bg-velvet-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-velvet-600" />
                    <span className="text-gray-700">Events Created</span>
                  </div>
                  <span className="font-semibold text-gray-900">{userEvents.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-velvet-600" />
                    <span className="text-gray-700">Events Attending</span>
                  </div>
                  <span className="font-semibold text-gray-900">{registeredEvents.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Events */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">My Events</h3>
              
              {userEvents.length > 0 ? (
                <div className="space-y-4">
                  {userEvents.map((event) => (
                    <div key={event._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${event.bannerImage}`}
                          alt={event.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {event.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                            {event.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{event.attendeeCount} attending</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No events yet</h4>
                  <p className="text-gray-600 mb-4">You haven't created any events yet.</p>
                  <a
                    href="/create-event"
                    className="btn-primary"
                  >
                    Create Your First Event
                  </a>
                </div>
              )}
            </div>

            {/* Registered Events */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Events I'm Attending</h3>
              
              {registeredEvents.length > 0 ? (
                <div className="space-y-4">
                  {registeredEvents.map((event) => (
                    <div key={event._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${event.bannerImage}`}
                          alt={event.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {event.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                            {event.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{event.attendeeCount} attending</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No registered events</h4>
                  <p className="text-gray-600 mb-4">You haven't registered for any events yet.</p>
                  <a
                    href="/explore"
                    className="btn-primary"
                  >
                    Explore Events
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
