import { Rich, useLang } from '../i18n'
import { LabAutomate, LabBento, LabIncident, LabMission, LabPlan } from './LabDemos'
import { SectionHead } from './SectionHead'

/**
 * Lab concepts under comparison, picked with ?lab=bento|automate|mission|plan|incident (default bento).
 * bento: v1 globe + tech stack cube + live GitHub tiles · automate: a manual task races its automation ·
 * mission: live GitHub activity · plan: project configurator · incident: a production incident, alert to postmortem.
 */
const DEMOS = { bento: LabBento, automate: LabAutomate, mission: LabMission, plan: LabPlan, incident: LabIncident }
type Demo = keyof typeof DEMOS
const param = new URLSearchParams(window.location.search).get('lab')
const variant: Demo = param && param in DEMOS ? (param as Demo) : 'bento'

export function Lab() {
  const { t } = useLang()
  const c = t.ui.lab[variant]
  const Demo = DEMOS[variant]
  return (
    <section className="lab" id="lab">
      <SectionHead label={t.ui.labLabel} title={c.title} lead={<Rich text={c.lead} />} />
      <Demo />
    </section>
  )
}
