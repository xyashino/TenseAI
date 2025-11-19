import fs from "node:fs/promises";
import path from "node:path";

export class PromptLoader {
  constructor(private baseDir: string) {}

  async loadPrompt(promptName: string): Promise<{ system: string; user: string }> {
    try {
      const systemPath = path.join(this.baseDir, promptName, "system.md");
      const userPath = path.join(this.baseDir, promptName, "user.md");

      const [system, user] = await Promise.all([fs.readFile(systemPath, "utf-8"), fs.readFile(userPath, "utf-8")]);

      return { system, user };
    } catch (error) {
      throw new Error(
        `Could not load prompt files for "${promptName}" from "${this.baseDir}". Error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  static substituteVariables(template: string, variables: Record<string, string>): string {
    return template.replace(/{{(\w+)}}/g, (placeholder, key) => {
      return variables[key] || placeholder;
    });
  }
}
