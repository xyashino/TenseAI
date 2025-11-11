Generate exactly {{count}} multiple-choice questions for practicing **{{tense}}** at the **{{difficulty}}** difficulty level.

## Requirements:

1. **Difficulty Level Guidelines:**
   - **Basic (A2/B1)**: Use simple, everyday vocabulary. Focus on common verbs and familiar contexts (daily routines, simple activities, basic situations).
   - **Advanced (B2)**: Use more sophisticated vocabulary and complex sentence structures. Include professional, academic, or abstract contexts.

2. **Question Format:**
   - Each question should be a sentence with a blank (represented by "___")
   - Provide exactly 4 multiple-choice options
   - One option must be the correct answer
   - The other 3 options should be plausible distractors that test understanding of the tense rules

3. **Question Quality:**
   - Questions should be varied in structure and context
   - Avoid repetitive patterns
   - Each question should test a specific aspect of {{tense}}
   - Use natural, real-world contexts
   - Ensure all options are grammatically valid English (even if incorrect for the tense)

4. **Tense-Specific Guidelines:**
   - For **Present Simple**: Test subject-verb agreement, third-person singular forms, and usage for habits/routines/facts
   - For **Past Simple**: Test regular (-ed) and irregular verb forms, and usage for completed past actions
   - For **Present Perfect**: Test has/have usage, past participles (regular and irregular), and usage for experiences/recent actions/unfinished time
   - For **Future Simple**: Test "will" + base form structure and usage for predictions/decisions/promises

5. **Output Format:**
   - Return a JSON array with exactly {{count}} question objects
   - Each object must have: `question_text`, `options` (array of 4 strings), and `correct_answer` (one of the options)

## Example Output Format:

```json
[
  {
    "question_text": "She ___ to work every day.",
    "options": ["go", "goes", "going", "went"],
    "correct_answer": "goes"
  },
  {
    "question_text": "They ___ English at home.",
    "options": ["speaks", "speak", "speaking", "spoke"],
    "correct_answer": "speak"
  }
]
```

Now generate exactly {{count}} questions for {{tense}} at the {{difficulty}} level.
