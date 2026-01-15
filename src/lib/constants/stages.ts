// ESSAY STAGES - NEW 4-STAGE STRUCTURE
interface WritingStage {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  requirements: Array<{
    id: string;
    type: string;
    minValue?: number;
    maxValue?: number;
    minParagraphs?: number;
    requiredKeywords?: string[];
    description: string;
    errorMessage: string;
  }>;
  nextStages: string[];
  helpText: string;
  examples: string[];
}

export const ESSAY_STAGES: WritingStage[] = [
  {
    id: 'plan_thesis',
    title: 'Plan & Thesis Draft',
    description: 'Outline your essay and draft your thesis statement',
    isUnlocked: true,
    requirements: [
      {
        id: 'outline_points',
        type: 'word_count',
        minValue: 30,
        description: 'Outline should have at least 3 main points',
        errorMessage: 'Your outline needs more detail (minimum 30 words)'
      },
      {
        id: 'thesis_draft',
        type: 'contains_keywords',
        requiredKeywords: ['argu', 'position', 'claim', 'because', 'therefore'],
        description: 'Thesis draft should take a clear position',
        errorMessage: 'Your thesis needs to make a clear, arguable claim'
      }
    ],
    nextStages: ['write_introduction'],
    helpText: 'This is your planning stage - outline your main arguments and draft your thesis. This content won\'t count toward your final word limit.',
    examples: [
      'Main Points: 1) Technology improves education 2) Creates jobs 3) Connects communities\nThesis Draft: Technology benefits Rwanda because it improves education access and creates economic opportunities.'
    ]
  },
  {
    id: 'write_introduction',
    title: 'Write Introduction',
    description: 'Write your introduction with the embedded thesis',
    isUnlocked: false,
    requirements: [
      {
        id: 'intro_length',
        type: 'word_count',
        minValue: 80,
        maxValue: 150,
        description: 'Introduction should be 80-150 words',
        errorMessage: 'Introduction is too short or too long'
      },
      {
        id: 'intro_structure',
        type: 'contains_keywords',
        requiredKeywords: ['introduc', 'thesis', 'argu', 'this essay', 'will discuss'],
        description: 'Introduction should have hook, background, and thesis',
        errorMessage: 'Your introduction needs a clear structure: hook, background, thesis'
      }
    ],
    nextStages: ['develop_body'],
    helpText: 'Write your full introduction including: 1) Hook 2) Background 3) Thesis statement 4) Essay roadmap',
    examples: [
      'In today\'s digital age, technology transforms how we live and work. In Rwanda, this transformation is particularly significant as the nation embraces digital innovation. This essay argues that technology has positively impacted Rwandan society by improving education access and creating economic opportunities. The discussion will explore educational benefits, economic impacts, and social implications of technological adoption.'
    ]
  },
  {
    id: 'develop_body',
    title: 'Develop Body Paragraphs',
    description: 'Develop your arguments with evidence and analysis',
    isUnlocked: false,
    requirements: [
      {
        id: 'body_length',
        type: 'word_count',
        minValue: 300,
        description: 'Body paragraphs should be at least 300 words',
        errorMessage: 'Body paragraphs need more development'
      },
      {
        id: 'body_structure',
        type: 'structure_check',
        minParagraphs: 3,
        description: 'Should have at least 3 well-developed paragraphs',
        errorMessage: 'Need more developed paragraphs (minimum 3)'
      }
    ],
    nextStages: ['conclude'],
    helpText: 'Each paragraph should: 1) Start with topic sentence 2) Provide evidence 3) Include analysis 4) Connect to thesis',
    examples: []
  },
  {
    id: 'conclude',
    title: 'Write Conclusion',
    description: 'Summarize your essay and show significance',
    isUnlocked: false,
    requirements: [
      {
        id: 'conclusion_length',
        type: 'word_count',
        minValue: 80,
        maxValue: 150,
        description: 'Conclusion should be 80-150 words',
        errorMessage: 'Conclusion is too short or too long'
      },
      {
        id: 'conclusion_keywords',
        type: 'contains_keywords',
        requiredKeywords: ['conclud', 'summary', 'overall', 'therefore', 'finally', 'signific'],
        description: 'Conclusion should summarize and show significance',
        errorMessage: 'Your conclusion should summarize main points and show significance'
      }
    ],
    nextStages: [],
    helpText: 'Conclusion should: 1) Restate thesis 2) Summarize main points 3) Show significance 4) End strongly',
    examples: [
      'In conclusion, technology has significantly benefited Rwanda through improved education and economic growth. While challenges exist, the overall impact is positive. As Rwanda continues its digital transformation, these benefits will likely increase, positioning the nation as a leader in African technological innovation.'
    ]
  }
];