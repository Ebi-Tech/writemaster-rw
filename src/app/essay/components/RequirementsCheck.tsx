'use client'

import { CheckCircle, XCircle, AlertCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'

type Stage = {
  requirements: any[]
  passed_requirements: string[]
  failed_requirements: string[]
  ai_feedback: string | null
}

export default function RequirementsCheck({
  stage,
  content,
  wordCount
}: {
  stage: Stage
  content: string
  wordCount: number
}) {
  const [expanded, setExpanded] = useState(false)

  const checkWordCount = (req: any) => {
    if (req.type === 'word_count') {
      const min = req.minValue || 0
      const max = req.maxValue || Infinity
      return wordCount >= min && wordCount <= max
    }
    return false
  }

  const checkKeywords = (req: any) => {
    if (req.type === 'contains_keywords' && req.requiredKeywords) {
      const contentLower = content.toLowerCase()
      return req.requiredKeywords.some((keyword: string) => 
        contentLower.includes(keyword.toLowerCase())
      )
    }
    return false
  }

  const evaluateRequirement = (req: any) => {
    if (req.type === 'word_count') return checkWordCount(req)
    if (req.type === 'contains_keywords') return checkKeywords(req)
    return false
  }

  return (
    <div className="p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left mb-4"
      >
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="font-medium text-gray-900">Requirements & Feedback</h3>
        </div>
        <span className="text-sm text-gray-500">
          {expanded ? 'Hide' : 'Show'}
        </span>
      </button>

      {expanded && (
        <div className="space-y-6">
          {/* Requirements List */}
          {stage.requirements && stage.requirements.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Stage Requirements</h4>
              <div className="space-y-3">
                {stage.requirements.map((req) => {
                  const isPassed = stage.passed_requirements?.includes(req.id) || evaluateRequirement(req)
                  
                  return (
                    <div 
                      key={req.id}
                      className={`p-3 rounded-lg border ${
                        isPassed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-start">
                        {isPassed ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{req.description}</span>
                            {isPassed ? (
                              <span className="text-xs font-medium text-green-600">Passed</span>
                            ) : (
                              <span className="text-xs font-medium text-yellow-600">Needs work</span>
                            )}
                          </div>
                          {!isPassed && req.errorMessage && (
                            <p className="text-sm text-yellow-700 mt-1">{req.errorMessage}</p>
                          )}
                          {req.type === 'word_count' && (
                            <div className="text-xs text-gray-600 mt-2">
                              Current: {wordCount} words
                              {req.minValue && ` (Min: ${req.minValue})`}
                              {req.maxValue && ` (Max: ${req.maxValue})`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-600">No specific requirements for this stage.</p>
            </div>
          )}

          {/* AI Feedback */}
          {stage.ai_feedback && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">AI Feedback</h4>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <Sparkles className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800">{stage.ai_feedback}</p>
                    <p className="text-xs text-blue-600 mt-2">
                      Based on REB marking guidelines
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Word Count Summary */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Word Count</p>
                <p className="text-2xl font-bold text-gray-900">{wordCount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Character Count</p>
                <p className="text-lg font-semibold text-gray-900">{content.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}