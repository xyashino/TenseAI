import type { DifficultyLevel, TenseName } from "@/types";

interface GeneratedQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
}

/**
 * Mock AI Question Generator Service
 *
 * Generates predefined grammar questions based on tense and difficulty.
 * This is a temporary mock implementation that will be replaced with
 * real OpenRouter API integration in the future.
 */
export class MockAIQuestionGeneratorService {
  /**
   * Generate questions for a specific tense and difficulty level
   * @param tense - The grammar tense to generate questions for
   * @param difficulty - The difficulty level (Basic or Advanced)
   * @param count - Number of questions to generate
   * @returns Array of generated questions
   */
  async generateQuestions(tense: TenseName, difficulty: DifficultyLevel, count: number): Promise<GeneratedQuestion[]> {
    // Simulate slight delay to mimic real API (optional)
    await new Promise((resolve) => setTimeout(resolve, 100));

    const questions = this.getQuestionTemplates(tense, difficulty);

    // Ensure we return exactly the requested count
    if (questions.length < count) {
      throw new Error(`Not enough mock questions available for ${tense} at ${difficulty} level`);
    }

    // Return first 'count' questions
    return questions.slice(0, count);
  }

  /**
   * Get question templates for a specific tense and difficulty
   */
  private getQuestionTemplates(tense: TenseName, difficulty: DifficultyLevel): GeneratedQuestion[] {
    const templates = this.questionBank[tense]?.[difficulty];

    if (!templates || templates.length === 0) {
      throw new Error(`No mock questions available for ${tense} at ${difficulty} level`);
    }

    return templates;
  }

