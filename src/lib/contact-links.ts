export type ContactId = 'email' | 'x' | 'github' | 'linkedin' | 'huggingface' | 'kofi'
export type ContactLink = { id: ContactId; name: string; href: string }

const EMAIL = 'khimanialiasgar@gmail.com'

// Icons live with each consumer: the card's are lottie clips, the footer bubbles' are plain SVG.
export const CONTACT_LINKS: ContactLink[] = [
  { id: 'email', name: 'Email', href: `mailto:${EMAIL}` },
  { id: 'x', name: 'X', href: 'https://x.com/0kaliasgar' },
  { id: 'github', name: 'GitHub', href: 'https://github.com/NovusEdge' },
  { id: 'linkedin', name: 'LinkedIn', href: 'https://www.linkedin.com/in/aliasgarkhimani/' },
  { id: 'huggingface', name: 'Hugging Face', href: 'https://huggingface.co/NovusEdge' },
  { id: 'kofi', name: 'Ko-fi', href: 'https://ko-fi.com/aliasgarkhimani' },
]

export const opensNewTab = (l: ContactLink) => l.id !== 'email'
