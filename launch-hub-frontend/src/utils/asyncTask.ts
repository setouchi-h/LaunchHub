export const asyncTask = (action: () => Promise<void>) => {
  (async () => {
    action()
  })()
}