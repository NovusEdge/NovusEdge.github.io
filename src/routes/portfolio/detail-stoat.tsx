import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { TLink } from '../../components/page-transition'
import { Github, Globe, Package, FileText, ArrowRight } from '../../components/icons'
import { prefersReducedMotion } from '../../lib/motion'
import type { LayoutProps } from './layouts'

const iconFor = (href: string) =>
  href.includes('github.com') ? Github : href.includes('npmjs.com') || href.includes('pypi.org') ? Package : Globe

// Go brandmark, path from simple-icons
function GoLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#00ADD8" aria-hidden>
      <path d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.07-.105.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.77.105-.13.198-.27.315-.434H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.97.596-1.274a.315.315 0 01.292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 01-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.986-1.145.152-2.209-.07-3.143-.77-.865-.655-1.356-1.52-1.484-2.595-.152-1.274.222-2.419.993-3.424.83-1.086 1.928-1.776 3.272-2.02 1.098-.2 2.15-.07 3.096.571.62.41 1.063.97 1.356 1.648.07.105.023.164-.117.2m3.868 6.461c-1.064-.024-2.034-.328-2.852-1.029a3.665 3.665 0 01-1.262-2.255c-.21-1.32.152-2.489.947-3.529.853-1.122 1.881-1.706 3.272-1.95 1.192-.21 2.314-.095 3.33.595.923.63 1.496 1.484 1.648 2.605.198 1.578-.257 2.863-1.344 3.962-.771.783-1.718 1.273-2.805 1.495-.315.06-.63.07-.934.106zm2.78-4.72c-.011-.153-.011-.27-.034-.387-.21-1.157-1.274-1.81-2.384-1.554-1.087.245-1.788.935-2.045 2.033-.21.912.234 1.835 1.075 2.21.643.28 1.285.244 1.905-.07.923-.48 1.425-1.228 1.484-2.233z" />
    </svg>
  )
}

// a real terminal window: traffic-light bar, mono body, oh-my-zsh prompt
function TerminalWindow({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-lg border border-bone/15 bg-[#0e0e0e] shadow-2xl ${className}`}>
      <div className="flex items-center gap-2 border-b border-bone/10 bg-[#181818] px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        <span className="ml-3 font-mono text-[11px] text-bone/40">{title}</span>
      </div>
      <div className="overflow-x-auto p-5 font-mono text-[12px] leading-relaxed sm:text-[13px]">{children}</div>
    </div>
  )
}

// robbyrussell prompt: green arrow, cyan cwd
function Prompt({ cmd }: { cmd: ReactNode }) {
  return (
    <div>
      <span className="text-[#98c379]">➜ </span>
      <span className="text-[#56b6c2]"> .stoat</span> <span className="text-bone/90">{cmd}</span>
    </div>
  )
}

// terminal beat that punctuates the narrative in place of a heading
function Beat({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div data-sec className="my-12">
      <TerminalWindow title={title}>
        <div className="space-y-1 whitespace-pre">{children}</div>
      </TerminalWindow>
    </div>
  )
}

const P = ({ children }: { children: ReactNode }) => (
  <p className="text-[17px] leading-[1.75] text-bone/80">{children}</p>
)

const Code = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-bone/10 px-1.5 py-0.5 font-mono text-[0.85em] text-gold">{children}</code>
)

