import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { 
      projectId, 
      stageId, 
      content, 
      requirements,
      wordLimit,
      currentStageIndex,
      isLastStage
    } = await request.json()

    console.log('🔍 Checking requirements:', { 
      projectId, 
      stageId, 
      wordLimit,
      isLastStage 
    })

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      )
    }

    const passedRequirements: string[] = []
    const failedRequirements: string[] = []
    const feedbackItems: string[] = []
    
    const wordCount = content.split(/\s+/).length
    const characterCount = content.length
    
    console.log(`📊 Word count: ${wordCount}, Character count: ${characterCount}`)

    // Check word limit if provided
    if (wordLimit && wordCount > wordLimit) {
      failedRequirements.push('word_limit')
      feedbackItems.push(`Exceeds word limit: ${wordCount} > ${wordLimit}`)
    } else if (wordLimit) {
      passedRequirements.push('word_limit')
      feedbackItems.push(`Within word limit: ${wordCount}/${wordLimit}`)
    }

    // Check stage-specific requirements
    if (requirements && Array.isArray(requirements)) {
      requirements.forEach((req: any) => {
        let passed = false
        let feedback = ''
        
        switch (req.type) {
          case 'word_count': {
            const min = req.minValue || 0
            const max = req.maxValue || Infinity
            
            if (wordCount < min) {
              feedback = `Too short: ${wordCount} words (minimum ${min})`
            } else if (wordCount > max) {
              feedback = `Too long: ${wordCount} words (maximum ${max})`
            } else {
              passed = true
              feedback = `Good length: ${wordCount} words`
            }
            break
          }
          
          case 'contains_keywords': {
            if (req.requiredKeywords && Array.isArray(req.requiredKeywords)) {
              const contentLower = content.toLowerCase()
              const foundKeywords = req.requiredKeywords.filter((keyword: string) => 
                contentLower.includes(keyword.toLowerCase())
              )
              
              if (foundKeywords.length > 0) {
                passed = true
                feedback = `Found keywords: ${foundKeywords.join(', ')}`
              } else {
                feedback = `Missing required keywords: ${req.requiredKeywords.join(', ')}`
              }
            } else {
              feedback = 'No keywords specified to check'
              passed = true
            }
            break
          }
          
          default: {
            feedback = `Unknown requirement type: ${req.type}`
            passed = true
          }
        }
        
        if (passed) {
          passedRequirements.push(req.id)
          console.log(`✅ Requirement ${req.id} passed: ${feedback}`)
        } else {
          failedRequirements.push(req.id)
          console.log(`❌ Requirement ${req.id} failed: ${feedback}`)
        }
        
        feedbackItems.push(`${req.description}: ${feedback}`)
      })
    }

    // Special handling for last stage
    let overallFeedback = ''
    const totalRequirements = passedRequirements.length + failedRequirements.length
    
    if (isLastStage) {
      if (failedRequirements.length === 0) {
        overallFeedback = '🎊 Excellent! Your essay is complete and meets all requirements. Congratulations!'
      } else {
        overallFeedback = 'Almost there! Complete the final requirements to finish your essay.'
      }
    } else if (failedRequirements.length === 0) {
      overallFeedback = '🎉 All requirements met! You can proceed to the next stage.'
    } else if (passedRequirements.length === 0) {
      overallFeedback = 'Try adding more content and ensure you address all requirements.'
    } else {
      overallFeedback = `Good progress! ${passedRequirements.length} of ${totalRequirements} requirements met. Review the feedback below.`
    }

    console.log(`📋 Results: ${passedRequirements.length} passed, ${failedRequirements.length} failed`)
    console.log(`💬 Feedback: ${overallFeedback}`)

    return NextResponse.json({
      passedRequirements,
      failedRequirements,
      isCompleted: failedRequirements.length === 0,
      feedback: overallFeedback,
      detailedFeedback: feedbackItems,
      wordCount,
      characterCount,
      isLastStageCompleted: isLastStage && failedRequirements.length === 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error in check-requirements:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        passedRequirements: [],
        failedRequirements: [],
        isCompleted: false,
        feedback: 'Error checking requirements. Please try again.',
        detailedFeedback: [`Error: ${errorMessage}`]
      },
      { status: 400 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}