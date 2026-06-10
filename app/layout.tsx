import { AppRouterCacheProvider } from './components/AppRouterCacheProvider'
import CssBaseline from '@mui/material/CssBaseline'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <CssBaseline />
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
