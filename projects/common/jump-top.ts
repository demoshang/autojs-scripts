function jumpTop(): void {
  for (let i = 0; i < 10; i += 1) {
    swipe(
      device.width / 2,
      device.height / 4,
      device.width / 2,
      (device.height * 3) / 4,
      100
    );
  }
  sleep(1000);
}

export { jumpTop };
