import { createAvatar } from "@dicebear/core";
import * as style from "@dicebear/initials";

export const generateInitialsAvatar = (name: string) => {
  const avatar = createAvatar(style, {
    seed: name,
    radius: 50,
  });

  const base64 = Buffer.from(avatar.toString()).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
};
