import { APP_VERSION } from '../../constants.js'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex h-12 max-w-6xl items-center px-4 text-xs text-muted">
        <span>v{APP_VERSION}</span>
      </div>
    </footer>
  )
}
