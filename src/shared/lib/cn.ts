import clsx from "clsx";

export function cn(...args: Array<string | undefined | false | null>) {
  return clsx(args);
}