export default function Stoat({ p, c }: LayoutProps) {
  const scope = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion() || !scope.current) return
    const ctx = gsap.context(() => {
      const secs = gsap.utils.toArray<HTMLElement>('[data-sec]', scope.current)
      gsap.set(secs, { opacity: 0, y: 26 })
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue
            io.unobserve(e.target)
            gsap.to(e.target, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
      )
      secs.forEach((s) => io.observe(s))
      return () => io.disconnect()
    }, scope)
    return () => ctx.revert()
  }, [c])

  return (
    <main className="bg-charcoal text-bone" ref={scope}>
      {/* hero: prompt-styled masthead beside a live-looking terminal */}
      <section className="relative overflow-hidden border-b border-bone/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: 'radial-gradient(rgba(212,160,60,0.10) 1px, transparent 1.4px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(120% 80% at 70% 0%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(120% 80% at 70% 0%, black 20%, transparent 70%)',
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-16 pt-32 lg:flex-row lg:items-center lg:gap-16 lg:pt-36">
          <div className="lg:w-5/12">
            <TLink
              to="/portfolio"
              aria-label="Back to portfolio"
              title="Back to portfolio"
              className="group inline-flex h-9 w-9 items-center justify-center rounded border border-bone/15 text-bone/50 transition-colors hover:border-gold hover:text-gold"
            >
              <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
            </TLink>

            <div className="mt-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                building
              </span>
            </div>
            <h1 className="mt-4 flex items-baseline gap-4 font-display text-6xl font-black md:text-8xl">
              stoat
              {p.jp && <span className="font-display text-3xl font-normal text-bone/20">{p.jp}</span>}
            </h1>

            <p className="mt-8 max-w-xl text-xl leading-relaxed text-bone/75">{c.lede}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {p.links.map((l) => {
                const Icon = iconFor(l.href)
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded border border-gold bg-gold/10 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-charcoal"
                  >
                    <Icon className="h-4 w-4" /> {l.label}
                  </a>
                )
              })}
              <div className="ml-auto flex items-center gap-3">
                <a
                  href="https://github.com/NovusEdge/stoat/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="AGPL-3.0 · license"
                  className="inline-flex items-center gap-2 rounded border border-bone/15 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-bone/60 transition-colors hover:border-bone/40 hover:text-bone"
                >
                  <FileText className="h-4 w-4" /> AGPL-3.0
                </a>
                <span className="mx-1 h-6 w-px bg-bone/15" />
                <a
                  href="https://go.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Go · go.dev"
                  aria-label="Go · go.dev"
                  className="inline-flex items-center justify-center text-bone/50 transition-colors hover:text-bone"
                >
                  <GoLogo className="h-8 w-8" />
                </a>
              </div>
            </div>
          </div>

          {/* TODO: swap for a real TUI screen capture when provided */}
          <TerminalWindow title="stoat — ~/.stoat" className="lg:w-7/12">
            <div className="space-y-1 whitespace-pre">
              <Prompt cmd="stoat ls" />
              <div className="text-bone/45">NAME            MODE   STATE    CPUS  RAM    SSH</div>
              <div>
                <span className="text-bone/90">alpine-live     </span>
                <span className="text-[#56b6c2]">live   </span>
                <span className="text-[#98c379]">running  </span>
                <span className="text-bone/70">2     2048   2200</span>
              </div>
              <div>
                <span className="text-bone/90">ubuntu-dev      </span>
                <span className="text-[#56b6c2]">cloud  </span>
                <span className="text-[#98c379]">running  </span>
                <span className="text-bone/70">4     4096   2201</span>
              </div>
              <div>
                <span className="text-bone/90">arch-scratch    </span>
                <span className="text-[#56b6c2]">disk   </span>
                <span className="text-bone/40">stopped  </span>
                <span className="text-bone/70">2     4096   2202</span>
              </div>
              <div className="h-3" />
              <Prompt cmd="stoat ssh alpine-live" />
              <div className="text-bone/40">Warning: Permanently added '[127.0.0.1]:2200' (ED25519) to known hosts.</div>
              <div className="text-[#98c379]">Welcome to Alpine!</div>
              <div>
                <span className="text-[#e06c75]">localhost</span>
                <span className="text-bone/60">:</span>
                <span className="text-[#56b6c2]">~</span>
                <span className="text-bone/90"># </span>
                <span className="inline-block h-3.5 w-2 animate-pulse bg-gold align-middle" />
              </div>
            </div>
          </TerminalWindow>
        </div>
      </section>

      {/* body: one continuous anecdote, terminal beats in place of headings */}
      <div className="mx-auto max-w-2xl px-6 pb-24 pt-20">
        <div data-sec className="space-y-6">
          <P>
            I wanted a scratch VM I could break and throw away, and every option asked more of me than the job was
            worth. libvirt drags in a daemon and a permissions model and XML. Vagrant wants Ruby and a box registry.
            Raw QEMU works but I kept re-deriving the same wall of flags from shell history every single time.
          </P>
          <P>
            So stoat is one static binary instead. No daemon, no config language to learn. It drives QEMU and then
            gets out of the way.
          </P>
        </div>

        <div data-sec className="mt-6 space-y-6">
          <P>
            Alpine is what made it click. It boots in about a second, which is exactly what a throwaway VM should do.
            The catch is that a fresh Alpine drops you at a login prompt with no network and no sshd until you run{' '}
            <Code>setup-alpine</Code> by hand.
          </P>
          <P>
            I skip that step. stoat builds an <Code>apkovl</Code> overlay at every boot and hands it to the guest as
            a fake FAT disk over <Code>-virtfs</Code>/vvfat. The overlay carries stoat's own ed25519 key, so{' '}
            <Code>root@127.0.0.1</Code> answers the moment sshd comes up. No password, no key copying. The host key
            survives rebuilds, so your SSH client never complains about a changed fingerprint.
          </P>
          <P>
            The overlay gets rebuilt from scratch on every start, which makes live VMs genuinely disposable. Nothing
            you do inside one survives a stop, and that is the point.
          </P>
        </div>

        <Beat title="stoat — ~/.stoat">
          <Prompt cmd="stoat ls" />
          <div className="text-bone/45">NAME          MODE   STATE    SSH</div>
          <div>
            <span className="text-bone/90">alpine-live   </span>
            <span className="text-[#56b6c2]">live   </span>
            <span className="text-[#98c379]">running  </span>
            <span className="text-bone/70">2200</span>
          </div>
          <div>
            <span className="text-bone/90">ubuntu-dev    </span>
            <span className="text-[#56b6c2]">cloud  </span>
            <span className="text-[#98c379]">running  </span>
            <span className="text-bone/70">2201</span>
          </div>
          <div>
            <span className="text-bone/90">arch-box      </span>
            <span className="text-[#56b6c2]">disk   </span>
            <span className="text-bone/40">stopped  </span>
            <span className="text-bone/70">2202</span>
          </div>
          <div>
            <span className="text-bone/90">old-vm        </span>
            <span className="text-bone/40">—      </span>
            <span className="text-[#e06c75]">broken   </span>
            <span className="text-bone/40">toml: line 1: expected '='</span>
          </div>
        </Beat>

        <div data-sec className="space-y-6">
          <P>
            A VM is one of three kinds, and the kind decides how it gets provisioned. A <strong>live</strong> VM is
            the Alpine trick above: diskless, rebuilt every start, gone when you stop it. A <strong>cloud</strong> VM
            takes an Ubuntu, Debian, Fedora, or Arch image and lays a copy-on-write overlay over one shared base, so
            ten Ubuntu VMs share a single download and a few megabytes of delta each. It also drops a cloud-init seed
            that runs once, on first boot. A <strong>disk</strong> VM is a plain persistent <Code>qcow2</Code> for
            everything else.
          </P>
          <P>
            The disk kind is the one that trips people. It starts empty. Until you install the guest yourself and add
            stoat's key, there is nothing on the far end of an SSH connection. Rather than let you sit through a
            connect timeout, stoat checks first and tells you. Once the OS is in you press <Code>i</Code>, it flips{' '}
            <Code>installed</Code> in the <Code>vm.toml</Code>, and the VM boots straight off the disk instead of the
            installer.
          </P>
          <P>
            Recipes for XFCE, Docker, dev tools, or Tailscale ride on top of whichever path applies. They get pushed
            over ssh for live and disk VMs, and merged into the cloud-init seed for cloud ones. Provisioning a cloud
            VM twice is a deliberate no-op, because the seed already ran and rebuilding it would throw away real
            guest state.
          </P>
        </div>

        <Beat title="stoat — provision">
          <Prompt cmd="stoat provision ubuntu-dev --recipe docker" />
          <div className="text-[#e5c07b]">==&gt; pushing recipe: docker</div>
          <div className="text-bone/60"> + apt-get update</div>
          <div className="text-bone/60"> + install docker-ce docker-compose-plugin</div>
          <div className="text-bone/60"> + systemctl enable --now docker</div>
          <div>
            <span className="text-[#98c379]"> ✓ </span>
            <span className="text-bone/80">docker active (running)</span>
          </div>
          <div className="text-bone/45">done in 41s</div>
        </Beat>

        <div data-sec className="space-y-6">
          <P>
            stoat launches QEMU with a <Code>-pidfile</Code> and a unix-socket monitor for a graceful shutdown, then
            lets go. There is no supervising process. Quit stoat and the VM you started keeps running, because
            nothing about it depends on stoat being alive.
          </P>
          <P>
            State is just files. Each VM is a directory under <Code>~/.stoat</Code> holding one hand-editable{' '}
            <Code>vm.toml</Code>, and stoat re-reads it on every operation. No database, no cache to invalidate.
            Botch an edit and the VM shows up as a <strong>broken</strong> row instead of vanishing. Even then its
            recorded port stays reserved, grabbed by a best-effort regex over the unparseable file, so the next VM
            can't land on top of it.
          </P>
        </div>

        <div data-sec className="space-y-6">
          <P>
            Day to day I live in the TUI. It lists every VM with its mode and state, and the keys do the obvious
            things: <Code>↵</Code> starts or stops the highlighted VM, <Code>s</Code> drops into ssh, <Code>p</Code>{' '}
            provisions, <Code>→</Code> opens details, <Code>/</Code> filters the list, <Code>n</Code> builds a new
            one.
          </P>
        </div>

        <Beat title="stoat">
          <div className="text-bone/40">stoat · 4 vms · ↑↓ to move</div>
          <div className="h-2" />
          <div>
            <span className="text-gold">❯ </span>
            <span className="text-[#98c379]">● </span>
            <span className="text-bone/90">alpine-live   </span>
            <span className="text-[#56b6c2]">live   </span>
            <span className="text-bone/70">running   2c  2048M</span>
          </div>
          <div>
            <span className="text-bone/30">  </span>
            <span className="text-[#98c379]">● </span>
            <span className="text-bone/90">ubuntu-dev    </span>
            <span className="text-[#56b6c2]">cloud  </span>
            <span className="text-bone/70">running   4c  4096M</span>
          </div>
          <div>
            <span className="text-bone/30">  </span>
            <span className="text-bone/40">○ </span>
            <span className="text-bone/90">arch-box      </span>
            <span className="text-[#56b6c2]">disk   </span>
            <span className="text-bone/50">stopped   2c  4096M</span>
          </div>
          <div>
            <span className="text-bone/30">  </span>
            <span className="text-[#e06c75]">✗ </span>
            <span className="text-bone/90">old-vm        </span>
            <span className="text-[#e06c75]">broken  toml: line 1</span>
          </div>
          <div className="h-3" />
          <div className="text-bone/40">↵ start/stop · → details · s ssh · p provision · / filter · n new · q quit</div>
        </Beat>

        <div data-sec className="space-y-6">
          <P>
            The CLI covers the same ground for scripts. <Code>ls</Code>, <Code>up</Code>, <Code>down</Code>,{' '}
            <Code>ssh</Code>, <Code>provision</Code>, <Code>rm</Code>, <Code>recipe</Code>, <Code>logs</Code>, and{' '}
            <Code>doctor</Code> each do one thing, and the exit codes carry weight: <Code>0</Code> for success,{' '}
            <Code>1</Code> for a runtime failure, <Code>2</Code> for a usage mistake. That is enough to drop stoat
            into a Makefile or a CI job without scraping its output.
          </P>
        </div>

        <Beat title="stoat — doctor">
          <Prompt cmd="stoat doctor" />
          <div>
            <span className="text-[#98c379]">✓ </span>
            <span className="text-bone/80">/dev/kvm accessible</span>
          </div>
          <div>
            <span className="text-[#98c379]">✓ </span>
            <span className="text-bone/80">qemu-system-x86_64 8.2.1</span>
          </div>
          <div>
            <span className="text-[#98c379]">✓ </span>
            <span className="text-bone/80">4 vms tracked · 1 broken</span>
          </div>
          <div className="text-bone/45">exit 0</div>
        </Beat>

        <div data-sec className="space-y-6">
          <P>
            The third door is an MCP server, so an agent can drive VMs the way I do. It is a small Python process
            that shells out to the <Code>stoat</Code> binary and reads its <Code>--json</Code> output. It never links
            the Go package or touches <Code>~/.stoat</Code> directly, and the JSON contract is versioned, so a
            mismatched pair refuses to start instead of failing three calls deep.
          </P>
        </div>

        <div data-sec className="space-y-6">
          <P>
            It is pre-1.0 and single-user. It assumes it owns its <Code>~/.stoat</Code>, and it gives you nothing
            past what QEMU and KVM already sandbox. The Alpine live path is the most exercised; the cloud-init
            backends and disk installs are newer, and the <Code>vm.toml</Code> layout may still move before 1.0. It
            is AGPL-3.0, so nobody folds it into a closed product.
          </P>
        </div>

        <footer data-sec className="mt-14 flex items-center justify-between border-t border-bone/10 pt-10">
          <span aria-hidden className="select-none font-display text-3xl text-bone/10">
            {p.jp}
          </span>
          <TLink
            to="/portfolio"
            className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-bone/50 transition-colors hover:text-gold"
          >
            back to portfolio
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </TLink>
        </footer>
      </div>
    </main>
  )
}
