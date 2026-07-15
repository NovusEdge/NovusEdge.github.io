import { useEffect, useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'

type Props = {
  left: { label: string; code: string; lang?: string }
  right: { label: string; code: string; lang?: string }
}

function useDarkMode() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains('dark'))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

export function CodeCompare({ left, right }: Props) {
  const dark = useDarkMode()
  const theme = dark ? themes.vsDark : themes.vsLight

  return (
    <div className="my-6 grid gap-4 md:grid-cols-2">
      {[left, right].map((side, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-charcoal/20 dark:border-bone/20">
          <div className="border-b border-charcoal/20 bg-charcoal/5 px-3 py-1.5 font-mono text-xs font-medium text-charcoal/70 dark:border-bone/20 dark:bg-bone/5 dark:text-bone/70">
            {side.label}
          </div>
          <Highlight theme={theme} code={side.code.trim()} language={side.lang || 'c'}>
            {({ tokens, getLineProps, getTokenProps }) => (
              <pre className="overflow-x-auto bg-charcoal/5 p-3 font-mono text-xs leading-relaxed dark:bg-bone/5">
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      ))}
    </div>
  )
}
