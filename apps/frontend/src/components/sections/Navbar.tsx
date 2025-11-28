"use client";

/**
 * Navbar - Barra de navegação principal
 * 
 * MELHORIAS APLICADAS:
 * 1. Animações com Framer Motion (entrada suave, menu mobile animado)
 * 2. Código mais limpo e organizado
 * 3. Melhor acessibilidade (aria-expanded, aria-controls)
 * 4. Transições mais suaves nos hovers
 * 5. Ícone de menu animado (hamburger → X)
 */

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@/assets/logo.png";
import { navbarVariants, mobileMenuVariants, fadeInUp } from "@/lib/animations";

// ============================================
// TYPES
// ============================================

interface NavLink {
  label: string;
  href: string;
}

interface NavbarProps {
  links?: NavLink[];
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
}

// ============================================
// SUBCOMPONENTES
// ============================================

function Logo() {
  return (
    <a href="#" className="flex items-center gap-3">
      <Image
        src={logoImage}
        alt="DxGen Logo"
        className="h-8 w-auto sm:h-10 md:h-11"
        priority
      />
    </a>
  );
}

interface NavLinksProps {
  links: NavLink[];
  className?: string;
  onLinkClick?: () => void;
}

function NavLinks({ links, className, onLinkClick }: NavLinksProps) {
  return (
    <div className={className}>
      {links.map((link) => (
        <motion.a
          key={link.href}
          href={link.href}
          onClick={onLinkClick}
          className="relative text-slate-400 transition-colors hover:text-slate-100"
          whileHover={{ x: 2 }}
          transition={{ duration: 0.2 }}
        >
          {link.label}
        </motion.a>
      ))}
    </div>
  );
}

interface MenuIconProps {
  isOpen: boolean;
}

function MenuIcon({ isOpen }: MenuIconProps) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <motion.path
        d="M4 6H20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ 
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 6 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.path
        d="M4 12H20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.1 }}
      />
      <motion.path
        d="M4 18H20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ 
          rotate: isOpen ? -45 : 0,
          y: isOpen ? -6 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
    </svg>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function Navbar({
  links = [],
  primaryCtaLabel = "Começar grátis",
  secondaryCtaLabel = "Entrar",
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
      className="fixed inset-x-0 top-0 z-50"
    >
      {/* Backdrop blur layer */}
      <div className="absolute inset-0 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl" />
      
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 md:py-4">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <NavLinks
          links={links}
          className="hidden items-center gap-8 text-sm font-medium md:flex"
        />

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          {secondaryCtaLabel && (
            <motion.button
              type="button"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {secondaryCtaLabel}
            </motion.button>
          )}
          {primaryCtaLabel && (
            <motion.button
              type="button"
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              {primaryCtaLabel}
            </motion.button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          type="button"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          className="flex items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileTap={{ scale: 0.95 }}
        >
          <MenuIcon isOpen={isMenuOpen} />
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileMenuVariants}
            className="relative border-t border-white/5 bg-slate-950/95 backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto max-w-6xl space-y-4 px-4 py-4 sm:px-6">
              {/* Mobile Links */}
              <motion.div 
                className="flex flex-col gap-1"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
              >
                {links.map((link) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    variants={fadeInUp}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </motion.div>

              {/* Mobile CTAs */}
              <motion.div 
                className="flex flex-col gap-2 border-t border-white/5 pt-4"
                variants={fadeInUp}
              >
                {secondaryCtaLabel && (
                  <button
                    type="button"
                    className="w-full rounded-full border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:text-white"
                  >
                    {secondaryCtaLabel}
                  </button>
                )}
                {primaryCtaLabel && (
                  <button
                    type="button"
                    className="w-full rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
                  >
                    {primaryCtaLabel}
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
