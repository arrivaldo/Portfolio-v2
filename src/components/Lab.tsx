import { Rich, useLang } from '../i18n'
import { LabBento } from './LabBento'
import { SectionHead } from './SectionHead'

/** "Beyond the code": a bento of live pieces (globe, stack cube, local time, GitHub activity, ask the chat). */
export function Lab() {
  const { t } = useLang()
  const c = t.ui.lab.bento
  return (
    <section className="lab" id="lab">
      <SectionHead label={t.ui.labLabel} title={c.title} lead={<Rich text={c.lead} />} />
      <LabBento />
    </section>
  )
}
