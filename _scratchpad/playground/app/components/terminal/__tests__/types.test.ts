import { describe, expect, test } from 'vitest';
import type { TerminalLine } from '../types';

describe('Terminal Types', () => {
  test('TerminalLine type should accept valid line objects', () => {
    const commandLine: TerminalLine = {
      type: 'command',
      content: 'test command',
    };

    const outputLine: TerminalLine = {
      type: 'output',
      content: 'test output',
    };

    const errorLine: TerminalLine = {
      type: 'error',
      content: 'test error',
    };

    const systemLine: TerminalLine = {
      type: 'system',
      content: 'test system',
    };

    // These should all be valid TerminalLine objects
    expect(commandLine.type).toBe('command');
    expect(commandLine.content).toBe('test command');

    expect(outputLine.type).toBe('output');
    expect(outputLine.content).toBe('test output');

    expect(errorLine.type).toBe('error');
    expect(errorLine.content).toBe('test error');

    expect(systemLine.type).toBe('system');
    expect(systemLine.content).toBe('test system');
  });

  test('TerminalLine should have required properties', () => {
    const line: TerminalLine = {
      type: 'command',
      content: 'test',
    };

    expect(line).toHaveProperty('type');
    expect(line).toHaveProperty('content');
    expect(typeof line.type).toBe('string');
    expect(typeof line.content).toBe('string');
  });

  test('TerminalLine type should be one of the valid types', () => {
    const validTypes = ['command', 'output', 'error', 'system'];

    const testLine: TerminalLine = {
      type: 'command',
      content: 'test',
    };

    expect(validTypes).toContain(testLine.type);
  });

  test('TerminalLine content should allow empty strings', () => {
    const emptyLine: TerminalLine = {
      type: 'output',
      content: '',
    };

    expect(emptyLine.content).toBe('');
    expect(typeof emptyLine.content).toBe('string');
  });

  test('TerminalLine content should allow multiline strings', () => {
    const multilineLine: TerminalLine = {
      type: 'output',
      content: 'Line 1\nLine 2\nLine 3',
    };

    expect(multilineLine.content).toContain('\n');
    expect(multilineLine.content.split('\n')).toHaveLength(3);
  });
});
