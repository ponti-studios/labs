package config

type CLIConfig struct {
	APIURL string
	Token  string
}

func LoadCLI() *CLIConfig {
	cfg := &CLIConfig{
		APIURL: getEnv("HOMINEM_API_URL", "http://localhost:8080"),
		Token:  getEnv("HOMINEM_TOKEN", ""),
	}
	return cfg
}
