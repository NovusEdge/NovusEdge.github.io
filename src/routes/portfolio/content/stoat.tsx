import type { ProjectContent } from './types'
import { Term } from '../kit'

const TUI = `                     ╭────────────────────────────────────────────────────╮
                     │                                                    │
                     │  ❯ ○ alpine-live    live   2048M  2c  -            │
                     │                                                    │
                     │    ○ ubuntu-dev     cloud  4096M  4c  -            │
                     │                                                    │
                     │    ✗ old-vm         broken: toml: line 1: expected │
                     │  '.' or '=', but got 'i' instead                   │
                     │                                                    │
                     ╰────────────────────────────────────────────────────╯

↵ start/stop • →/l details • s ssh • p provision • / search • n new • q quit`

export const stoat: ProjectContent = {
  lede: 'Running a throwaway VM on Linux means libvirt, a daemon, and XML, or it means a QEMU command line you re-derive from your shell history every time. stoat is one binary instead.',

  sections: [
    {
      id: 'no-setup-alpine',
      title: 'How Alpine gets SSH',
      body: (
        <>
          <p>
            I wanted a scratch VM to break things in, and everything on offer wanted more from me than the task
            was worth. libvirt brings a daemon, a permissions model, and XML. Vagrant brings Ruby and a box
            registry. Raw QEMU works and costs twenty minutes of flag archaeology every time I come back to it.
          </p>
          <p>
            Alpine makes the gap obvious. It boots in about a second, which is exactly what a scratch VM should
            do. Then it drops you at a login prompt with no network and no sshd, waiting on{' '}
            <code>setup-alpine</code>. So stoat builds an <strong>apkovl</strong> overlay fresh at every start and
            hands it to the guest as a fake FAT disk over <code>-virtfs</code>/vvfat. That overlay bakes in stoat's
            own ed25519 keypair. <code>root@127.0.0.1:&lt;port&gt;</code> works the moment sshd comes up, with no
            password and no key copying. A host key stays the same across rebuilds, so your SSH client doesn't
            flag a changed fingerprint on every boot.
          </p>
          <Term>{TUI}</Term>
        </>
      ),
    },
    {
      id: 'no-ssh-until-installed',
      title: 'Installing an OS on a disk VM',
      body: (
        <>
          <p>
            A VM is one of three modes, and the mode picks the provisioning path. <strong>live</strong> is the
            apkovl story above: diskless, rebuilt every start, gone on stop. <strong>cloud</strong> takes an
            Ubuntu, Debian, Fedora, or Arch image and makes a copy-on-write overlay over the shared base, so the
            download only happens once. It also drops a cloud-init seed that runs at first boot only.{' '}
            <strong>disk</strong> is a persistent qcow2 for anything else. It is the one mode that starts with
            nothing on it: no OS, no sshd, no key.
          </p>
          <p>
            That last part trips people up more than everything else in stoat combined. Until you install the
            guest yourself at the console and add stoat's key by hand, there is nothing on the other end of an SSH
            connection. Rather than making you wait out a full connect timeout to fail with a generic "not
            reachable," stoat checks this up front. Press provision on a fresh disk VM and it tells you so
            immediately. Once the OS is in, pressing <code>i</code> on the detail screen flips <code>installed</code>{' '}
            in <code>vm.toml</code>. That flag also sets the boot order: unset, the installer ISO stays forced
            first on every boot; set, the VM boots straight off <code>disk.qcow2</code>.
          </p>
          <p>
            Recipes (XFCE, Docker, dev tools, Tailscale) ride on top of whichever path applies: pushed over ssh
            for live and disk, merged into the cloud-init seed for cloud. Provisioning a cloud VM twice is a
            deliberate no-op. The seed already ran once, so rebuilding it would throw away real guest state.
          </p>
        </>
      ),
    },
    {
      id: 'pidfile-not-daemon',
      title: 'QEMU outlives stoat',
      body: (
        <>
          <p>
            stoat launches QEMU with <code>-pidfile</code> and a unix-socket monitor for the graceful{' '}
            <code>system_powerdown</code>, and then gets out of the way. There is no supervising process. Quit
            stoat and the VM you started keeps running, because nothing about it depends on stoat still being
            alive.
          </p>
          <p>
            The same goes for state. Each VM is a directory under <code>~/.stoat</code> holding one hand-editable{' '}
            <code>vm.toml</code>, and stoat re-reads it from disk on every operation. No database, no cache to
            invalidate. If a hand-edit leaves that file unparseable, the VM shows up in the list as a{' '}
            <strong>broken</strong> row instead of silently disappearing. Its recorded SSH port still gets reserved
            by a best-effort regex, so a new VM can't collide with it.
          </p>
        </>
      ),
    },
    {
      id: 'three-ways-in',
      title: 'CLI, TUI, and MCP',
      body: (
        <>
          <p>
            The TUI is for browsing: start a VM, ssh in, watch a recipe stream past. The CLI (
            <code>ls</code>, <code>up</code>, <code>down</code>, <code>ssh</code>, <code>provision</code>,{' '}
            <code>rm</code>, <code>recipe</code>, <code>logs</code>, <code>doctor</code>) covers the same ground
            for scripts, with exit codes that mean something: 0 success, 1 runtime failure, 2 usage error.
          </p>
          <Term>{`$ stoat ls
NAME            MODE  STATE    CPUS  RAM    SSH
alpine-live     live  stopped  2     2048   2200
ubuntu-dev      cloud running  4     4096   2201`}</Term>
          <p>
            Both call the same internal Go package, so a fix in one shows up in both. The MCP server is a third
            door built the same way from the outside. It's a Python/fastmcp process that drives the{' '}
            <code>stoat</code> binary through its <code>--json</code> output. It never links the Go package or
            reads <code>~/.stoat</code> directly. The CLI's JSON contract is the only coupling, versioned so a
            mismatched pair refuses to start instead of failing three calls in.
          </p>
        </>
      ),
    },
    {
      id: 'status',
      title: 'Where it stands',
      body: (
        <p>
          Pre-1.0 and single-user, stoat assumes it is the only thing managing its <code>~/.stoat</code>. It offers
          no sandboxing past what QEMU/KVM already give a guest. The Alpine live path is the most exercised mode;
          the cloud-init backends and disk-mode installs are newer. <code>vm.toml</code> and the CLI's flags may
          still move before 1.0. Licensed AGPL-3.0, so it cannot be forked into a proprietary product.
        </p>
      ),
    },
  ],
}
