type UserId = string | null | undefined;

export const IdentityRules = {
  requireUser(userId: UserId): void {
    if (!userId) {
      throw new Error("Authentication required");
    }
  },
  canResetPassword(userId: UserId): void {
    this.requireUser(userId);
  },
  canPerformAuthenticatedOperation(userId: UserId): void {
    this.requireUser(userId);
  },
};
