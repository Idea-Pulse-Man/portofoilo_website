import Icon from "@/components/Icon";
import SiteLink from "@/components/SiteLink";

/**
 * Gold (`secondary`) or outline (`primary`) button. The label rolls on hover and,
 * with a mouse, the button leans toward the cursor (data-magnetic, see Cursor.jsx).
 * Without `href` it renders a <button>.
 */
export default function Button({ href, variant = "secondary", icon, className = "", children, ...props }) {
  const classes = `btn btn-${variant} ${className}`.trim();
  const content = (
    <>
      <span className="btn-label">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
      {icon && <Icon name={icon} className="btn-icon" />}
    </>
  );

  if (!href) {
    return (
      <button className={classes} data-magnetic="" {...props}>
        {content}
      </button>
    );
  }

  return (
    <SiteLink href={href} className={classes} data-magnetic="" {...props}>
      {content}
    </SiteLink>
  );
}
