package kuma

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseCommand_Dream(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected *Command
	}{
		{
			name:  "dream command with text",
			input: "/dream I was flying over a taco",
			expected: &Command{
				Type:    "dream",
				Args:    []string{"I was flying over a taco"},
				RawText: "/dream I was flying over a taco",
			},
		},
		{
			name:  "dream command case insensitive",
			input: "/DREAM I was flying",
			expected: &Command{
				Type:    "dream",
				Args:    []string{"/DREAM I was flying"},
				RawText: "/DREAM I was flying",
			},
		},
		{
			name:  "dream command with extra spaces",
			input: "/dream   extra spaces  ",
			expected: &Command{
				Type:    "dream",
				Args:    []string{"  extra spaces"},
				RawText: "/dream   extra spaces",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ParseCommand(tt.input)
			assert.Equal(t, tt.expected.Type, result.Type)
			assert.Equal(t, tt.expected.Args, result.Args)
		})
	}
}

func TestParseCommand_Manifest(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected *Command
	}{
		{
			name:  "manifest command",
			input: "/manifest a parking spot",
			expected: &Command{
				Type:    "manifest",
				Args:    []string{"a parking spot"},
				RawText: "/manifest a parking spot",
			},
		},
		{
			name:  "manifesto command alias",
			input: "/manifesto good hair day",
			expected: &Command{
				Type:    "manifest",
				Args:    []string{"/manifesto good hair day"},
				RawText: "/manifesto good hair day",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ParseCommand(tt.input)
			assert.Equal(t, tt.expected.Type, result.Type)
			assert.Equal(t, tt.expected.Args, result.Args)
		})
	}
}

func TestParseCommand_Fortune(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected *Command
	}{
		{
			name:  "fortune command",
			input: "/fortune",
			expected: &Command{
				Type:    "fortune",
				Args:    []string{},
				RawText: "/fortune",
			},
		},
		{
			name:  "fortune command with trailing space",
			input: "/fortune ",
			expected: &Command{
				Type:    "fortune",
				Args:    []string{},
				RawText: "/fortune ",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ParseCommand(tt.input)
			assert.Equal(t, tt.expected.Type, result.Type)
		})
	}
}

func TestParseCommand_Guidance(t *testing.T) {
	result := ParseCommand("/guidance should I move to silver lake?")
	assert.Equal(t, "guidance", result.Type)
	assert.Equal(t, []string{"should I move to silver lake?"}, result.Args)
}

func TestParseCommand_Name(t *testing.T) {
	result := ParseCommand("/name Charles")
	assert.Equal(t, "name", result.Type)
	assert.Equal(t, []string{"Charles"}, result.Args)
}

func TestParseCommand_Signs(t *testing.T) {
	result := ParseCommand("/signs")
	assert.Equal(t, "signs", result.Type)
	assert.Equal(t, []string{}, result.Args)
}

func TestParseCommand_NoSigns(t *testing.T) {
	result := ParseCommand("/nosigns")
	assert.Equal(t, "nosigns", result.Type)
	assert.Equal(t, []string{}, result.Args)
}

func TestParseCommand_Help(t *testing.T) {
	result := ParseCommand("/help")
	assert.Equal(t, "help", result.Type)
	assert.Equal(t, []string{}, result.Args)
}

func TestParseCommand_General(t *testing.T) {
	tests := []struct {
		name  string
		input string
	}{
		{
			name:  "general message",
			input: "Hello Kuma",
		},
		{
			name:  "empty message",
			input: "",
		},
		{
			name:  "just spaces",
			input: "   ",
		},
		{
			name:  "text that looks like command but isn't",
			input: "I love dreaming about tacos",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ParseCommand(tt.input)
			assert.Equal(t, "general", result.Type)
		})
	}
}

