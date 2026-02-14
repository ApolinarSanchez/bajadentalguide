"use client";

type TrackedOutboundLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function TrackedOutboundLink({ href, children, className }: TrackedOutboundLinkProps) {
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        window.location.assign(href);
      }}
    >
      {children}
    </a>
  );
}
