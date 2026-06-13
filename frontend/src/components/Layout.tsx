import type { ReactNode } from "react"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import Player from "./Player"

interface LayoutProps {
    children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col bg-[#121212] m-2 rounded-lg overflow-auto">
          <Navbar />
          <main className="flex-1 overflow-auto px-6">
            {children}
          </main>
        </div>
      </div>
      <Player />
    </div>
  )
}

export default Layout