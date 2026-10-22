import { marquee } from "@/lib/content";

// Each track holds its words 4× (two identical halves) so the -50% scroll loops seamlessly
const track = (words) => [...words, ...words, ...words, ...words];

export default function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {track(marquee.top).map((word, i) => (
          <span key={i}>{word}</span>
        ))}
      </div>

      <div className="marquee-track reverse">
        {track(marquee.bottom).map((word, i) => (
          <span key={i}>{word}</span>
        ))}
      </div>
    </div>
  );
}
