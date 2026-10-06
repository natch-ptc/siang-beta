"use client";

import { useSyncExternalStore } from "react";
import { noteHeard } from "./listens";

// One sound plays at a time across the whole app: the waveform button on a
// card and the player on a work's page drive the same <audio>, so starting a
// work stops the one before it. Nothing ever plays without a tap (PRD rule 12).
export type Track = { id: string; url: string; durationSec: number }; // id is artworks.id

type State = { id: string | null; playing: boolean; loading: boolean; time: number; duration: number };

let state: State = { id: null, playing: false, loading: false, time: 0, duration: 0 };
const IDLE: State = state;
const listeners = new Set<() => void>();
let audio: HTMLAudioElement | null = null;

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function element() {
  if (audio) return audio;
  const a = new Audio();
  a.preload = "metadata";
  a.addEventListener("loadedmetadata", () => {
    if (Number.isFinite(a.duration)) set({ duration: a.duration });
  });
  a.addEventListener("timeupdate", () => {
    set({ time: a.currentTime });
    if (state.id) noteHeard(state.id, a.currentTime, state.duration);
  });
  a.addEventListener("playing", () => set({ playing: true, loading: false }));
  a.addEventListener("waiting", () => set({ loading: true }));
  a.addEventListener("pause", () => set({ playing: false, loading: false }));
  a.addEventListener("ended", () => set({ playing: false, time: 0 }));
  a.addEventListener("error", () => set({ playing: false, loading: false }));
  audio = a;
  return a;
}

export function toggleSound(track: Track) {
  const a = element();
  if (state.id !== track.id) {
    a.src = track.url;
    set({ id: track.id, time: 0, duration: track.durationSec, playing: false });
  }
  if (a.paused) {
    set({ loading: true });
    a.play().catch(() => set({ loading: false }));
  } else {
    a.pause();
  }
}

// Jump to a fraction (0..1) of the sound that is loaded.
export function seekSound(id: string, fraction: number) {
  if (!audio || state.id !== id || !state.duration) return;
  audio.currentTime = Math.max(0, Math.min(1, fraction)) * state.duration;
  set({ time: audio.currentTime });
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

// The player's state as seen by one work: idle unless it is the one loaded.
export function useSound(id: string) {
  const s = useSyncExternalStore(
    subscribe,
    () => state,
    () => IDLE
  );
  return s.id === id ? s : IDLE;
}
