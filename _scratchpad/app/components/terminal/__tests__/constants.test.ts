import { describe, expect, test } from 'vitest';
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
} from '../constants';

describe('Terminal Constants', () => {
  describe('ASCII Art', () => {
    test('ASCII_LOGO should be a non-empty string', () => {
      expect(typeof ASCII_LOGO).toBe('string');
      expect(ASCII_LOGO.trim()).toBeTruthy();
      expect(ASCII_LOGO).toContain('CHUCK');
    });

    test('CYBER_SKULLS should be a non-empty string', () => {
      expect(typeof CYBER_SKULLS).toBe('string');
      expect(CYBER_SKULLS.trim()).toBeTruthy();
      expect(CYBER_SKULLS).toContain('CYBER');
    });

    test('CAT_ASCII should contain cat parts', () => {
      expect(Array.isArray(CAT_ASCII)).toBe(true);
      expect(CAT_ASCII).toHaveLength(3);
      expect(CAT_ASCII[0]).toContain('/\\_/\\');
      expect(CAT_ASCII[1]).toContain('( o.o )');
      expect(CAT_ASCII[2]).toContain('> ^ <');
    });
  });

  describe('Command Arrays', () => {
    test('MATRIX_EFFECT should contain Matrix quotes', () => {
      expect(Array.isArray(MATRIX_EFFECT)).toBe(true);
      expect(MATRIX_EFFECT.length).toBeGreaterThan(0);
      expect(MATRIX_EFFECT).toContain('Wake up, Neo...');
      expect(MATRIX_EFFECT).toContain('There is no spoon.');
    });

    test('HACK_SEQUENCE should contain hacking steps', () => {
      expect(Array.isArray(HACK_SEQUENCE)).toBe(true);
      expect(HACK_SEQUENCE.length).toBeGreaterThan(0);
      expect(HACK_SEQUENCE).toContain('Bypassing firewall... [████████████] 100%');
      expect(HACK_SEQUENCE).toContain('HACK SUCCESSFUL - ACCESS GRANTED');
    });

    test('HELP_COMMANDS should have proper structure', () => {
      expect(Array.isArray(HELP_COMMANDS)).toBe(true);
      expect(HELP_COMMANDS.length).toBeGreaterThan(0);

      for (const cmd of HELP_COMMANDS) {
        expect(cmd).toHaveProperty('command');
        expect(cmd).toHaveProperty('description');
        expect(typeof cmd.command).toBe('string');
        expect(typeof cmd.description).toBe('string');
      }

      // Check for key commands
      const commands = HELP_COMMANDS.map((cmd) => cmd.command);
      expect(commands).toContain('HELP');
      expect(commands).toContain('MEOW');
      expect(commands).toContain('MATRIX');
    });

    test('TECH_STACK should contain technologies', () => {
      expect(Array.isArray(TECH_STACK)).toBe(true);
      expect(TECH_STACK).toContain('• React Router v7');
      expect(TECH_STACK).toContain('• TypeScript');
    });

    test('DIRECTORY_LISTING should contain file info', () => {
      expect(Array.isArray(DIRECTORY_LISTING)).toBe(true);
      expect(DIRECTORY_LISTING).toContain('Directory of C:\\CHUCK\\PROJECTS');
      expect(DIRECTORY_LISTING.some((line) => line.includes('GRADIENT.EXE'))).toBe(true);
      expect(DIRECTORY_LISTING.some((line) => line.includes('GLASS.EXE'))).toBe(true);
    });
  });

  describe('Animation Constants', () => {
    test('timing constants should be positive numbers', () => {
      expect(MATRIX_DELAY).toBeGreaterThan(0);
      expect(MATRIX_FINAL_DELAY).toBeGreaterThan(0);
      expect(HACK_STEP_DELAY).toBeGreaterThan(0);
      expect(HACK_COMPLETION_DELAY).toBeGreaterThan(0);
      expect(CAT_SPAWN_DELAY).toBeGreaterThan(0);
      expect(CAT_CLEANUP_DELAY).toBeGreaterThan(0);
      expect(NAVIGATION_DELAY).toBeGreaterThan(0);
      expect(EXIT_DELAY).toBeGreaterThan(0);
    });

    test('cat animation constants should be valid', () => {
      expect(CAT_COUNT).toBeGreaterThan(0);
      expect(CAT_MIN_DURATION).toBeGreaterThan(0);
      expect(CAT_MAX_ADDITIONAL_DURATION).toBeGreaterThanOrEqual(0);
      expect(CAT_MIN_TOP).toBeGreaterThanOrEqual(0);
      expect(CAT_MAX_TOP_RANGE).toBeGreaterThan(0);
    });

    test('CAT_ANIMATION_STYLES should contain valid CSS', () => {
      expect(typeof CAT_ANIMATION_STYLES).toBe('string');
      expect(CAT_ANIMATION_STYLES).toContain('@keyframes bounceCat');
      expect(CAT_ANIMATION_STYLES).toContain('transform:');
      expect(CAT_ANIMATION_STYLES).toContain('left:');
    });

    test('CAT_HTML_TEMPLATE should contain cat markup', () => {
      expect(typeof CAT_HTML_TEMPLATE).toBe('string');
      expect(CAT_HTML_TEMPLATE).toContain('div');
      expect(CAT_HTML_TEMPLATE).toContain('/\\_/\\');
      expect(CAT_HTML_TEMPLATE).toContain('( ^.^ )');
    });
  });
});
