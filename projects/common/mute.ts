importClass(android.content.Context);
importClass(android.media.AudioManager);

const audioManager = context.getSystemService(Context.AUDIO_SERVICE);

function muteMusic(): void {
  audioManager.adjustStreamVolume(
    AudioManager.STREAM_MUSIC,
    AudioManager.ADJUST_MUTE,
    0
  );
}

function unMuteMusic(): void {
  audioManager.adjustStreamVolume(
    AudioManager.STREAM_MUSIC,
    AudioManager.ADJUST_UNMUTE,
    0
  );
}

function toggleMuteMusic(): void {
  if (audioManager.isStreamMute(AudioManager.STREAM_MUSIC)) {
    unMuteMusic();
  } else {
    muteMusic();
  }
}

function muteRestoreMusic(): () => void {
  const isMute = audioManager.isStreamMute(AudioManager.STREAM_MUSIC);
  if (!isMute) {
    muteMusic();

    return () => {
      unMuteMusic();
    };
  }
  return () => {};
}

export { toggleMuteMusic, muteMusic, unMuteMusic, muteRestoreMusic };
