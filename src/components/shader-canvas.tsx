import { useEffect, useRef, useState, useCallback } from 'react'
import Editor from 'react-simple-code-editor'
import { Highlight, themes, type PrismTheme } from 'prism-react-renderer'

type Props = {
  fragmentShader: string
  label?: string
  editable?: boolean
}

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

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

// ponytail: debounce shader recompilation to avoid lag while typing
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function highlightCode(code: string, theme: PrismTheme) {
  return (
    <Highlight theme={theme} code={code} language="c">
      {({ tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </>
      )}
    </Highlight>
  )
}

export function ShaderCanvas({ fragmentShader, label, editable = true }: Props) {
  const [code, setCode] = useState(fragmentShader)
  const debouncedCode = useDebounce(code, 300)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<{ gl: WebGLRenderingContext; prog: WebGLProgram; uTime: WebGLUniformLocation | null; uRes: WebGLUniformLocation | null } | null>(null)
  const rafRef = useRef<number>(0)
  const startRef = useRef(Date.now())
  const dark = useDarkMode()
  const theme = dark ? themes.vsDark : themes.vsLight

  // ponytail: compile shader only when debounced code changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const err = gl.getShaderInfoLog(s)
        if (type === gl.FRAGMENT_SHADER) setError(err)
        return null
      }
      return s
    }

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER)
    const fs = compile(gl.FRAGMENT_SHADER, debouncedCode)
    if (!vs || !fs) return

    setError(null)
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)

    const pos = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    glRef.current = {
      gl,
      prog,
      uTime: gl.getUniformLocation(prog, 'u_time'),
      uRes: gl.getUniformLocation(prog, 'u_resolution'),
    }
  }, [debouncedCode])

  // ponytail: render loop separate from compilation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const render = () => {
      const ctx = glRef.current
      if (ctx) {
        const { gl, uTime, uRes } = ctx
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.uniform1f(uTime, (Date.now() - startRef.current) / 1000)
        gl.uniform2f(uRes, canvas.width, canvas.height)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }
      rafRef.current = requestAnimationFrame(render)
    }
    render()

    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const handleHighlight = useCallback((c: string) => highlightCode(c, theme), [theme])

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-charcoal/20 dark:border-bone/20">
      {label && (
        <div className="border-b border-charcoal/20 bg-charcoal/5 px-3 py-1.5 font-mono text-xs text-charcoal/60 dark:border-bone/20 dark:bg-bone/5 dark:text-bone/60">
          {label}
        </div>
      )}
      <div className="grid md:grid-cols-2">
        {editable && (
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={handleHighlight}
            padding={12}
            className="min-h-[250px] bg-charcoal/5 font-mono text-xs leading-relaxed dark:bg-bone/5"
          />
        )}
        <div className="relative flex items-center justify-center bg-black p-4">
          <canvas ref={canvasRef} width={200} height={200} className="rounded" />
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 font-mono text-xs text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
