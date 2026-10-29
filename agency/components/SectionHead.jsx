import Title from "@/components/Title";

/** Section label with its number, e.g. "(02) Selected work", and the big title */
export default function SectionHead({ index, label, title, className = "" }) {
  return (
    <div className={`section-head ${className}`.trim()}>
      <p className="section-subtitle">
        <span className="section-index">({index})</span> {label}
      </p>

      <Title text={title} className="section-title" />
    </div>
  );
}
