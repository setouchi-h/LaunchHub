const CHARACTORS = "01234567890123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

export const randomCharactors = (length: number): string => {
  return Array(length).fill("a").map((value) => (CHARACTORS[Math.floor(Math.random() * CHARACTORS.length)])).join("")
}