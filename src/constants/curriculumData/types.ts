export interface LessonQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CommonPitfall {
  title: string;
  wrongCode: string;
  rightCode: string;
  explanation: string;
}

export interface LessonEnrichment {
  realWorldUse: string;
  analogyTitle: string;
  analogyText: string;
  cheatSheet: string;
  quiz: LessonQuiz;
  commonPitfall?: CommonPitfall;
  guidedCode?: string;
  solutionCode?: string;
}

export interface EnrichedLessonData extends LessonEnrichment {
  matchTrack: "python_basics" | "algorithms" | "system_design";
  matchOrder?: number;
  matchKeywords: string[];
}

export interface ToolVariation {
  label: string;
  code: string;
  output: string;
  note: string;
}

export interface LessonToolSpec {
  toolName: string;
  badge: string;
  purpose: string;
  syntaxPattern: string;
  variations: ToolVariation[];
}

export interface LessonToolboxEntry {
  matchTrack: string;
  matchOrder: number;
  tools: LessonToolSpec[];
}
