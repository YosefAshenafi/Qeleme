// test-otp.js
// Simple test script to verify OTP service functionality

const OTP_BASE_URL = 'https://api.afromessage.com/api';
const OTP_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoiUGJqTk9oSmJkVlR4SnlCUWt2R2RHdVozZHV2ZDRDWmUiLCJleHAiOjE4OTcwNzQ2NzUsImlhdCI6MTczOTMwODI3NSwianRpIjoiNjcyYzViYjUtNTVmMC00NDM0LWEyOGUtM2RiMGI4ZTIyOWUzIn0.PLOFqilQnoDF-idjF6jmkGCA7CC5XXViq6u28pD5weg';

const SENDER_NAME = 'Qelem';
const IDENTIFIER_ID = 'e80ad9d8-adf3-463f-80f4-7c4b39f7f164';

const testSendOTP = async (phoneNumber) => {
  try {
    // Format phone number with country code if not already present
    // Remove leading 0 if present and add +251
    const cleanNumber = phoneNumber.replace(/^0+/, ''); // Remove leading zeros
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+251${cleanNumber}`;
    
    console.log(`🧪 Testing OTP service with phone: ${phoneNumber}`);
    console.log(`📱 Formatted phone: ${formattedPhone}`);
    console.log(`🌐 Base URL: ${OTP_BASE_URL}`);
    console.log(`📡 Endpoint: /challenge`);
    console.log(`📤 Method: GET`);
    
    // Build query parameters for the GET request
    const params = new URLSearchParams({
      from: IDENTIFIER_ID,
      sender: SENDER_NAME,
      to: formattedPhone,
      pr: 'Your Qelem verification code is:',
      ps: 'Valid for 5 minutes.',
      sb: '0', // spaces before
      sa: '0', // spaces after
      ttl: '300', // 5 minutes expiration
      len: '6', // 6-digit code
      t: '1', // numeric code type (1 for numeric)
    });

    console.log(`📋 Query parameters:`, params.toString());
    
    const response = await fetch(`${OTP_BASE_URL}/challenge?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OTP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📋 Response data:`, JSON.stringify(data, null, 2));
    
    // Handle Afromessage response format
    if (data.acknowledge === 'success') {
      console.log('✅ OTP sent successfully!');
      return { success: true, data };
    } else if (data.acknowledge === 'error') {
      const errorMessage = data.response?.errors?.[0] || data.response?.error || 'Failed to send OTP';
      console.log('❌ Failed to send OTP:', errorMessage);
      return { success: false, error: errorMessage };
    } else {
      console.log('❌ Failed to send OTP:', data.message || data.error);
      return { success: false, error: data.message || data.error };
    }
  } catch (error) {
    console.error('💥 Error testing OTP service:', error.message);
    return { success: false, error: error.message };
  }
};

const testVerifyOTP = async (phoneNumber, otp) => {
  try {
    console.log(`🔍 Testing OTP verification with phone: ${phoneNumber}, OTP: ${otp}`);
    console.log(`🌐 Base URL: ${OTP_BASE_URL}`);
    console.log(`📡 Endpoint: /verify-otp`);
    
    const response = await fetch(`${OTP_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OTP_API_KEY}`,
      },
      body: JSON.stringify({
        phoneNumber,
        otp,
      }),
    });

    console.log(`📡 Verification response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📋 Verification response data:`, JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ OTP verified successfully!');
      return { success: true, data };
    } else {
      console.log('❌ Failed to verify OTP:', data.message || data.error);
      return { success: false, error: data.message || data.error };
    }
  } catch (error) {
    console.error('💥 Error testing OTP verification:', error.message);
    return { success: false, error: error.message };
  }
};

// Test with a sample phone number
const testPhoneNumber = '0910810689'; // Replace with your test phone number

const runTest = async () => {
  console.log('🚀 Starting OTP Service Test');
  console.log('================================');
  console.log(`🔑 API Key: ${OTP_API_KEY.substring(0, 16)}...`);
  console.log(`📞 Test Phone: ${testPhoneNumber}`);
  console.log(`👤 Sender: ${SENDER_NAME}`);
  console.log(`🆔 Identifier ID: ${IDENTIFIER_ID}`);
  console.log('');

  // Test sending OTP
  const sendResult = await testSendOTP(testPhoneNumber);
  
  if (sendResult.success) {
    console.log('');
    console.log('⏳ Waiting 2 seconds before testing verification...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Note: We don't have the OTP code since it's generated by the server
    // You'll need to manually enter the OTP received on your phone
    console.log('');
    console.log('📱 Please check your phone for the OTP and manually test verification.');
    console.log('📊 Test Summary:');
    console.log(`   Send OTP: ✅ PASS`);
    console.log(`   Verify OTP: ⏭️  MANUAL TEST REQUIRED`);
  } else {
    console.log('');
    console.log('📊 Test Summary:');
    console.log(`   Send OTP: ❌ FAIL`);
    console.log(`   Verify OTP: ⏭️  SKIPPED (Send failed)`);
  }
  
  console.log('');
  console.log('🏁 Test completed!');
};

// Run the test
runTest().catch(console.error); 