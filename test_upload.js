import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

async function testUpload() {
  try {
    const formData = new FormData();
    // Create a dummy file buffer
    const dummyContent = Buffer.from('Dummy DOCX content');
    formData.append('file', dummyContent, {
      filename: 'dummy.docx',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    console.log("Sending request...");
    const response = await axios.post('http://localhost:8000/api/v1/resumes/upload', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    console.log("Success:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Response Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("Network Error: No response received.");
    } else {
      console.error("Error:", error.message);
    }
  }
}

testUpload();
