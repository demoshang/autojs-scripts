function signIn(): void {
  textContains('立即签到').findOnce()?.click();
}

export { signIn };
