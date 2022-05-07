import { run } from '@tauri-apps/cli'
import {execa} from 'execa'
import {join} from 'path'
import glob from 'tiny-glob'

interface BuildOptions {
  runner?: string
  projectPath?: string
  configPath?: string
  debug?: boolean
  args?: string[]
  target?: string
}

export async function buildProject(options: BuildOptions): Promise<string[]> {
  const projectPath = options.configPath || process.cwd()

  let args: string[] = options.args || []

  if (options.configPath) {
    args.push('--config', options.configPath)
  }

  if (options.target) {
    args.push('--target', options.target)
  }

  process.chdir(projectPath)

  if (options.runner) {
    await execa(options.runner, args, { stdio: 'inherit' })
  } else {
    await run(args, '')
  }

  const profile = options.debug ? 'debug' : 'release'
  const outDir = options.target
    ? `./target/${options.target}/${profile}/bundle`
    : `./target/${profile}/bundle`

  const macOSExts = ['app', 'app.tar.gz', 'app.tar.gz.sig', 'dmg']
  const linuxExts = [
    'AppImage',
    'AppImage.tar.gz',
    'AppImage.tar.gz.sig',
    'deb'
  ]
  const windowsExts = ['msi', 'msi.zip', 'msi.zip.sig']

  return glob(
    join(outDir, `*/*.{${[...macOSExts, linuxExts, windowsExts].join(',')}}`)
  )
}
