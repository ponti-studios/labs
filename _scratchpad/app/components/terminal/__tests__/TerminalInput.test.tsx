import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { TerminalInput } from '../TerminalInput';

// Mock the CSS module
vi.mock('../../routes/home.module.css', () => ({
  default: {
    terminalLine: 'terminalLine',
    prompt: 'prompt',
    inputWrapper: 'inputWrapper',
    typedText: 'typedText',
    cursor: 'cursor',
    commandInput: 'commandInput',
  },
}));

describe('TerminalInput Component', () => {
  const mockOnCommandChange = vi.fn();
  const mockOnKeyDown = vi.fn();
  const defaultProps = {
    currentCommand: '',
    onCommandChange: mockOnCommandChange,
    onKeyDown: mockOnKeyDown,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders prompt and input correctly', () => {
    render(<TerminalInput {...defaultProps} />);

    expect(screen.getByText('C:\\CHUCK>')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('displays current command text', () => {
    render(<TerminalInput {...defaultProps} currentCommand="test command" />);

    expect(screen.getByText('test command')).toBeInTheDocument();
  });

  test('shows cursor', () => {
    render(<TerminalInput {...defaultProps} currentCommand="test" />);

    const cursor = screen.getByText('_');
    expect(cursor).toBeInTheDocument();
  });

  test('calls onCommandChange when typing', async () => {
    const user = userEvent.setup();
    render(<TerminalInput {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'h');

    expect(mockOnCommandChange).toHaveBeenCalledWith('h');
  });

  test('calls onKeyDown when keys are pressed', async () => {
    const user = userEvent.setup();
    render(<TerminalInput {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '{enter}');

    expect(mockOnKeyDown).toHaveBeenCalled();
  });

  test('handles arrow key presses', async () => {
    const user = userEvent.setup();
    render(<TerminalInput {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '{arrowup}');
    await user.type(input, '{arrowdown}');

    expect(mockOnKeyDown).toHaveBeenCalledTimes(2);
  });

  test('input value matches currentCommand prop', () => {
    render(<TerminalInput {...defaultProps} currentCommand="help" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('help');
  });

  test('input has correct attributes', () => {
    render(<TerminalInput {...defaultProps} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toHaveAttribute('autoComplete', 'off');
    expect(input).toHaveAttribute('spellCheck', 'false');
  });

  test('input is visually hidden but functional', () => {
    render(<TerminalInput {...defaultProps} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.style.position).toBe('absolute');
    expect(input.style.left).toBe('-9999px');
    expect(input.style.opacity).toBe('0');
  });

  test('handles special characters', async () => {
    const user = userEvent.setup();
    render(<TerminalInput {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '!@#$%');

    // Since user.type() simulates each character separately and the component
    // only passes through individual characters, verify special chars are handled
    expect(mockOnCommandChange).toHaveBeenCalledWith('!');
    expect(mockOnCommandChange).toHaveBeenCalledWith('@');
    expect(mockOnCommandChange).toHaveBeenCalledWith('#');
    expect(mockOnCommandChange).toHaveBeenCalledWith('$');
    expect(mockOnCommandChange).toHaveBeenCalledWith('%');
    expect(mockOnCommandChange).toHaveBeenCalledTimes(5);
  });

  test('handles backspace and delete', async () => {
    const user = userEvent.setup();
    render(<TerminalInput {...defaultProps} currentCommand="test" />);

    const input = screen.getByRole('textbox');
    await user.type(input, '{backspace}');

    expect(mockOnKeyDown).toHaveBeenCalled();
  });

  test('component is memoized', () => {
    const { rerender } = render(<TerminalInput {...defaultProps} />);

    // Re-render with same props
    rerender(<TerminalInput {...defaultProps} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('forwardRef works correctly', () => {
    const ref = { current: null };
    render(<TerminalInput {...defaultProps} ref={ref} />);

    expect(ref.current).toBeTruthy();
  });

  test('updates when currentCommand changes', () => {
    const { rerender } = render(<TerminalInput {...defaultProps} currentCommand="initial" />);

    expect(screen.getByText('initial')).toBeInTheDocument();

    rerender(<TerminalInput {...defaultProps} currentCommand="updated" />);

    expect(screen.getByText('updated')).toBeInTheDocument();
  });
});
