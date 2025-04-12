import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Logger utility for consistent logging
export const logger = {
  info: (message: string, ...optionalParams: unknown[]) => {
    console.info(`[INFO]: ${message}`, ...optionalParams);
  },
  warn: (message: string, ...optionalParams: unknown[]) => {
    console.warn(`[WARN]: ${message}`, ...optionalParams);
  },
  error: (message: string, ...optionalParams: unknown[]) => {
    console.error(`[ERROR]: ${message}`, ...optionalParams);
  },
  debug: (message: string, ...optionalParams: unknown[]) => {
    console.debug(`[DEBUG]: ${message}`, ...optionalParams);
  },
};
