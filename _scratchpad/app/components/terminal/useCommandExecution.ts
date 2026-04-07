import type React from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ASCII_LOGO,
  CAT_ANIMATION_STYLES,
  CAT_ASCII,
  CAT_CLEANUP_DELAY,
  CAT_COUNT,
  CAT_HTML_TEMPLATE,
  CAT_MAX_ADDITIONAL_DURATION,
  CAT_MAX_TOP_RANGE,
  CAT_MIN_DURATION,
  CAT_MIN_TOP,
  CAT_SPAWN_DELAY,
  CYBER_SKULLS,
  DIRECTORY_LISTING,
  EXIT_DELAY,
  HACK_COMPLETION_DELAY,
  HACK_SEQUENCE,
  HACK_STEP_DELAY,
  HELP_COMMANDS,
  MATRIX_DELAY,
  MATRIX_EFFECT,
  MATRIX_FINAL_DELAY,
  NAVIGATION_DELAY,
  TECH_STACK,
} from './constants';
import type { TerminalLine } from './types';

export function useCommandExecution() {
  const navigate = useNavigate();

  const executeCommand = useCallback(
    (
      cmd: string,
      commandHistory: string[],
      setLines: React.Dispatch<React.SetStateAction<TerminalLine[]>>,
      setCommandHistory: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
      const command = cmd.trim().toLowerCase();

      // Add command to history
      if (command && !commandHistory.includes(command)) {
        setCommandHistory((prev) => [...prev, command]);
      }

      // Add command line to output
      setLines((prev) => [
        ...prev,
        {
          type: 'command',
          content: `C:\\CHUCK> ${cmd}`,
        },
      ]);

      // Process command
      switch (command) {
        case 'help':
          setLines((prev) => [
            ...prev,
            { type: 'output', content: '║ AVAILABLE COMMANDS ║' },
            { type: 'output', content: '╠════════════════════╣' },
            ...HELP_COMMANDS.map((cmd) => ({
              type: 'output' as const,
              content: `║ ${cmd.command.padEnd(11)} - ${cmd.description}`,
            })),
            { type: 'output', content: '╚════════════════════╝' },
            { type: 'output', content: '' },
          ]);
          break;

        case 'dir':
          setLines((prev) => [
            ...prev,
            ...DIRECTORY_LISTING.map((line) => ({
              type: 'output' as const,
              content: line,
            })),
          ]);
          break;

        case 'cls':
          setLines([]);
          break;

        case 'ver':
          setLines((prev) => [
            ...prev,
            { type: 'output', content: 'CHUCK-DOS Version 2.025' },
            { type: 'output', content: 'Powered by React Router v7 & Vite' },
            { type: 'output', content: '' },
          ]);
          break;

        case 'time': {
          const now = new Date();
          setLines((prev) => [
            ...prev,
            {
              type: 'output',
              content: `Current time is ${now.toLocaleTimeString()}`,
            },
            {
              type: 'output',
              content: `Current date is ${now.toLocaleDateString()}`,
            },
            { type: 'output', content: '' },
          ]);
          break;
        }

        case 'gradient':
          setLines((prev) => [
            ...prev,
            {
              type: 'output',
              content: 'Launching Gradient Border Laboratory...',
            },
            { type: 'output', content: 'Loading GRADIENT.EXE...' },
            { type: 'output', content: '' },
          ]);
          setTimeout(() => navigate('/border-linear-gradient'), NAVIGATION_DELAY);
          break;

        case 'glass':
          setLines((prev) => [
            ...prev,
            {
              type: 'output',
              content: 'Launching SVG Glass Effects Studio...',
            },
            { type: 'output', content: 'Loading GLASS.EXE...' },
            { type: 'output', content: '' },
          ]);
          setTimeout(() => navigate('/svg-glass-test'), NAVIGATION_DELAY);
          break;

        case 'about':
          setLines((prev) => [
            ...prev,
            { type: 'output', content: ASCII_LOGO },
            { type: 'output', content: '' },
            { type: 'output', content: "Welcome to Chuck's Code Laboratory!" },
            {
              type: 'output',
              content: 'A radical digital playground for web experiments.',
            },
            { type: 'output', content: '' },
            { type: 'output', content: 'Built with modern web technologies:' },
            ...TECH_STACK.map((tech) => ({
              type: 'output' as const,
              content: tech,
            })),
            { type: 'output', content: '' },
            { type: 'output', content: 'Created by Chuck Ponti - Est. 2025' },
            { type: 'output', content: '' },
          ]);
          break;

        case 'matrix':
          setLines((prev) => [
            ...prev,
            { type: 'output', content: 'Initiating Matrix protocol...' },
            { type: 'output', content: '' },
          ]);
          // Add Matrix quotes with delays
          MATRIX_EFFECT.forEach((quote, index) => {
            setTimeout(
              () => {
                setLines((prev) => [...prev, { type: 'system', content: `>> ${quote}` }]);
              },
              (index + 1) * MATRIX_DELAY
            );
          });
          setTimeout(
            () => {
              setLines((prev) => [
                ...prev,
                { type: 'output', content: '' },
                {
                  type: 'output',
                  content: 'Connection to Matrix... ESTABLISHED',
                },
                { type: 'output', content: '' },
              ]);
            },
            MATRIX_EFFECT.length * MATRIX_DELAY + MATRIX_FINAL_DELAY
          );
          break;

        case 'hack': {
          setLines((prev) => [
            ...prev,
            { type: 'output', content: 'Initiating cyber hack sequence...' },
            { type: 'output', content: 'Scanning network...' },
          ]);
          HACK_SEQUENCE.forEach((step, index) => {
            setTimeout(
              () => {
                setLines((prev) => [...prev, { type: 'system', content: step }]);
              },
              (index + 1) * HACK_STEP_DELAY
            );
          });
          setTimeout(
            () => {
              setLines((prev) => [...prev, { type: 'output', content: '' }]);
            },
            HACK_SEQUENCE.length * HACK_STEP_DELAY + HACK_COMPLETION_DELAY
          );
          break;
        }

        case 'skull':
          setLines((prev) => [
            ...prev,
            { type: 'output', content: CYBER_SKULLS },
            { type: 'output', content: '' },
            { type: 'output', content: 'CYBER TERMINAL ACTIVATED' },
            { type: 'output', content: 'Security level: MAXIMUM' },
            { type: 'output', content: '' },
          ]);
          break;

        case 'neon':
          setLines((prev) => [
            ...prev,
            { type: 'output', content: 'Activating NEON mode...' },
            { type: 'output', content: '▓▓▓▓▓▓▓▓▓▓ NEON ACTIVATED ▓▓▓▓▓▓▓▓▓▓' },
            {
              type: 'output',
              content: 'Visual enhancement protocols engaged.',
            },
            { type: 'output', content: '' },
          ]);
          break;

        case 'meow':
          setLines((prev) => [
            ...prev,
            { type: 'output', content: 'Summoning cyber cats...' },
            { type: 'output', content: '' },
            ...CAT_ASCII.map((line) => ({
              type: 'system' as const,
              content: line,
            })),
            { type: 'output', content: '' },
            {
              type: 'output',
              content: '🐱 MEOW! Cats are bouncing across your screen! 🐱',
            },
            { type: 'output', content: '' },
          ]);

          // Trigger the bouncing cats animation
          if (typeof document !== 'undefined') {
            const terminal = document.querySelector('.terminal');
            if (terminal) {
              // Create multiple cats with different delays
              for (let i = 0; i < CAT_COUNT; i++) {
                setTimeout(() => {
                  const cat = document.createElement('div');
                  cat.className = 'bouncing-cat';
                  cat.innerHTML = CAT_HTML_TEMPLATE;
                  cat.style.cssText = `
                    position: fixed;
                    z-index: 1000;
                    font-size: 12px;
                    line-height: 1;
                    pointer-events: none;
                    left: -100px;
                    top: ${CAT_MIN_TOP + Math.random() * CAT_MAX_TOP_RANGE}vh;
                    animation: bounceCat ${
                      CAT_MIN_DURATION + Math.random() * CAT_MAX_ADDITIONAL_DURATION
                    }s ease-out forwards;
                  `;

                  // Add animation keyframes if not already added
                  if (!document.querySelector('#cat-animation-styles')) {
                    const style = document.createElement('style');
                    style.id = 'cat-animation-styles';
                    style.textContent = CAT_ANIMATION_STYLES;
                    document.head.appendChild(style);
                  }

                  document.body.appendChild(cat);

                  // Remove cat after animation
                  setTimeout(() => {
                    if (cat.parentNode) {
                      cat.parentNode.removeChild(cat);
                    }
                  }, CAT_CLEANUP_DELAY);
                }, i * CAT_SPAWN_DELAY);
              }
            }
          }
          break;

        case 'exit':
          setLines((prev) => [
            ...prev,
            {
              type: 'output',
              content: "Thank you for visiting Chuck's Code Lab!",
            },
            { type: 'output', content: 'System shutting down...' },
            { type: 'output', content: '' },
          ]);
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.close();
            }
          }, EXIT_DELAY);
          break;

        case '':
          // Empty command, just show prompt
          break;

        default:
          setLines((prev) => [
            ...prev,
            { type: 'error', content: `Bad command or file name: ${cmd}` },
            { type: 'error', content: 'Access denied. Unauthorized command.' },
            { type: 'output', content: 'Type HELP for available commands.' },
            { type: 'output', content: '' },
          ]);
      }
    },
    [navigate]
  );

  return { executeCommand };
}
