// Jobs page server-renders its own initial state, so we suppress
// the default Next.js loading UI to avoid a flash of empty content.
export default function JobsLoading() {
  return null
}
