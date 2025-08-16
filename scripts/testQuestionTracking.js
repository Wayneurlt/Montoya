// Test script for question tracking system
// Run this in the browser console to test the tracking functionality

console.log('🧪 Starting Question Tracking Test...')

// Test localStorage functionality
function testLocalStorage() {
  console.log('\n📦 Testing localStorage functionality...')
  
  try {
    // Test basic storage
    localStorage.setItem('test_montoya', 'test_value')
    const retrieved = localStorage.getItem('test_montoya')
    
    if (retrieved === 'test_value') {
      console.log('✅ localStorage is working correctly')
    } else {
      console.error('❌ localStorage read/write failed')
    }
    
    // Clean up
    localStorage.removeItem('test_montoya')
  } catch (error) {
    console.error('❌ localStorage error:', error)
  }
}

// Test session ID generation
function testSessionId() {
  console.log('\n🆔 Testing session ID generation...')
  
  const sessionKey = 'montoya_session_id'
  
  // Clear any existing session
  localStorage.removeItem(sessionKey)
  
  // Check if new session ID is generated
  if (typeof window.montoyaDebug !== 'undefined') {
    const stats1 = window.montoyaDebug.getStats()
    const stats2 = window.montoyaDebug.getStats()
    
    if (stats1 && stats2 && stats1.sessionId === stats2.sessionId) {
      console.log('✅ Session ID is consistent:', stats1.sessionId)
    } else {
      console.error('❌ Session ID generation issue')
    }
  } else {
    console.log('⚠️  Debug commands not available, testing basic functionality')
    
    // Generate a test session ID
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
    localStorage.setItem(sessionKey, sessionId)
    
    const retrieved = localStorage.getItem(sessionKey)
    if (retrieved === sessionId) {
      console.log('✅ Session ID storage working:', sessionId)
    } else {
      console.error('❌ Session ID storage failed')
    }
  }
}

// Test question tracking data structure
function testDataStructure() {
  console.log('\n📋 Testing data structure...')
  
  const testData = {
    sessionId: 'test_session_123',
    indices: [0, 1, 2, 5, 8],
    timestamp: Date.now()
  }
  
  try {
    const json = JSON.stringify(testData)
    const parsed = JSON.parse(json)
    
    if (parsed.sessionId === testData.sessionId && 
        Array.isArray(parsed.indices) && 
        parsed.indices.length === 5 &&
        typeof parsed.timestamp === 'number') {
      console.log('✅ Data structure serialization working')
    } else {
      console.error('❌ Data structure serialization failed')
    }
  } catch (error) {
    console.error('❌ JSON serialization error:', error)
  }
}

// Simulate question usage patterns
function simulateQuestionUsage() {
  console.log('\n🎲 Simulating question usage patterns...')
  
  const mockQuestions = [
    'Question 1', 'Question 2', 'Question 3', 
    'Question 4', 'Question 5'
  ]
  
  const usedSet = new Set()
  const usageOrder = []
  
  // Simulate picking 8 questions (more than available)
  for (let i = 0; i < 8; i++) {
    const unusedIndices = mockQuestions
      .map((_, index) => index)
      .filter(index => !usedSet.has(index))
    
    if (unusedIndices.length === 0) {
      console.log(`⚠️  All questions used after ${usageOrder.length} picks, would reset`)
      usedSet.clear()
      // Pick first question again
      usedSet.add(0)
      usageOrder.push(0)
    } else {
      const randomIndex = unusedIndices[Math.floor(Math.random() * unusedIndices.length)]
      usedSet.add(randomIndex)
      usageOrder.push(randomIndex)
    }
  }
  
  console.log('✅ Usage pattern simulation completed')
  console.log('📊 Usage order:', usageOrder)
  console.log('📊 Unique questions used:', new Set(usageOrder).size)
}

// Test storage keys
function testStorageKeys() {
  console.log('\n🔑 Testing storage key naming...')
  
  const expectedKeys = [
    'montoya_used_truth_normal',
    'montoya_used_truth_spicy', 
    'montoya_used_dare_normal',
    'montoya_used_dare_spicy',
    'montoya_used_do_or_drink',
    'montoya_used_never_have_i_ever',
    'montoya_used_most_likely_to',
    'montoya_used_would_you_rather',
    'montoya_session_id'
  ]
  
  console.log('✅ Expected storage keys:')
  expectedKeys.forEach(key => console.log(`   - ${key}`))
  
  // Check current localStorage for any Montoya keys
  const currentKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('montoya_')) {
      currentKeys.push(key)
    }
  }
  
  if (currentKeys.length > 0) {
    console.log('📊 Current Montoya keys in localStorage:')
    currentKeys.forEach(key => console.log(`   - ${key}`))
  } else {
    console.log('ℹ️  No Montoya keys found in localStorage (expected for fresh session)')
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running comprehensive question tracking tests...')
  
  testLocalStorage()
  testSessionId()
  testDataStructure()
  simulateQuestionUsage()
  testStorageKeys()
  
  console.log('\n✅ All tests completed!')
  console.log('\n💡 To test the actual tracking system:')
  console.log('   1. Navigate to any game page')
  console.log('   2. Draw questions and observe console logs')
  console.log('   3. Use montoyaDebug.getStats() to see usage')
  console.log('   4. Refresh page and verify persistence')
}

// Auto-run tests
runAllTests()

// Export for manual testing
if (typeof window !== 'undefined') {
  window.questionTrackingTest = {
    runAllTests,
    testLocalStorage,
    testSessionId,
    testDataStructure,
    simulateQuestionUsage,
    testStorageKeys
  }
  
  console.log('\n🔧 Manual test functions available as window.questionTrackingTest')
}
