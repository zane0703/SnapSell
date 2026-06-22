package password

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
)

type Argon2Configuration struct {
	HashRaw    []byte
	Salt       []byte
	TimeCost   uint32
	MemoryCost uint32
	Threads    uint8
	KeyLength  uint32
}

var (
	defaultConfig = Argon2Configuration{
		TimeCost:   2,
		MemoryCost: 64 * 1024,
		Threads:    4,
		KeyLength:  32,
	}
)

func Verify(encodedHash string, password string) (bool, error) {
	config, err := parseArgon2Hash(encodedHash)
	if err != nil {
		return false, err
	}
	computedHash := argon2.IDKey(
		[]byte(password),
		config.Salt,
		config.TimeCost,
		config.MemoryCost,
		config.Threads,
		config.KeyLength,
	)
	return subtle.ConstantTimeCompare(computedHash, config.HashRaw) == 1, nil
}
func parseArgon2Hash(encodedHash string) (*Argon2Configuration, error) {
	components := strings.Split(encodedHash, "$")
	if len(components) != 6 {
		return nil, errors.New("invalid hash format structure")
	}

	// Validate algorithm identifier
	if !strings.HasPrefix(components[1], "argon2id") {
		return nil, errors.New("unsupported algorithm variant")
	}

	// Extract version information
	var version int
	fmt.Sscanf(components[2], "v=%d", &version)

	// Parse configuration parameters
	config := &Argon2Configuration{}
	fmt.Sscanf(components[3], "m=%d,t=%d,p=%d",
		&config.MemoryCost, &config.TimeCost, &config.Threads)

	// Decode salt component
	salt, err := base64.RawStdEncoding.DecodeString(components[4])
	if err != nil {
		return nil, fmt.Errorf("salt decoding failed: %w", err)
	}
	config.Salt = salt

	// Decode hash component
	hash, err := base64.RawStdEncoding.DecodeString(components[5])
	if err != nil {
		return nil, err
	}
	config.HashRaw = hash
	config.KeyLength = uint32(len(hash))

	return config, nil
}

func Hash(password string) (string, error) {
	salt := make([]byte, 32)
	_, err := rand.Read(salt)
	if err != nil {
		return "", err
	}
	rawHash := argon2.IDKey([]byte(password), salt, defaultConfig.TimeCost,
		defaultConfig.MemoryCost,
		defaultConfig.Threads,
		defaultConfig.KeyLength)
	encodedHash := fmt.Sprintf(
		"$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
		argon2.Version,
		defaultConfig.MemoryCost,
		defaultConfig.TimeCost,
		defaultConfig.Threads,
		base64.RawStdEncoding.EncodeToString(salt),
		base64.RawStdEncoding.EncodeToString(rawHash),
	)
	return encodedHash, nil
}
