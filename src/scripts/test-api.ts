async function testRequirementsAPI() {
  console.log('🧪 Testing requirements API...')
  
  const testData = {
    projectId: 'test-123',
    stageId: 'thesis_statement',
    content: 'Technology has a positive impact on Rwandan society because it improves education access and creates economic opportunities.',
    requirements: [
      {
        id: 'thesis_length',
        type: 'word_count',
        minValue: 15,
        maxValue: 40,
        description: 'Thesis should be 15-40 words'
      },
      {
        id: 'thesis_arguable',
        type: 'contains_keywords',
        requiredKeywords: ['because', 'therefore', 'impact', 'improves'],
        description: 'Thesis must take a clear position'
      }
    ]
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/check-requirements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    
    console.log('✅ API Response:', {
      status: response.status,
      passedRequirements: result.passedRequirements,
      failedRequirements: result.failedRequirements,
      isCompleted: result.isCompleted,
      feedback: result.feedback,
      wordCount: result.wordCount
    })
    
    if (response.ok) {
      console.log('🎉 API test passed!')
    } else {
      console.log('❌ API test failed:', result.error)
    }
    
  } catch (error) {
    console.error('❌ API test error:', error)
  }
}

testRequirementsAPI()