# Product

## Register

brand

Per-surface override: `index.html` and `downloads.html` are evaluated as **brand**.
`user-guide.html` and `api-guide.html` are evaluated as **product** (long-form
documentation where legibility and navigation outrank expression).

## Users

Two audiences of equal weight, arriving through different doors.

**Minecraft PvP players.** They land from a Modrinth or CurseForge listing, a
YouTube description, or a Discord link. They are usually on a gaming desktop,
often mid-session, deciding in under thirty seconds whether this HUD is worth a
`.jar` in their mods folder. They already run other client-side utility mods and
can tell a maintained project from an abandoned one at a glance. Job to be done:
confirm this mod does what they want, then get the correct file for their
Minecraft version.

**Fabric mod developers.** They arrive specifically for `EymistakenHudPlugin`,
usually already convinced the mod exists and wanting to know whether the plugin
API is real and stable enough to build against. Job to be done: find the Gradle
coordinate, read a working module example, and judge API maturity.

## Product Purpose

Marketing and documentation site for Eymistaken's HUD, a modular, customizable
HUD mod for Minecraft 26.2 (Fabric). The site is the project's only owned
surface; every other touchpoint (Modrinth, CurseForge, GitHub) is a rented
storefront with someone else's design language.

Success is two numbers, weighted equally:
- Download conversion from players who land on the site.
- Third-party modules built on the plugin API by developers who read the API Guide.

## Brand Personality

Independent, technically credible, made by one person who actually plays the
game. The voice is direct and specific: it names the keybind, gives the exact
range, states the real constraint. It does not oversell.

**Open question, deliberately unresolved.** The current visual language (near-black
`#131313`, neon green `#55FF55` and cyan accents, zero border-radius, near-universal
uppercase Space Grotesk, `// SECTION` comment labels) has not been confirmed as the
intended direction. It is treated as a hypothesis under review, not as brand law.
Any command that touches visual identity should question it rather than extend it.

## Anti-references

- **The generic "gaming utility mod" site.** Neon-on-black, all-caps everything,
  `//` pseudo-code labels, glow shadows. The first thing anyone reaches for in
  this category, and therefore the first thing that reads as unconsidered.
- **The cheat-client aesthetic.** This mod is a legitimate HUD, not a hacked
  client. Visual cues borrowed from that world actively misposition the project
  and get it banned by association.
- **Generic SaaS marketing.** Identical icon-heading-paragraph card grids, hero
  metric rows, soft gradients, rounded everything.

## Design Principles

1. **Show the mod, don't describe it.** This is a visual product. Live, interactive
   proof beats a paragraph claiming the same thing. The interactive HUD preview on
   the home page is the strongest asset the site has; the rest of the site should
   be held to that standard.

2. **Two doors, both wide.** A player and a developer want opposite things from
   the same page. Neither should have to read past the other's content to find
   their path.

3. **Specificity is the credibility.** "50-300% scale", "Right Shift", "1 second
   window" earn more trust than "highly customizable". Prefer the number to the
   adjective everywhere.

4. **Documentation is design.** The guides carry half the product's value. They
   are not a lesser surface than the landing page and should not be laid out as
   an afterthought.

5. **Earn the aesthetic.** Any stylistic commitment (dark, monospaced, uppercase,
   neon) has to be defensible beyond "this is what mod sites look like". If the
   only justification is category convention, it is a reflex, not a decision.

## Accessibility & Inclusion

Baseline expectation: legible contrast, working keyboard navigation, no motion
that runs without a `prefers-reduced-motion` escape hatch. Formal WCAG AA
certification is not currently a project goal, but breakages at this baseline
count as design defects, not as a separate accessibility backlog.

Media weight and asset optimization are explicitly out of scope for design review
at the owner's direction.
