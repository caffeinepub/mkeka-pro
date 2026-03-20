export function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer
      className="border-t border-border mt-8"
      style={{ backgroundColor: "oklch(var(--header-bg))" }}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <p className="text-xs font-black tracking-tighter mb-2">
              <span className="text-primary">MKEKA</span>
              <span className="text-foreground"> PRO</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Premium sports betting platform with competitive odds and live
              markets.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Sports
            </p>
            <ul className="space-y-1">
              {["Soccer", "Basketball", "Tennis", "NFL", "Esports"].map((s) => (
                <li
                  key={s}
                  className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Help
            </p>
            <ul className="space-y-1">
              {[
                "Responsible Gambling",
                "Terms of Service",
                "Privacy Policy",
                "Support",
              ].map((s) => (
                <li
                  key={s}
                  className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              About
            </p>
            <ul className="space-y-1">
              {["About Us", "Careers", "Press", "Affiliates"].map((s) => (
                <li
                  key={s}
                  className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {year} Mkeka Pro. All rights reserved. 18+ Please bet responsibly.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
