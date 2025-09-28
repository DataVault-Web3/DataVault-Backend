// Test script to verify the integration between Chrome extension and backend
const testProofData = {
  // Proof components
  solidityProof: ["0x123", "0x456", "0x789", "0xabc", "0xdef", "0x111", "0x222", "0x333"],
  nullifierHash: "0xnullifier123456789",
  merkleRoot: "0xmerkle123456789",
  
  // Group info
  groupId: "0",
  groupSize: "1",
  groupDepth: "1",
  
  // Object data
  objectHash: "0xobject123456789",
  orders: [
    {
      itemName: "Test Product 1",
      amazonLink: "https://amazon.in/dp/test1",
      dateOrdered: "2024-01-15",
      returnStatus: "Not returned",
      price: "₹999.00",
      id: "test_order_1",
      extractedAt: new Date().toISOString(),
      shared: true
    },
    {
      itemName: "Test Product 2", 
      amazonLink: "https://amazon.in/dp/test2",
      dateOrdered: "2024-01-20",
      returnStatus: "Not returned",
      price: "₹1499.00",
      id: "test_order_2",
      extractedAt: new Date().toISOString(),
      shared: true
    }
  ],
  
  // Identity info
  commitment: "0xcommitment123456789",
  userIdSeed: "test_user_seed_12345",
  
  // Metadata
  timestamp: new Date().toISOString(),
  proofGeneratedAt: new Date().toISOString(),
  metadata: {
    testRun: true,
    source: "integration_test"
  }
};

async function testIntegration() {
  console.log('🧪 Testing Chrome Extension to Backend Integration...\n');
  
  try {
    // Test 1: Send proof data to backend
    console.log('📤 Test 1: Sending proof data to backend...');
    const response = await fetch('http://localhost:3000/api/proof', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProofData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Proof data sent successfully!');
    console.log('📋 Response:', JSON.stringify(result, null, 2));
    
    if (result.success && result.proofId && result.quiltId) {
      console.log('✅ Integration test PASSED!');
      console.log(`📝 Proof ID: ${result.proofId}`);
      console.log(`🧩 Quilt ID: ${result.quiltId}`);
      
      // Test 2: Retrieve proof by ID
      console.log('\n📥 Test 2: Retrieving proof by ID...');
      const getResponse = await fetch(`http://localhost:3000/api/proof/${result.proofId}`);
      const getResult = await getResponse.json();
      
      if (getResult.success) {
        console.log('✅ Proof retrieved successfully!');
        console.log(`📊 Orders count: ${getResult.proof.orders.length}`);
      } else {
        console.log('❌ Failed to retrieve proof:', getResult.error);
      }
      
      // Test 3: Get statistics
      console.log('\n📊 Test 3: Getting proof statistics...');
      const statsResponse = await fetch('http://localhost:3000/api/proof/stats/overview');
      const statsResult = await statsResponse.json();
      
      if (statsResult.success) {
        console.log('✅ Statistics retrieved successfully!');
        console.log('📈 Stats:', JSON.stringify(statsResult.stats, null, 2));
      } else {
        console.log('❌ Failed to get statistics:', statsResult.error);
      }
      
    } else {
      console.log('❌ Integration test FAILED - Invalid response format');
    }
    
  } catch (error) {
    console.log('❌ Integration test FAILED:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the backend is running: npm run start:dev');
    console.log('2. Check MongoDB connection');
    console.log('3. Verify Walrus service is configured');
  }
}

// Run the test
testIntegration();
