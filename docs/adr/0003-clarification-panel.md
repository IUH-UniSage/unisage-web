# 3. Ask follow-up questions in a docked panel derived from message metadata

Status: accepted

## Decision

When the agent needs more input, the web shows a tabbed question panel docked above the chat
composer (one tab per question, the composer locked until the student answers or cancels),
instead of a form rendered inside the assistant message. The panel accepts free-text input
(numbers, number lists, a course table, short text, and "Khác" on choices), and whether it is
open is derived purely from `messages[].metadata` (contract
`unisage-agent/contracts/chat-sse.md` §5), with no extra client state.

## Context

The previous `AskUserFormCard` parsed a fenced `ask_user_form` JSON block out of the reply
text and rendered chips/selects inside the message. A code comment recorded a product rule
that the form must never offer free-text input, only predefined options. UNISAGE-99 adds
calculations (GPA, component scores, tuition) whose parameters are numbers and course lists
that cannot be expressed as a handful of options. The in-message form also had no reliable
"answered" state: it had to reverse-parse the student's text reply after a reload, and nothing
stopped the student from typing an unrelated message while a question was pending, so the
agent's pending task could be orphaned.

## Alternatives considered

- **Keep the in-message form, add inputs to it** - rejected: a form scrolling away with the
  history makes "you must answer this first" invisible, and answered state still depends on
  parsing text out of the reply.
- **Modal dialog** - rejected: it hides the reply that explains why the questions are asked,
  and is heavy on a 375px screen.
- **Keep panel state in a client store (open/answered flags)** - rejected: it drifts from the
  server after a reload, another tab, or a failed request; the server already persists the
  panel status on the assistant message.
- **Docked panel + free-text input + state derived from metadata (chosen)** - the panel sits
  where the next input would go, the composer is locked while it is open, and
  `deriveOpenPanel(messages)` (open iff the last message is a COMPLETED ASSISTANT message with
  `metadata.clarification.status == "open"`) gives the same answer after reload, refetch, or a
  second tab. The answered turn renders from `metadata.clarification_answers`, not from text.

## Consequences

- Reverses the old "no free-text input" rule (it lived only in a comment in
  `ask-user-form.tsx`): numeric and text answers are allowed and validated client-side with the
  same rules as the server, which remains the final judge (`4010` errors land on their tab).
- The draft is a client convenience in `sessionStorage` keyed by `panel_id`; losing it never
  breaks the flow.
- Old messages that still contain an `ask_user_form` fence are stripped and shown read-only
  ("Câu hỏi bổ sung (phiên bản cũ)"); they never open the panel.
- Reverting would mean reintroducing text parsing of the reply and the agent re-emitting the
  fenced block, which the agent no longer streams.
