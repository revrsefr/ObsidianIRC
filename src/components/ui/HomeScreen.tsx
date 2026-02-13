import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import useStore from "../../store";
import ircClient from "../../lib/ircClient";

const DiscoverGrid = () => {
  const { toggleAddServerModal, connect, isConnecting, connectionError } =
    useStore();
  const [query, setQuery] = useState("");
  const [servers, setServers] = useState<
    { name: string; description: string; server?: string; port?: string; channels?: string[] }[]
  >([]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch(
          "/servers.json",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch servers");
        }
        const data = await response.json();
        setServers(data);
      } catch (error) {
        console.error("Error fetching servers:", error);
      }
    };

    fetchServers();
  }, []); // Empty dependency array ensures this runs only once

  const filteredServers = servers.filter(
    (server) =>
      server.name.toLowerCase().includes(query.toLowerCase()) ||
      server.description.toLowerCase().includes(query.toLowerCase()),
  );

  const handleServerClick = (server: Record<string, string | string[]>) => {
    toggleAddServerModal(true, {
      name: server.name as string,
      host: (server.server || "") as string,
      port: (server.port || "443") as string,
      nickname: "",
      ui: {
        disableServerConnectionInfo: true,
        title: server.name as string,
      },
    });
    if (Array.isArray(server.channels) && server.channels.length > 0) {
      const channels = server.channels as string[];
      ircClient.on("ready", ({ serverId }) => {
        for (const channel of channels) {
          ircClient.joinChannel(serverId, channel);
        }
      });
    }
  };

  return __HIDE_SERVER_LIST__ ? (
    <div className="h-screen flex flex-col bg-discord-dark-200 text-white">
      <div className="m-1 rounded z-10 bg-discord-dark-300 border-b border-discord-dark-500 p-4">
        <h1 className="rounded-lg text-2xl font-bold mb-2">
          Welcome to {__DEFAULT_IRC_SERVER_NAME__}!
        </h1>
      </div>
    </div>
  ) : (
    <div className="h-screen flex flex-col bg-discord-dark-200 text-white">
      <div className="m-1 rounded z-10 bg-discord-dark-300 border-b border-discord-dark-500 p-4">
        <h1 className="rounded-lg text-2xl font-bold mb-2">
          Discover the world of IRC with ObsidianIRC
        </h1>

        <div className="bg-discord-dark-100 rounded-lg flex items-center px-2 py-2">
          <button className="px-2 text-discord-text-muted hover:text-discord-text-normal">
            <a
              href="https://github.com/ObsidianIRC/server-list"
              target="_blank"
              rel="noreferrer"
            >
              <FaPlus />
            </a>
          </button>
          <input
            placeholder="Search servers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-grow text-discord-text-normal placeholder-discord-text-muted"
          />
        </div>
      </div>
      {filteredServers.length > 0 ? (
        <div className="grid p-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredServers.map((server) => (
            <div
              key={server.name}
              className="bg-discord-dark-300 border border-discord-dark-500 rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleServerClick(server)}
            >
              <h2 className="text-lg font-semibold">{server.name}</h2>
              <p className="text-sm text-discord-text-muted">
                {server.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-discord-text-muted">No servers found.</p>
      )}
    </div>
  );
};

export default DiscoverGrid;
