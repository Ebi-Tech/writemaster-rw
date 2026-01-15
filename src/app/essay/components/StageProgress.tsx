'use client'

import { CheckCircle, Lock, Circle, Edit } from 'lucide-react'

type Stage = {
  id: string
  title: string
  description: string
}

type StageStatus = {
  [key: string]: {
    isUnlocked: boolean
    isCompleted: boolean
  }
}

export default function StageProgress({
  stages,
  currentStageId,
  stageStatus,
  onStageSelect
}: {
  stages: Stage[]
  currentStageId: string
  stageStatus: StageStatus
  onStageSelect: (stageId: string) => void
}) {
  const isStageAccessible = (stageId: string, index: number) => {
    if (index === 0) return true // First stage always accessible
    const prevStage = stages[index - 1]
    return stageStatus[prevStage.id]?.isCompleted || false
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Essay Stages</h3>
      
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const status = stageStatus[stage.id]
          const isCurrent = stage.id === currentStageId
          const isAccessible = isStageAccessible(stage.id, index)
          
          return (
            <button
              key={stage.id}
              onClick={() => isAccessible && onStageSelect(stage.id)}
              disabled={!isAccessible}
              className={`w-full text-left p-4 rounded-lg border transition ${
                isCurrent 
                  ? 'border-blue-500 bg-blue-50' 
                  : isAccessible
                  ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  {status?.isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isCurrent ? (
                    <Edit className="h-5 w-5 text-blue-500" />
                  ) : isAccessible ? (
                    <Circle className="h-5 w-5 text-gray-300" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-300" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${
                      isCurrent ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {stage.title}
                    </h4>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600">
                      {index === 0 ? 'Start' : `Step ${index + 1}`}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{stage.description}</p>
                  
                  <div className="flex items-center text-xs">
                    {status?.isCompleted ? (
                      <span className="text-green-600 font-medium">✓ Completed</span>
                    ) : isCurrent ? (
                      <span className="text-blue-600 font-medium">Current</span>
                    ) : isAccessible ? (
                      <span className="text-gray-600">Ready to start</span>
                    ) : (
                      <span className="text-gray-500">Locked</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {Object.values(stageStatus).filter(s => s.isCompleted).length} / {stages.length} stages
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(Object.values(stageStatus).filter(s => s.isCompleted).length / stages.length) * 100}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}