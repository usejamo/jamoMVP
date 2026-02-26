import type { ContentBlock } from '../types/draft'

export interface DemoCommand {
  key: string
  label: string
  targetId: string
  explanation: string
  suggestedPreview: string
  assistantMessage: string
  acceptedBlocks: ContentBlock[]
}

const t = (plain: string) => ({ plain })

export const DEMO_COMMANDS: DemoCommand[] = [
  {
    key: 'update_pricing',
    label: 'Update pricing',
    targetId: 's7',
    explanation: 'Updated the budget to reflect a revised scope including an optional food effect cohort and expanded site costs.',
    suggestedPreview: 'Revised total: $850,000 — includes optional food effect cohort (+$95K) and updated site cost estimate (+$152K).',
    assistantMessage: "I've updated the Budget Summary with the revised scope. The new total reflects the optional food effect cohort and updated pass-through estimates. Review the highlighted section and accept or decline.",
    acceptedBlocks: [
      {
        kind: 'p',
        segments: [
          t('The following represents a high-level summary of the proposed budget, updated to reflect the expanded scope including the optional food effect cohort and revised site cost estimates. A detailed line-item budget is provided as a separate Excel attachment.'),
        ],
      },
      {
        kind: 'table',
        headers: ['Functional Area', 'Service Fees', 'Pass-Through Costs', 'Total'],
        rows: [
          ['Project Management', '$95,000', '—', '$95,000'],
          ['Clinical Operations', '$138,000', '$55,000', '$193,000'],
          ['Data Management', '$60,000', '$9,000', '$69,000'],
          ['Biostatistics & Programming', '$52,000', '—', '$52,000'],
          ['Regulatory Affairs', '$24,000', '$6,000', '$30,000'],
          ['Medical Monitoring', '$33,000', '—', '$33,000'],
          ['Site Costs (estimated)', '—', '$195,000', '$195,000'],
          ['Lab / Bioanalytical (estimated)', '—', '$40,000', '$40,000'],
          ['Food Effect Cohort (optional)', '$48,000', '$47,000', '$95,000'],
          ['TOTAL', '$450,000', '$352,000', '$802,000'],
        ],
      },
      {
        kind: 'p',
        segments: [
          t('All pass-through costs are estimated and will be invoiced at actuals. Service fees are fixed-price per agreed scope. The food effect cohort is priced as a separate option and will only be activated upon written sponsor authorization.'),
        ],
      },
    ],
  },
  {
    key: 'punchier_intro',
    label: 'Make the intro punchier',
    targetId: 's1',
    explanation: "Condensed the Executive Summary to a tighter two-sentence opener that leads with value, not process.",
    suggestedPreview: `"We've run studies like this before — and we've won them. This proposal outlines a fully resourced, risk-mitigated plan to deliver your Phase I program on time, on budget, and audit-ready from day one."`,
    assistantMessage: "Done — I've tightened up the Executive Summary. The new opener leads with confidence and cuts straight to what the sponsor cares about. Accept to apply it.",
    acceptedBlocks: [
      {
        kind: 'p',
        segments: [
          t("We've run studies like this before — and we've won them. This proposal outlines a fully resourced, risk-mitigated plan to deliver your Phase I program on time, on budget, and audit-ready from day one."),
        ],
      },
      {
        kind: 'p',
        segments: [
          t("Our dedicated project team is ready to mobilize within four weeks of contract execution. All scope assumptions, exclusions, and key dependencies are detailed in Section 8."),
        ],
      },
    ],
  },
  {
    key: 'call_to_action',
    label: 'Add a call to action',
    targetId: 's11',
    explanation: 'Added a Next Steps section to the Appendices with a clear call to action for the sponsor.',
    suggestedPreview: 'Adds "Next Steps" to the appendix list — inviting the sponsor to schedule a follow-up call to discuss scope, timeline, and budget before the proposal deadline.',
    assistantMessage: "I've added a 'Next Steps' call to action to the Appendices section. It gives the sponsor a clear path forward and keeps the momentum going. Accept to add it.",
    acceptedBlocks: [
      {
        kind: 'ul',
        items: [
          [t('Appendix A — Key Personnel CVs (Project Manager, Clinical Lead, Data Manager, Biostatistician, Medical Monitor)')],
          [t('Appendix B — SOP Index (full SOP library available upon request under confidentiality agreement)')],
          [t('Appendix C — Client References (available upon request; names and contacts provided under NDA)')],
          [t('Appendix D — Detailed Line-Item Budget (Excel attachment)')],
          [t('Appendix E — Draft Project Gantt Chart')],
        ],
      },
      {
        kind: 'p',
        segments: [
          t('— '),
        ],
      },
      {
        kind: 'p',
        segments: [
          t("Next Steps: We'd welcome the opportunity to walk you through this proposal in detail. Please reach out to schedule a 30-minute follow-up call at your earliest convenience — we're available to discuss scope, timeline, budget, and any outstanding questions before the proposal deadline."),
        ],
      },
      {
        kind: 'p',
        segments: [
          t('📅  Schedule a follow-up call → contact@cro.com  |  +1 (800) 555-0100'),
        ],
      },
    ],
  },
]

export const COMMAND_MAP: Record<string, DemoCommand> = Object.fromEntries(
  DEMO_COMMANDS.map(c => [c.key, c])
)

export function matchCommand(input: string): DemoCommand | null {
  const lower = input.toLowerCase().trim()
  return DEMO_COMMANDS.find(c =>
    lower.includes(c.label.toLowerCase()) ||
    lower.includes(c.key.replace('_', ' '))
  ) ?? null
}
