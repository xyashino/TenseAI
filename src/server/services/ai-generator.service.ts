import type { DifficultyLevel, TenseName } from "@/types";

interface GeneratedQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
}

/**
 * Mock AI Generator Service
 *
 * Generates predefined grammar questions and feedback based on tense and difficulty.
 * This is a temporary mock implementation that will be replaced with
 * real OpenRouter API integration in the future.
 */
export class MockAIGeneratorService {
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

  /**
   * Generate brief feedback for a completed round based on incorrect answers
   * @param incorrectAnswers - Array of incorrect answers with correct answers shown
   * @param tense - Grammar tense being practiced
   * @param difficulty - Difficulty level
   * @param score - User's score (0-10)
   * @returns Markdown-formatted feedback string
   */
  async generateRoundFeedback(
    incorrectAnswers: {
      question_text: string;
      user_answer: string;
      correct_answer: string;
    }[],
    tense: TenseName,
    difficulty: DifficultyLevel,
    score: number
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (score === 10) {
      return `**Perfect score!**\n\nExcellent work! You demonstrated complete mastery of ${tense} at the ${difficulty} level. Keep up the great work!`;
    }

    let feedback = "";

    if (score >= 8) {
      feedback = `**Great job!**\n\nYou scored ${score}/10 on ${tense} (${difficulty} level). You have a strong grasp of this tense.`;
    } else if (score >= 6) {
      feedback = `**Good effort!**\n\nYou scored ${score}/10 on ${tense} (${difficulty} level). You're making progress, but there's room for improvement.`;
    } else if (score >= 4) {
      feedback = `**Keep practicing!**\n\nYou scored ${score}/10 on ${tense} (${difficulty} level). This tense requires more practice to master.`;
    } else {
      feedback = `**Don't give up!**\n\nYou scored ${score}/10 on ${tense} (${difficulty} level). This tense is challenging, but with focused practice, you'll improve.`;
    }

    feedback += `\n\n**Tips for ${tense}:**\n`;
    switch (tense) {
      case "Present Simple":
        feedback += `- Remember to add 's' or 'es' for third-person singular (he/she/it)\n- Use base form for I/you/we/they`;
        break;
      case "Past Simple":
        feedback += `- Regular verbs: add -ed\n- Irregular verbs: memorize common forms (go→went, see→saw)`;
        break;
      case "Present Perfect":
        feedback += `- Use 'has' for he/she/it, 'have' for I/you/we/they\n- Past participle form for main verb`;
        break;
      case "Future Simple":
        feedback += `- Use 'will' + base form of verb\n- Same form for all subjects`;
        break;
    }

    return feedback;
  }

  /**
   * Generate comprehensive final feedback for a completed training session
   * @param incorrectAnswers - Array of all incorrect answers across all rounds
   * @param tense - Grammar tense being practiced
   * @param difficulty - Difficulty level
   * @returns Markdown-formatted final feedback string
   */
  async generateFinalFeedback(
    incorrectAnswers: {
      question_text: string;
      user_answer: string;
      correct_answer: string;
      round_number: number;
      question_number: number;
    }[],
    tense: TenseName,
    difficulty: DifficultyLevel
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Perfect score - no incorrect answers
    if (incorrectAnswers.length === 0) {
      return this.generateCongratulationsMessage(tense, difficulty);
    }

    // Generate comprehensive feedback for errors
    const totalQuestions = 30;
    const correctAnswers = totalQuestions - incorrectAnswers.length;
    const accuracyPercentage = Math.round((correctAnswers / totalQuestions) * 100);

    let feedback = `# Training Session Complete\n\n`;
    feedback += `## Overall Performance\n\n`;
    feedback += `You scored **${correctAnswers}/${totalQuestions}** (${accuracyPercentage}%) on **${tense}** at the **${difficulty}** level.\n\n`;

    if (accuracyPercentage >= 90) {
      feedback += `Excellent work! You have a strong command of this tense.\n\n`;
    } else if (accuracyPercentage >= 70) {
      feedback += `Good job! You're making solid progress with this tense.\n\n`;
    } else if (accuracyPercentage >= 50) {
      feedback += `You're on the right track, but there's room for improvement.\n\n`;
    } else {
      feedback += `This tense is challenging. Don't be discouraged - consistent practice will help you improve.\n\n`;
    }

    // Add areas for improvement section
    feedback += `## Areas for Improvement\n\n`;
    feedback += `You made **${incorrectAnswers.length}** error${incorrectAnswers.length > 1 ? "s" : ""} across all three rounds. `;
    feedback += `Let's review the key areas where you can improve:\n\n`;

    // Add specific grammar tips based on tense
    feedback += this.getTenseSpecificGuidance(tense, difficulty);

    // Add common patterns in errors if there are multiple mistakes
    if (incorrectAnswers.length >= 3) {
      feedback += `\n### Common Patterns in Your Errors\n\n`;
      feedback += this.analyzeErrorPatterns(incorrectAnswers, tense);
    }

    // Add practice recommendations
    feedback += `\n## Practice Recommendations\n\n`;
    if (accuracyPercentage >= 80) {
      if (difficulty === "Basic") {
        feedback += `- Consider trying the **Advanced** level to challenge yourself further\n`;
        feedback += `- Focus on the few areas where you made mistakes\n`;
        feedback += `- Try practicing with different tenses to broaden your skills\n`;
      } else {
        feedback += `- You're doing great! Keep practicing to maintain your proficiency\n`;
        feedback += `- Try creating your own sentences using ${tense}\n`;
        feedback += `- Consider teaching others - it's a great way to reinforce your knowledge\n`;
      }
    } else if (accuracyPercentage >= 60) {
      feedback += `- Review the grammar rules for ${tense}\n`;
      feedback += `- Practice with more examples at the ${difficulty} level\n`;
      feedback += `- Focus on the specific error patterns identified above\n`;
      feedback += `- Try the session again after reviewing the rules\n`;
    } else {
      feedback += `- Start by reviewing the fundamental rules of ${tense}\n`;
      if (difficulty === "Advanced") {
        feedback += `- Consider practicing at the **Basic** level first to build your foundation\n`;
      }
      feedback += `- Practice regularly - even 10 minutes a day can make a big difference\n`;
      feedback += `- Don't rush - take your time to understand each question\n`;
      feedback += `- Review your incorrect answers carefully to understand the patterns\n`;
    }

    feedback += `\n## Keep Going!\n\n`;
    feedback += `Remember, learning a language takes time and practice. `;
    feedback += `Each session helps you improve. Keep up the good work! 🎯\n`;

    return feedback;
  }

