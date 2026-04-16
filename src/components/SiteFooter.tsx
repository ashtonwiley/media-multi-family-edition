const SiteFooter = () => (
  <footer className="border-t border-border bg-card mt-20">
    <div className="container py-8 text-center text-sm text-muted-foreground">
      <p className="mb-2">
        <strong className="text-foreground">Disclaimer:</strong> Media copyright is owned by each
        respective platform. Media Multi displays content sourced from those companies under their terms.
      </p>
      <p>© {new Date().getFullYear()} Media Multi — Family Edition. Made with care for the next generation.</p>
    </div>
  </footer>
);

export default SiteFooter;
