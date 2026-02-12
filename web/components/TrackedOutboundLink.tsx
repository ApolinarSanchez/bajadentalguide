"use client";

type TrackedOutboundLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function TrackedOutboundLink({ href, children }: TrackedOutboundLinkProps) {
  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        window.location.assign(href);
      }}
    >
      {children}
    </a>
  );
}
