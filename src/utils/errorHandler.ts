export const handleError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error);
  return { message: `Failed to ${context}` };
};