  /**
   * Generate congratulations message for perfect score
   */
  private generateCongratulationsMessage(tense: TenseName, difficulty: DifficultyLevel): string {
    return (
      `# 🎉 Perfect Score!\n\n` +
      `## Congratulations!\n\n` +
      `You've achieved a **flawless 30/30** on **${tense}** at the **${difficulty}** level! ` +
      `This is an outstanding accomplishment that demonstrates complete mastery of this tense.\n\n` +
      `## What This Means\n\n` +
      `- ✅ You have **mastered** the grammar rules for ${tense}\n` +
      `- ✅ You can **confidently** identify correct usage in various contexts\n` +
      `- ✅ You're ready to apply this knowledge in real-world communication\n\n` +
      `## Next Steps\n\n` +
      (difficulty === "Basic"
        ? `- Challenge yourself with the **Advanced** level for ${tense}\n` +
          `- Explore other tenses to expand your grammar skills\n` +
          `- Practice using ${tense} in writing and speaking\n`
        : `- Excellent work at the Advanced level! You've truly mastered ${tense}\n` +
          `- Consider exploring other tenses to broaden your grammar expertise\n` +
          `- Apply your knowledge by writing or speaking in English\n`) +
      `\n**Keep up the exceptional work!** 🌟\n`
    );
  }

  /**
   * Get tense-specific guidance and tips
   */
  private getTenseSpecificGuidance(tense: TenseName, difficulty: DifficultyLevel): string {
    let guidance = "";

    switch (tense) {
      case "Present Simple":
        guidance += `### Key Rules for Present Simple\n\n`;
        guidance += `1. **Subject-Verb Agreement**\n`;
        guidance += `   - For third-person singular (he/she/it): add **-s** or **-es** to the verb\n`;
        guidance += `   - For I/you/we/they: use the **base form** of the verb\n\n`;
        if (difficulty === "Advanced") {
          guidance += `2. **Special Cases**\n`;
          guidance += `   - Collective nouns (committee, team) often take singular verbs\n`;
          guidance += `   - Uncountable nouns always take singular verbs\n`;
          guidance += `   - Some verbs ending in -o add -es (go→goes)\n\n`;
        }
        guidance += `3. **Common Uses**\n`;
        guidance += `   - Habits and routines\n`;
        guidance += `   - Universal truths and facts\n`;
        guidance += `   - Scheduled events\n`;
        break;

      case "Past Simple":
        guidance += `### Key Rules for Past Simple\n\n`;
        guidance += `1. **Regular Verbs**\n`;
        guidance += `   - Add **-ed** to the base form (walk→walked, play→played)\n`;
        guidance += `   - Verbs ending in -e: just add -d (love→loved)\n`;
        guidance += `   - Verbs ending in consonant+y: change y to i and add -ed (study→studied)\n\n`;
        guidance += `2. **Irregular Verbs**\n`;
        guidance += `   - Must be memorized (go→went, see→saw, eat→ate)\n`;
        guidance += `   - No consistent pattern\n\n`;
        if (difficulty === "Advanced") {
          guidance += `3. **Common Irregular Patterns**\n`;
          guidance += `   - Vowel changes: sing→sang, drink→drank\n`;
          guidance += `   - No change: cut→cut, put→put\n`;
          guidance += `   - Completely different: be→was/were, have→had\n\n`;
        }
        break;

      case "Present Perfect":
        guidance += `### Key Rules for Present Perfect\n\n`;
        guidance += `1. **Structure**\n`;
        guidance += `   - **have/has** + **past participle**\n`;
        guidance += `   - Use 'has' with he/she/it\n`;
        guidance += `   - Use 'have' with I/you/we/they\n\n`;
        guidance += `2. **Past Participles**\n`;
        guidance += `   - Regular: same as past simple (walked, played)\n`;
        guidance += `   - Irregular: must be memorized (gone, seen, eaten)\n\n`;
        if (difficulty === "Advanced") {
          guidance += `3. **Usage Contexts**\n`;
          guidance += `   - Unfinished time periods (this week, this year)\n`;
          guidance += `   - Life experiences (ever, never)\n`;
          guidance += `   - Recent actions with present relevance (just, already, yet)\n\n`;
        }
        break;

      case "Future Simple":
        guidance += `### Key Rules for Future Simple\n\n`;
        guidance += `1. **Structure**\n`;
        guidance += `   - **will** + **base form** of the verb\n`;
        guidance += `   - Same form for all subjects (I/you/he/she/it/we/they will)\n\n`;
        guidance += `2. **Common Uses**\n`;
        guidance += `   - Predictions about the future\n`;
        guidance += `   - Spontaneous decisions\n`;
        guidance += `   - Promises and offers\n\n`;
        if (difficulty === "Advanced") {
          guidance += `3. **Formal vs. Informal**\n`;
          guidance += `   - Formal: shall (with I/we)\n`;
          guidance += `   - Informal: gonna (going to)\n`;
          guidance += `   - Negative: will not / won't\n\n`;
        }
        break;
    }

    return guidance;
  }

