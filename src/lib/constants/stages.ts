// Define the stages for Essay and Thesis modes
export type StageRequirement = {
  id: string;
  type: 'ai_score' | 'word_count' | 'contains_keywords' | 'structure_check';
  minValue?: number;
  maxValue?: number;
  requiredKeywords?: string[];
  description: string;
  errorMessage: string;
};

export type WritingStage = {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  requirements: StageRequirement[];
  nextStages: string[]; // IDs of stages this unlocks
  helpText: string;
  examples: string[];
};

// Essay Mode Stages (REB-aligned)
export const ESSAY_STAGES: WritingStage[] = [
  {
    id: 'thesis_statement',
    title: 'Thesis Statement',
    description: 'Create a clear, arguable thesis that answers the prompt',
    isUnlocked: true, // First stage is always unlocked
    requirements: [
      {
        id: 'thesis_length',
        type: 'word_count',
        minValue: 15,
        maxValue: 40,
        description: 'Thesis should be 15-40 words',
        errorMessage: 'Thesis is too short or too long. Aim for 15-40 words.'
      },
      {
        id: 'thesis_arguable',
        type: 'contains_keywords',
        requiredKeywords: ['argu', 'position', 'claim', 'assert'],
        description: 'Thesis must take a clear position',
        errorMessage: 'Your thesis needs to make a clear, arguable claim.'
      }
    ],
    nextStages: ['planning', 'introduction'],
    helpText: 'A good thesis: 1) Answers the prompt 2) Takes a position 3) Is specific',
    examples: [
      'While some argue technology isolates people, it actually creates new forms of community through social media platforms.',
      'The Rwandan government\'s focus on technology education is essential for preparing youth for the digital economy of the future.'
    ]
  },
  {
    id: 'planning',
    title: 'Essay Plan',
    description: 'Outline your main arguments and evidence',
    isUnlocked: false,
    requirements: [
      {
        id: 'plan_min_points',
        type: 'word_count',
        minValue: 50,
        description: 'Plan should outline at least 3 main points',
        errorMessage: 'Your plan needs at least 3 well-developed points.'
      }
    ],
    nextStages: ['body_paragraphs'],
    helpText: 'Each point should: 1) Support your thesis 2) Have evidence 3) Include analysis',
    examples: []
  }
  // More stages will be added later
];

// Thesis Mode Stages (UR-aligned)
export const THESIS_STAGES: WritingStage[] = [
  {
    id: 'research_proposal',
    title: 'Research Proposal',
    description: 'Define your research question and objectives',
    isUnlocked: true,
    requirements: [
      {
        id: 'proposal_length',
        type: 'word_count',
        minValue: 200,
        description: 'Proposal should be 200+ words',
        errorMessage: 'Research proposal needs more detail (minimum 200 words).'
      },
      {
        id: 'research_question',
        type: 'contains_keywords',
        requiredKeywords: ['what', 'how', 'why', 'effect', 'impact', 'relationship'],
        description: 'Must contain a clear research question',
        errorMessage: 'Your proposal needs a clear research question starting with What, How, or Why.'
      }
    ],
    nextStages: ['literature_review'],
    helpText: 'UR guidelines require: 1) Clear research gap 2) Specific objectives 3) Methodology overview',
    examples: []
  }
];