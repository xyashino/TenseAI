/**
 * Generates a unique ID for a question option
 * @param questionId - The ID of the question
 * @param index - The index of the option
 * @returns A unique ID string in format: `${questionId}-option-${index}`
 */
export const getOptionId = (questionId: string, index: number): string => {
  return `${questionId}-option-${index}`;
};

/**
 * Scrolls to an element by ID and focuses it
 * @param elementId - The ID of the element to scroll to
 */
export const scrollToElement = (elementId: string) => {
  const elementToFocus = document.getElementById(elementId);
  if (!elementToFocus) return;
  requestAnimationFrame(() => {
    elementToFocus.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  });
};
