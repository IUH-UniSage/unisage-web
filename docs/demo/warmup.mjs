// Asks every demo question twice per account, without recording, so the agent's retrieval
// cache (Redis, written on a query's second sighting, kept RETRIEVAL_CACHE_TTL_SECONDS = 6 h)
// already holds their results when the videos are recorded. Web search is off in this
// environment, so there is no web-search cache to warm.
//
//   node docs/demo/warmup.mjs
//   ONLY_ACCOUNTS=cnpmL1,guest node docs/demo/warmup.mjs   # only these accounts
//
// Run it within 6 hours before recording. Its conversations are deleted afterwards (the
// recording scripts also clear demo-titled conversations before they start). No
// clarification panel is answered, but a question naming a cohort or major may still be saved
// into the account's academic profile: reset the demo profiles after warming up.

import { BASE, clearDemoConversations, log, recordVideo } from "./lib/demo-kit.mjs"
import { WARMUP } from "./lib/questions.mjs"

const ROUNDS = 2
const only = process.env.ONLY_ACCOUNTS?.split(",")
const wanted = (key) => !only || only.includes(key ?? "guest")
const accounts = [...new Set(WARMUP.map(([key]) => key).filter(Boolean))].filter(wanted)

for (let round = 1; round <= ROUNDS; round += 1) {
  for (const key of [...(wanted(null) ? [null] : []), ...accounts]) {
    const conversations = WARMUP.filter(([owner]) => owner === key).map(([, qs]) => qs)
    await recordVideo(
      {
        name: `warmup-${round}-${key ?? "guest"}`, outDir: "/tmp", logoFile: "/home/huy/Main/image.png",
        totalSteps: 0, accounts: key ? [key] : [], record: false,
      },
      async (d) => {
        if (key) await d.login(key)
        for (const questions of conversations) {
          await d.scene(`${key ?? "guest"}: ${questions[0]}`, async () => {
            if (key) await d.newChat()
            else await d.page.goto(`${BASE}/`)
            for (const [index, question] of questions.entries()) {
              const input = !key && index === 0 ? d.page.getByLabel("Hỏi UniSage") : undefined
              await d.ask(question, { input })
            }
          })
        }
      }
    )
  }
  log(`round ${round}/${ROUNDS} done`)
}

for (const key of accounts) {
  const titles = WARMUP.filter(([owner]) => owner === key).map(([, qs]) => qs[0])
  await clearDemoConversations(key, titles)
}
