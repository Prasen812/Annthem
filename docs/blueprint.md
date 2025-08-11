# **App Name**: Cascade Player

## Core Features:

- Song List UI: Displays a vertical list of songs, each represented by a song card with key metadata and artwork.
- Song Card Expansion with Recommendations: Expands a selected song card to reveal a list of recommended tracks.  Implements a smooth drop-down animation for a seamless user experience.
- Dynamic Queue Management: Dynamically manages a play queue by appending a 'lower song' from the main list after each recommended track finishes playing.
- Persistent Mini-Player and Expandable Full Player: Provides a persistent mini-player at the bottom of the screen for continuous playback control and track information. Implements an expandable full player view with waveform visualization and queue management features.
- Playlist Creation: Allows users to create and manage custom playlists.
- AI Song Advisor: LLM-powered tool to decide when/if the song's track listing/metadata might match current listener taste based on past songs added/rated; can offer user insight into possible music preferences to inform other song choices
- Playback Controls and Queue Reordering: Provides standard music player functionalities such as skip, seek, repeat, and shuffle. Provides the ability to reorder queue items using drag and drop interface.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to evoke a sense of calmness and immersion.
- Background color: Dark navy (#1A237E), offering a modern and sophisticated look.
- Accent color: Vivid purple (#9C27B0) to highlight interactive elements and call to actions.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and short text, paired with 'Inter' (sans-serif) for body text. Space Grotesk will provide a techy feel while Inter will provide the required readability for blocks of text.
- Use a consistent set of minimalistic icons, using clear, outlined style.
- Employ a mobile-first, responsive design with a clean, minimal interface, featuring glass card effects for track rows.
- Incorporate smooth transitions and micro-interactions using Framer Motion, particularly for the expanding song card, staggered list reveals, and ripple effects on play.