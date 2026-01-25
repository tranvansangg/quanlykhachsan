import axios from 'axios';

const testEndpoint = async () => {
  try {
    const body = {
      city: "Ha Noi",
      roomRequests: [{ adults: 1, children: 0 }]
    };

    console.log("Testing POST /api/hotels/search-available");
    console.log("Request body:", JSON.stringify(body));

    const response = await axios.post("http://localhost:8800/api/hotels/search-available", body);

    console.log("Status:", response.status);
    console.log("Hotels found:", response.data.length);
    
    if (response.data.length > 0) {
      console.log("First hotel:", JSON.stringify(response.data[0], null, 2).substring(0, 500));
    } else {
      console.log("No hotels found");
    }
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
    if (err.response?.status) {
      console.error("Status:", err.response.status);
    }
  }
};

testEndpoint();
