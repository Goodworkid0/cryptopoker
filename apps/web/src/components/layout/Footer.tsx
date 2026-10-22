'use client';

import Link from 'next/link';
import { Spade, Twitter, MessageCircle, Github, Mail } from 'lucide-react';

const footerLinks = {
  game: [
    { label: 'Play Poker', href: '/poker' },
    { label: 'Tournaments', href: '/tournaments' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Rewards', href: '/rewards' },
  ],
  token: [
    { label: 'Buy PKC', href: '/token' },
    { label: 'Staking', href: '/staking' },
    { label: 'Tokenomics', href: '/tokenomics' },
    { label: 'Contract', href: '#', external: true },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Bug Bounty', href: '/bug-bounty' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Responsible Gaming', href: '/responsible-gaming' },
    { label: 'KYC/AML', href: '/kyc' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/cryptopoker', label: 'Twitter' },
  { icon: MessageCircle, href: 'https://discord.gg/cryptopoker', label: 'Discord' },
  { icon: Github, href: 'https://github.com/cryptopoker', label: 'GitHub' },
  { icon: Mail, href: 'mailto:support@cryptopoker.io', label: 'Email' },
];

export function Footer() {
  return (
    <footer className="bg-background-secondary border-t border-border-primary mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
                <Spade className="w-6 h-6 text-background-primary" />
              </div>
              <span className="text-xl font-display font-bold">CryptoPoker</span>
            </Link>
            <p className="text-text-secondary text-sm mb-4">
              The future of online poker. Play, earn, and win with PKC tokens.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-background-tertiary flex items-center justify-center text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Game</h4>
            <ul className="space-y-2">
              {footerLinks.game.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-accent-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Token</h4>
            <ul className="space-y-2">
              {footerLinks.token.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-accent-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-accent-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-accent-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border-primary flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">
            © 2024 CryptoPoker. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <span>🔒 Provably Fair</span>
            <span>•</span>
            <span>⚡ Powered by Polygon</span>
            <span>•</span>
            <span>🎮 21+ Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