func TestGetNameFromCommand(t *testing.T) {
	tests := []struct {
		name     string
		cmd      *Command
		expected string
	}{
		{
			name:     "valid name command",
			cmd:      &Command{Type: "name", Args: []string{"Charles"}},
			expected: "Charles",
		},
		{
			name:     "name command with spaces",
			cmd:      &Command{Type: "name", Args: []string{"  Charles Ponti  "}},
			expected: "Charles Ponti",
		},
		{
			name:     "wrong command type",
			cmd:      &Command{Type: "dream", Args: []string{"test"}},
			expected: "",
		},
		{
			name:     "empty args",
			cmd:      &Command{Type: "name", Args: []string{}},
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := GetNameFromCommand(tt.cmd)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestHelpText(t *testing.T) {
	assert.Contains(t, HelpText, "KUMA COMMANDS")
	assert.Contains(t, HelpText, "/dream")
	assert.Contains(t, HelpText, "/manifest")
	assert.Contains(t, HelpText, "/fortune")
	assert.Contains(t, HelpText, "/guidance")
	assert.Contains(t, HelpText, "/name")
	assert.Contains(t, HelpText, "/signs")
	assert.Contains(t, HelpText, "/nosigns")
	assert.Contains(t, HelpText, "/help")
}

type mockClient struct {
	generateFunc func(ctx context.Context, messages []Message) (string, error)
}

func (m *mockClient) Generate(ctx context.Context, messages []Message) (string, error) {
	if m.generateFunc != nil {
		return m.generateFunc(ctx, messages)
	}
	return "mock response", nil
}

func (m *mockClient) GenerateDream(ctx context.Context, dream string) (string, error) {
	return "You dreamed of: " + dream, nil
}

func (m *mockClient) GenerateManifestation(ctx context.Context, desire string) (string, error) {
	return "Manifesting: " + desire, nil
}

func (m *mockClient) GenerateFortune(ctx context.Context) (string, error) {
	return "Your fortune: good luck", nil
}

func (m *mockClient) GenerateGuidance(ctx context.Context, question string) (string, error) {
	return "Guidance for: " + question, nil
}

func (m *mockClient) GenerateGeneral(ctx context.Context, text, userName string, history []Message) (string, error) {
	if m.generateFunc != nil {
		return m.generateFunc(ctx, []Message{{Role: "user", Content: text}})
	}
	return "Response to: " + text, nil
}

func TestHandleCommand_Dream(t *testing.T) {
	client := &mockClient{}
	ctx := context.Background()

	cmd := &Command{
		Type:    "dream",
		Args:    []string{"flying tacos"},
		RawText: "/dream flying tacos",
	}

	response, err := HandleCommand(ctx, client, cmd, "", nil)
	require.NoError(t, err)
	assert.Contains(t, response, "flying tacos")
}

func TestHandleCommand_DreamNoArgs(t *testing.T) {
	client := &mockClient{}
	ctx := context.Background()

	cmd := &Command{
		Type:    "dream",
		Args:    []string{},
		RawText: "/dream",
	}

	response, err := HandleCommand(ctx, client, cmd, "", nil)
	require.NoError(t, err)
	assert.Contains(t, response, "/dream")
}

func TestHandleCommand_Manifest(t *testing.T) {
	client := &mockClient{}
	ctx := context.Background()

	cmd := &Command{
		Type:    "manifest",
		Args:    []string{"parking spot"},
		RawText: "/manifest parking spot",
	}

	response, err := HandleCommand(ctx, client, cmd, "", nil)
	require.NoError(t, err)
	assert.Contains(t, response, "parking spot")
}

func TestHandleCommand_Fortune(t *testing.T) {
	client := &mockClient{}
	ctx := context.Background()

	cmd := &Command{
		Type:    "fortune",
		Args:    []string{},
		RawText: "/fortune",
	}

	response, err := HandleCommand(ctx, client, cmd, "", nil)
	require.NoError(t, err)
	assert.NotEmpty(t, response)
}

func TestHandleCommand_Guidance(t *testing.T) {
	client := &mockClient{}
	ctx := context.Background()

	cmd := &Command{
		Type:    "guidance",
		Args:    []string{"should I move?"},
		RawText: "/guidance should I move?",
	}

	response, err := HandleCommand(ctx, client, cmd, "", nil)
	require.NoError(t, err)
	assert.Contains(t, response, "should I move?")
}

func TestHandleCommand_GuidanceNoArgs(t *testing.T) {
	client := &mockClient{}
	ctx := context.Background()

	cmd := &Command{
		Type:    "guidance",
		Args:    []string{},
		RawText: "/guidance",
	}

	response, err := HandleCommand(ctx, client, cmd, "", nil)
	require.NoError(t, err)
	assert.Contains(t, response, "/guidance")
}

func TestHandleCommand_Help(t *testing.T) {
	client := &mockClient{}
	ctx := context.Background()

	cmd := &Command{
		Type:    "help",
		Args:    []string{},
		RawText: "/help",
	}

	response, err := HandleCommand(ctx, client, cmd, "", nil)
	require.NoError(t, err)
	assert.Equal(t, HelpText, response)
}

func TestHandleCommand_Name(t *testing.T) {
	client := &mockClient{}
	ctx := context.Background()

	cmd := &Command{
		Type:    "name",
		Args:    []string{"Charles"},
		RawText: "/name Charles",
	}

	_, err := HandleCommand(ctx, client, cmd, "", nil)
	require.Error(t, err)
	assert.Equal(t, "name_command", err.Error())
}

func TestHandleCommand_Signs(t *testing.T) {
	client := &mockClient{}
	ctx := context.Background()

	cmd := &Command{
		Type:    "signs",
		Args:    []string{},
		RawText: "/signs",
	}

	_, err := HandleCommand(ctx, client, cmd, "", nil)
	require.Error(t, err)
	assert.Equal(t, "signs_command", err.Error())
}

func TestHandleCommand_NoSigns(t *testing.T) {
	client := &mockClient{}
	ctx := context.Background()

	cmd := &Command{
		Type:    "nosigns",
		Args:    []string{},
		RawText: "/nosigns",
	}

	_, err := HandleCommand(ctx, client, cmd, "", nil)
	require.Error(t, err)
	assert.Equal(t, "nosigns_command", err.Error())
}

func TestHandleCommand_General(t *testing.T) {
	client := &mockClient{}
	ctx := context.Background()

	cmd := &Command{
		Type:    "general",
		Args:    []string{"Hello Kuma"},
		RawText: "Hello Kuma",
	}

	response, err := HandleCommand(ctx, client, cmd, "Charles", nil)
	require.NoError(t, err)
	assert.Contains(t, response, "Hello Kuma")
}

func TestHandleCommand_GeneralWithHistory(t *testing.T) {
	var capturedHistory []Message
	client := &mockClient{
		generateFunc: func(ctx context.Context, messages []Message) (string, error) {
			capturedHistory = messages
			return "Contextual response", nil
		},
	}
	ctx := context.Background()

	history := []Message{
		{Role: "user", Content: "First message"},
		{Role: "assistant", Content: "First response"},
	}

	cmd := &Command{
		Type:    "general",
		Args:    []string{"Second message"},
		RawText: "Second message",
	}

	response, err := HandleCommand(ctx, client, cmd, "Charles", history)
	require.NoError(t, err)
	assert.Equal(t, "Contextual response", response)
	assert.NotNil(t, capturedHistory)
}

func TestHandleCommand_Unknown(t *testing.T) {
	client := &mockClient{}
	ctx := context.Background()

	cmd := &Command{
		Type:    "unknown",
		Args:    []string{},
		RawText: "/unknown",
	}

	response, err := HandleCommand(ctx, client, cmd, "", nil)
	require.NoError(t, err)
	assert.Contains(t, response, "cosmos does not understand")
}
