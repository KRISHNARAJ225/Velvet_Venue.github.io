// Debug script for event creation
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testEventCreation() {
  try {
    // Create a test image file
    const testImagePath = 'test-image.jpg';
    const testImageContent = Buffer.from('fake image content');
    fs.writeFileSync(testImagePath, testImageContent);

    // Create form data
    const formData = new FormData();
    formData.append('title', 'Test Event');
    formData.append('description', 'This is a test event description');
    formData.append('date', '2026-12-25');
    formData.append('time', '14:00');
    formData.append('location', 'Test Location');
    formData.append('visibility', 'public');
    formData.append('category', 'conference');
    formData.append('bannerImage', fs.createReadStream(testImagePath));

    // Get auth token (you'll need to login first)
    const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

    const response = await axios.post('http://localhost:5000/api/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Event creation successful:', response.data);
  } catch (error) {
    console.error('Event creation failed:', error.response?.data || error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync('test-image.jpg')) {
      fs.unlinkSync('test-image.jpg');
    }
  }
}

testEventCreation();
