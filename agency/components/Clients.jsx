import { clients } from "@/lib/content";

// Simple placeholder marks drawn in a 24×24 box; swap for real logo SVGs when you have them
const MARKS = {
  ring: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" fillRule="evenodd" />,
  spark: <path d="m12 1 2.8 8.2L23 12l-8.2 2.8L12 23l-2.8-8.2L1 12l8.2-2.8Z" />,
  triangle: <path d="M12 2 23 21H1Z" />,
  bars: <path d="M2 14h5v8H2Zm7.5-6h5v14h-5ZM17 2h5v20h-5Z" />,
  hex: <path d="m12 1 10 5.5v11L12 23 2 17.5v-11Z" />,
  square: <rect x="3.5" y="3.5" width="17" height="17" rx="4" transform="rotate(12 12 12)" />,
  arc: <path d="M1 20a11 11 0 0 1 22 0h-5a6 6 0 0 0-12 0Z" />,
  diamond: <path d="M12 1 23 12 12 23 1 12Z" />,
};

function Client({ client, hidden }) {
  return (
    <li className="client" aria-hidden={hidden || undefined}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {MARKS[client.mark]}
      </svg>
      {client.name}
    </li>
  );
}

// Logo strip under the hero; the list is doubled so the -50% scroll loops seamlessly
export default function Clients() {
  return (
    <section className="clients on-blue" aria-labelledby="clients-title">
      <p className="clients-title" id="clients-title">
        Trusted by teams who ship
      </p>

      <div className="clients-marquee">
        <ul className="clients-track">
          {clients.map((client) => (
            <Client client={client} key={client.name} />
          ))}
          {clients.map((client) => (
            <Client client={client} key={`${client.name}-copy`} hidden />
          ))}
        </ul>
      </div>
    </section>
  );
}
