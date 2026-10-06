import { ViewTransition } from "react";

// Wraps a page's content so navigating animates it: tab switches crossfade,
// links tagged "nav-forward" (into a work or a show) slide in from the right,
// links tagged "nav-back" slide back. The tab bar lives in the layout and
// does not move.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "page-fade" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "page-fade" }}
      default="none"
    >
      <div>{children}</div>
    </ViewTransition>
  );
}

// The same picture on a card and on its page: the browser morphs one into the other.
export function Morph({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <ViewTransition name={name} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}

export const FORWARD = ["nav-forward"];
export const BACK = ["nav-back"];
