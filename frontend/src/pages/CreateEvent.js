import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Image as ImageIcon,
  Eye,
  EyeOff,
  X,
  Upload,
  Tag,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateEvent = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const categories = [
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'social', label: 'Social' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data) => {
    if (!selectedFile) {
      toast.error('Please select a banner image');
      return;
    }

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('date', data.date);
    formData.append('time', data.time);
    formData.append('location', data.location);
    formData.append('visibility', isPublic ? 'public' : 'private');
    formData.append('category', data.category);
    formData.append('bannerImage', selectedFile);
    
    if (data.maxAttendees) {
      formData.append('maxAttendees', data.maxAttendees);
    }
    
    if (data.tags) {
      formData.append('tags', data.tags);
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Event created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      const message = error.response?.data?.message || 'Failed to create event';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-velvet-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Create New Event
          </h1>
          <p className="text-xl text-velvet-100">
            Fill in the details to create your amazing event
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Title */}
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    {...register('title', {
                      required: 'Event title is required',
                      minLength: {
                        value: 2,
                        message: 'Title must be at least 2 characters',
                      },
                      maxLength: {
                        value: 100,
                        message: 'Title cannot exceed 100 characters',
                      },
                    })}
                    type="text"
                    className="input-field"
                    placeholder="Enter event title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    {...register('description', {
                      required: 'Description is required',
                      minLength: {
                        value: 10,
                        message: 'Description must be at least 10 characters',
                      },
                      maxLength: {
                        value: 2000,
                        message: 'Description cannot exceed 2000 characters',
                      },
                    })}
                    rows={4}
                    className="input-field"
                    placeholder="Describe your event in detail"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    {...register('category')}
                    className="input-field"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Max Attendees */}
                <div>
                  <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Attendees (Optional)
                  </label>
                  <input
                    {...register('maxAttendees', {
                      min: {
                        value: 1,
                        message: 'Must be at least 1',
                      },
                    })}
                    type="number"
                    className="input-field"
                    placeholder="Leave empty for unlimited"
                  />
                  {errors.maxAttendees && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxAttendees.message}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (Optional)
                  </label>
                  <input
                    {...register('tags')}
                    type="text"
                    className="input-field"
                    placeholder="Enter tags separated by commas (e.g., music, workshop, networking)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate multiple tags with commas
                  </p>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Date and Time</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    {...register('date', {
                      required: 'Event date is required',
                      validate: (value) => {
                        const selectedDate = new Date(value);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return selectedDate > today || 'Event date must be in the future';
                      },
                    })}
                    type="date"
                    className="input-field"
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>

                {/* Time */}
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Time *
                  </label>
                  <input
                    {...register('time', {
                      required: 'Event time is required',
                      pattern: {
                        value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                        message: 'Time must be in HH:MM format',
                      },
                    })}
                    type="time"
                    className="input-field"
                  />
                  {errors.time && (
                    <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Location *
                </label>
                <input
                  {...register('location', {
                    required: 'Event location is required',
                    minLength: {
                      value: 2,
                      message: 'Location must be at least 2 characters',
                    },
                    maxLength: {
                      value: 200,
                      message: 'Location cannot exceed 200 characters',
                    },
                  })}
                  type="text"
                  className="input-field"
                  placeholder="Enter event location"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>
            </div>

            {/* Banner Image */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Banner Image</h2>
              
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-velvet-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload banner image
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Visibility */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Visibility</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="public"
                    type="radio"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    className="h-4 w-4 text-velvet-600 focus:ring-velvet-500 border-gray-300"
                  />
                  <label htmlFor="public" className="ml-3">
                    <div className="flex items-center">
                      <Eye className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Public Event</span>
                        <p className="text-sm text-gray-500">Anyone can find and attend this event</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="private"
                    type="radio"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    className="h-4 w-4 text-velvet-600 focus:ring-velvet-500 border-gray-300"
                  />
                  <label htmlFor="private" className="ml-3">
                    <div className="flex items-center">
                      <EyeOff className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Private Event</span>
                        <p className="text-sm text-gray-500">Only people with the link can attend</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-velvet-600 text-white rounded-lg hover:bg-velvet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Event...
                  </>
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
