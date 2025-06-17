import React from 'react'
import { type HeaderProps } from '../models/Header'

const Header: React.FC<HeaderProps> = ({
  channel,
  setChannel,
  onConnect,
}) => {
  return (
    <header>
      <nav className="flex flex-row">
        <h2 className="text-xl font-bold mb-2 w-fit grow">Select Twitch Channel</h2>
        <input
          type="text"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          placeholder="Enter a twitch channel"
          className="border p-2 mr-2"
          onKeyDown={(e) => { if(e.key === 'Enter') onConnect() }}
        />
        <button
          onClick={onConnect}
          className="bg-purple-600 text-white p-2 rounded"
        >
          Connect
        </button>
      </nav>
    </header>
  )
}

export default Header