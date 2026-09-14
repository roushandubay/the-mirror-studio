export type SceneOptions = {
  /** 0..1 scroll progress, read once per frame. Unset = the scene idles on its own clock. */
  progress?: () => number;
  /** accent colour, hex */
  accent?: string;
  /** particles: the words assembled in order across progress */
  words?: string[];
  /** mirror: image for the box's front face (defaults to the studio logo) */
  texture?: string;
};
