import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Github, Linkedin, Twitter, Shield } from "lucide-react";

interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export function Footer({ className, ...props }: FooterProps) {
  return (
    <footer
      id="footer"
      className={cn(
        "w-full bg-background/95 backdrop-blur-sm border-t border-border/50",
        className
      )}
      {...props}
    >
      <div className="container px-4 md:px-6 mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold">BlockCare</h3>
                <p className="text-xs text-muted-foreground">
                  Healthcare. Secured.
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Secure blockchain-based healthcare records management for patients
              and providers.
            </p>

            <div className="flex gap-2">
              <Link
                href="https://github.com/AdarsHH30/BlockCare"
                className="p-2 rounded-md bg-muted/50 hover:bg-primary/10 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Link>
              {/* <Link
                href="#"
                className="p-2 rounded-md bg-muted/50 hover:bg-primary/10 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Link>
              <Link
                href="#"
                className="p-2 rounded-md bg-muted/50 hover:bg-primary/10 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Link> */}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Services
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                "Health Records",
                "Consent Management",
                "Provider Access",
                "Data Security",
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-sm mb-4">
              {["About Us", "Careers", "Contact", "Privacy Policy"].map(
                (item, index) => (
                  <li key={index}>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
              <p>
                &copy; {new Date().getFullYear()} BlockCare. All rights
                reserved.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Shield className="h-3 w-3" />
                <span>HIPAA Compliant</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              {["Support", "Terms", "Status"].map((item, index) => (
                <Link
                  key={index}
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
