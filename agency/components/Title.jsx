import { Fragment } from "react";
import Reveal from "@/components/Reveal";
import { splitWords } from "@/lib/text";

/** Heading whose words rise into view one after another; *starred* words get the gold serif accent */
export default function Title({ as = "h2", text, className = "" }) {
  return (
    <Reveal as={as} className={`split ${className}`}>
      {splitWords(text).map((word, i) => (
        <Fragment key={i}>
          <span className="word">
            <span style={{ "--i": i }}>{word.accent ? <em className="accent">{word.text}</em> : word.text}</span>
          </span>{" "}
        </Fragment>
      ))}
    </Reveal>
  );
}
