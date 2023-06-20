export const extractFileNameFromUrl = (urlString: string): string => {
  return urlString.substring(urlString.lastIndexOf("/") + 1)
}