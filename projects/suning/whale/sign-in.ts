function signIn() {
  textContains('立即签到').findOnce()?.click();
}

export { signIn };