  // Question bank organized by tense and difficulty
  private questionBank: Record<TenseName, Record<DifficultyLevel, GeneratedQuestion[]>> = {
    "Present Simple": {
      Basic: [
        {
          question_text: "She ___ to school every day.",
          options: ["go", "goes", "going", "gone"],
          correct_answer: "goes",
        },
        {
          question_text: "They ___ English at home.",
          options: ["speaks", "speak", "speaking", "spoke"],
          correct_answer: "speak",
        },
        {
          question_text: "I ___ breakfast at 7 AM.",
          options: ["eats", "eat", "eating", "ate"],
          correct_answer: "eat",
        },
        {
          question_text: "He ___ his homework after dinner.",
          options: ["do", "does", "doing", "done"],
          correct_answer: "does",
        },
        {
          question_text: "We ___ in a small town.",
          options: ["lives", "live", "living", "lived"],
          correct_answer: "live",
        },
        {
          question_text: "The sun ___ in the east.",
          options: ["rise", "rises", "rising", "rose"],
          correct_answer: "rises",
        },
        {
          question_text: "My sister ___ the piano beautifully.",
          options: ["play", "plays", "playing", "played"],
          correct_answer: "plays",
        },
        {
          question_text: "Cats ___ milk.",
          options: ["likes", "like", "liking", "liked"],
          correct_answer: "like",
        },
        {
          question_text: "The store ___ at 9 AM.",
          options: ["open", "opens", "opening", "opened"],
          correct_answer: "opens",
        },
        {
          question_text: "I ___ coffee in the morning.",
          options: ["drinks", "drink", "drinking", "drank"],
          correct_answer: "drink",
        },
      ],
      Advanced: [
        {
          question_text: "The committee ___ every Monday to discuss policies.",
          options: ["meet", "meets", "meeting", "met"],
          correct_answer: "meets",
        },
        {
          question_text: "Water ___ at 100 degrees Celsius.",
          options: ["boil", "boils", "boiling", "boiled"],
          correct_answer: "boils",
        },
        {
          question_text: "She rarely ___ her opinion during meetings.",
          options: ["express", "expresses", "expressing", "expressed"],
          correct_answer: "expresses",
        },
        {
          question_text: "The Earth ___ around the Sun.",
          options: ["revolve", "revolves", "revolving", "revolved"],
          correct_answer: "revolves",
        },
        {
          question_text: "He ___ to work by bicycle unless it rains.",
          options: ["commute", "commutes", "commuting", "commuted"],
          correct_answer: "commutes",
        },
        {
          question_text: "Most professionals ___ their skills regularly.",
          options: ["update", "updates", "updating", "updated"],
          correct_answer: "update",
        },
        {
          question_text: "The museum ___ at 6 PM on weekdays.",
          options: ["close", "closes", "closing", "closed"],
          correct_answer: "closes",
        },
        {
          question_text: "Economic trends ___ consumer behavior significantly.",
          options: ["influence", "influences", "influencing", "influenced"],
          correct_answer: "influence",
        },
        {
          question_text: "She ___ her research findings at conferences.",
          options: ["present", "presents", "presenting", "presented"],
          correct_answer: "presents",
        },
        {
          question_text: "The software ___ automatically every night.",
          options: ["backup", "backups", "backing", "backed"],
          correct_answer: "backups",
        },
      ],
    },
    "Past Simple": {
      Basic: [
        {
          question_text: "I ___ to the park yesterday.",
          options: ["go", "goes", "went", "gone"],
          correct_answer: "went",
        },
        {
          question_text: "She ___ a delicious cake last week.",
          options: ["bake", "bakes", "baked", "baking"],
          correct_answer: "baked",
        },
        {
          question_text: "They ___ the movie on Saturday.",
          options: ["watch", "watches", "watched", "watching"],
          correct_answer: "watched",
        },
        {
          question_text: "He ___ his keys in the car.",
          options: ["leave", "leaves", "left", "leaving"],
          correct_answer: "left",
        },
        {
          question_text: "We ___ our grandparents last month.",
          options: ["visit", "visits", "visited", "visiting"],
          correct_answer: "visited",
        },
        {
          question_text: "The train ___ on time yesterday.",
          options: ["arrive", "arrives", "arrived", "arriving"],
          correct_answer: "arrived",
        },
        {
          question_text: "I ___ my homework before dinner.",
          options: ["finish", "finishes", "finished", "finishing"],
          correct_answer: "finished",
        },
        {
          question_text: "She ___ a beautiful song at the concert.",
          options: ["sing", "sings", "sang", "singing"],
          correct_answer: "sang",
        },
        {
          question_text: "They ___ soccer in the afternoon.",
          options: ["play", "plays", "played", "playing"],
          correct_answer: "played",
        },
        {
          question_text: "The children ___ in the pool all day.",
          options: ["swim", "swims", "swam", "swimming"],
          correct_answer: "swam",
        },
      ],
      Advanced: [
        {
          question_text: "The company ___ significant losses last quarter.",
          options: ["sustain", "sustains", "sustained", "sustaining"],
          correct_answer: "sustained",
        },
        {
          question_text: "She ___ her dissertation in record time.",
          options: ["complete", "completes", "completed", "completing"],
          correct_answer: "completed",
        },
        {
          question_text: "The researchers ___ a groundbreaking discovery.",
          options: ["make", "makes", "made", "making"],
          correct_answer: "made",
        },
        {
          question_text: "He ___ the contract without consulting his lawyer.",
          options: ["sign", "signs", "signed", "signing"],
          correct_answer: "signed",
        },
        {
          question_text: "The government ___ new regulations last year.",
          options: ["implement", "implements", "implemented", "implementing"],
          correct_answer: "implemented",
        },
        {
          question_text: "They ___ the project ahead of schedule.",
          options: ["deliver", "delivers", "delivered", "delivering"],
          correct_answer: "delivered",
        },
        {
          question_text: "The investigation ___ several months.",
          options: ["take", "takes", "took", "taking"],
          correct_answer: "took",
        },
        {
          question_text: "She ___ her position on the matter clearly.",
          options: ["articulate", "articulates", "articulated", "articulating"],
          correct_answer: "articulated",
        },
        {
          question_text: "The board ___ the proposal unanimously.",
          options: ["approve", "approves", "approved", "approving"],
          correct_answer: "approved",
        },
        {
          question_text: "He ___ to the challenge with determination.",
          options: ["rise", "rises", "rose", "rising"],
          correct_answer: "rose",
        },
      ],
    },
    "Present Perfect": {
      Basic: [
        {
          question_text: "I ___ never ___ to Paris.",
          options: ["has been", "have been", "had been", "am being"],
          correct_answer: "have been",
        },
        {
          question_text: "She ___ already ___ her homework.",
          options: ["has finished", "have finished", "finishing", "finished"],
          correct_answer: "has finished",
        },
        {
          question_text: "They ___ just ___ dinner.",
          options: ["has eaten", "have eaten", "eating", "ate"],
          correct_answer: "have eaten",
        },
        {
          question_text: "We ___ ___ this movie before.",
          options: ["has seen", "have seen", "seeing", "saw"],
          correct_answer: "have seen",
        },
        {
          question_text: "He ___ ___ three books this month.",
          options: ["has read", "have read", "reading", "reads"],
          correct_answer: "has read",
        },
        {
          question_text: "I ___ ___ my keys. Can you help me find them?",
          options: ["has lost", "have lost", "losing", "lost"],
          correct_answer: "have lost",
        },
        {
          question_text: "She ___ ___ to Spain twice.",
          options: ["has traveled", "have traveled", "traveling", "travels"],
          correct_answer: "has traveled",
        },
        {
          question_text: "They ___ not ___ yet.",
          options: ["has arrived", "have arrived", "arriving", "arrive"],
          correct_answer: "have arrived",
        },
        {
          question_text: "We ___ ___ here since 2020.",
          options: ["has lived", "have lived", "living", "live"],
          correct_answer: "have lived",
        },
        {
          question_text: "He ___ ___ his job last week.",
          options: ["has started", "have started", "starting", "starts"],
          correct_answer: "has started",
        },
      ],
      Advanced: [
        {
          question_text: "The organization ___ ___ remarkable progress recently.",
          options: ["has achieved", "have achieved", "achieving", "achieved"],
          correct_answer: "has achieved",
        },
        {
          question_text: "Scientists ___ ___ several breakthroughs this decade.",
          options: ["has made", "have made", "making", "made"],
          correct_answer: "have made",
        },
        {
          question_text: "She ___ ___ on this project for six months.",
          options: ["has worked", "have worked", "working", "works"],
          correct_answer: "has worked",
        },
        {
          question_text: "The economy ___ ___ significantly since last year.",
          options: ["has improved", "have improved", "improving", "improves"],
          correct_answer: "has improved",
        },
        {
          question_text: "They ___ ___ the implications thoroughly.",
          options: ["has considered", "have considered", "considering", "consider"],
          correct_answer: "have considered",
        },
        {
          question_text: "He ___ ___ substantial evidence to support his theory.",
          options: ["has accumulated", "have accumulated", "accumulating", "accumulates"],
          correct_answer: "has accumulated",
        },
        {
          question_text: "The committee ___ yet ___ a final decision.",
          options: ["has not reached", "have not reached", "reaching", "reaches"],
          correct_answer: "has not reached",
        },
        {
          question_text: "Researchers ___ ___ valuable data over the years.",
          options: ["has collected", "have collected", "collecting", "collect"],
          correct_answer: "have collected",
        },
        {
          question_text: "She ___ ___ her expertise in multiple domains.",
          options: ["has demonstrated", "have demonstrated", "demonstrating", "demonstrates"],
          correct_answer: "has demonstrated",
        },
        {
          question_text: "The initiative ___ ___ widespread support.",
          options: ["has garnered", "have garnered", "garnering", "garners"],
          correct_answer: "has garnered",
        },
      ],
    },
    "Future Simple": {
      Basic: [
        {
          question_text: "I ___ you tomorrow.",
          options: ["call", "calls", "will call", "called"],
          correct_answer: "will call",
        },
        {
          question_text: "She ___ to the party tonight.",
          options: ["come", "comes", "will come", "came"],
          correct_answer: "will come",
        },
        {
          question_text: "They ___ the test next week.",
          options: ["take", "takes", "will take", "took"],
          correct_answer: "will take",
        },
        {
          question_text: "We ___ dinner at 7 PM.",
          options: ["have", "has", "will have", "had"],
          correct_answer: "will have",
        },
        {
          question_text: "He ___ his homework later.",
          options: ["finish", "finishes", "will finish", "finished"],
          correct_answer: "will finish",
        },
        {
          question_text: "The movie ___ at 8 PM.",
          options: ["start", "starts", "will start", "started"],
          correct_answer: "will start",
        },
        {
          question_text: "I ___ you at the station.",
          options: ["meet", "meets", "will meet", "met"],
          correct_answer: "will meet",
        },
        {
          question_text: "She ___ a new car next month.",
          options: ["buy", "buys", "will buy", "bought"],
          correct_answer: "will buy",
        },
        {
          question_text: "They ___ to London next summer.",
          options: ["travel", "travels", "will travel", "traveled"],
          correct_answer: "will travel",
        },
        {
          question_text: "It ___ sunny tomorrow.",
          options: ["is", "be", "will be", "was"],
          correct_answer: "will be",
        },
      ],
      Advanced: [
        {
          question_text: "The committee ___ the proposal next quarter.",
          options: ["review", "reviews", "will review", "reviewed"],
          correct_answer: "will review",
        },
        {
          question_text: "She ___ her findings at the conference.",
          options: ["present", "presents", "will present", "presented"],
          correct_answer: "will present",
        },
        {
          question_text: "The project ___ significant resources.",
          options: ["require", "requires", "will require", "required"],
          correct_answer: "will require",
        },
        {
          question_text: "Experts ___ the implications thoroughly.",
          options: ["analyze", "analyzes", "will analyze", "analyzed"],
          correct_answer: "will analyze",
        },
        {
          question_text: "The organization ___ new initiatives soon.",
          options: ["implement", "implements", "will implement", "implemented"],
          correct_answer: "will implement",
        },
        {
          question_text: "He ___ the strategy with stakeholders.",
          options: ["discuss", "discusses", "will discuss", "discussed"],
          correct_answer: "will discuss",
        },
        {
          question_text: "The economy ___ challenges in the coming years.",
          options: ["face", "faces", "will face", "faced"],
          correct_answer: "will face",
        },
        {
          question_text: "Researchers ___ valuable insights from the data.",
          options: ["derive", "derives", "will derive", "derived"],
          correct_answer: "will derive",
        },
        {
          question_text: "The board ___ on the matter next month.",
          options: ["deliberate", "deliberates", "will deliberate", "deliberated"],
          correct_answer: "will deliberate",
        },
        {
          question_text: "This approach ___ better outcomes.",
          options: ["yield", "yields", "will yield", "yielded"],
          correct_answer: "will yield",
        },
      ],
    },
  };
}

// Singleton instance
export const mockAiQuestionGeneratorService = new MockAIQuestionGeneratorService();