  /**
   * Analyze error patterns to provide targeted feedback
   */
  private analyzeErrorPatterns(
    incorrectAnswers: {
      question_text: string;
      user_answer: string;
      correct_answer: string;
      round_number: number;
      question_number: number;
    }[],
    tense: TenseName
  ): string {
    let analysis = "";

    // Group errors by round to see if there's improvement or decline
    const errorsByRound = incorrectAnswers.reduce(
      (acc, answer) => {
        acc[answer.round_number] = (acc[answer.round_number] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    const roundNumbers = Object.keys(errorsByRound).map(Number).sort();
    const errorCounts = roundNumbers.map((r) => errorsByRound[r]);

    if (roundNumbers.length >= 2) {
      if (errorCounts[errorCounts.length - 1] < errorCounts[0]) {
        analysis += `- **Positive trend**: You made fewer errors in later rounds, showing improvement during the session! 📈\n`;
      } else if (errorCounts[errorCounts.length - 1] > errorCounts[0]) {
        analysis += `- You made more errors in later rounds. Consider taking breaks to maintain focus. 🧘\n`;
      } else {
        analysis += `- Your error rate was consistent across rounds. More practice will help you improve. 📚\n`;
      }
    }

    // Analyze answer patterns
    const answerPatterns = this.detectAnswerPatterns(incorrectAnswers, tense);
    if (answerPatterns.length > 0) {
      analysis += answerPatterns.join("\n");
    }

    return analysis;
  }

  /**
   * Detect specific patterns in user's incorrect answers
   */
  private detectAnswerPatterns(
    incorrectAnswers: {
      user_answer: string;
      correct_answer: string;
    }[],
    tense: TenseName
  ): string[] {
    const patterns: string[] = [];

    switch (tense) {
      case "Present Simple": {
        const missingS = incorrectAnswers.filter(
          (a) => a.correct_answer.endsWith("s") && a.user_answer === a.correct_answer.slice(0, -1)
        );
        if (missingS.length >= 2) {
          patterns.push(`- **Subject-verb agreement**: You frequently forgot to add '-s' for third-person singular`);
        }
        break;
      }

      case "Past Simple": {
        const irregularErrors = incorrectAnswers.filter(
          (a) => a.user_answer.endsWith("ed") && !a.correct_answer.endsWith("ed")
        );
        if (irregularErrors.length >= 2) {
          patterns.push(`- **Irregular verbs**: You often used the regular -ed ending for irregular verbs`);
        }
        break;
      }

      case "Present Perfect": {
        const hasHaveErrors = incorrectAnswers.filter(
          (a) =>
            (a.correct_answer.startsWith("has") && a.user_answer.startsWith("have")) ||
            (a.correct_answer.startsWith("have") && a.user_answer.startsWith("has"))
        );
        if (hasHaveErrors.length >= 2) {
          patterns.push(`- **Has/Have confusion**: Review which subjects take 'has' vs 'have'`);
        }
        break;
      }

      case "Future Simple": {
        const missingWill = incorrectAnswers.filter(
          (a) => a.correct_answer.startsWith("will") && !a.user_answer.includes("will")
        );
        if (missingWill.length >= 2) {
          patterns.push(`- **Future marker**: Don't forget to use 'will' before the base verb`);
        }
        break;
      }
    }

    return patterns;
  }
}

// Singleton instance
export const mockAiGeneratorService = new MockAIGeneratorService();
