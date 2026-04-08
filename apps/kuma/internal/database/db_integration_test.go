package database

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupTestDB(t *testing.T) *DB {
	db, err := New(":memory:")
	require.NoError(t, err)
	return db
}

func TestNew(t *testing.T) {
	db, err := New(":memory:")
	require.NoError(t, err)
	defer db.Close()

	assert.NotNil(t, db)
	err = db.Ping(context.Background())
	assert.NoError(t, err)
}

func TestNew_InvalidPath(t *testing.T) {
	_, err := New("/nonexistent/path/test.db")
	require.Error(t, err)
}

func TestDB_Ping(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	err := db.Ping(context.Background())
	assert.NoError(t, err)
}

func TestDB_CreateAndGetUser(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	user, err := db.CreateUser(ctx, "+1234567890")
	require.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, int64(1), user.ID)
	assert.Equal(t, "+1234567890", user.PhoneNumber)
	assert.Nil(t, user.Name)
	assert.False(t, user.DailySignsEnabled)

	retrieved, err := db.GetUserByPhoneNumber(ctx, "+1234567890")
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, user.ID, retrieved.ID)
}

func TestDB_CreateUser_Duplicate(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	_, err := db.CreateUser(ctx, "+1234567890")
	require.NoError(t, err)

	_, err = db.CreateUser(ctx, "+1234567890")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "UNIQUE constraint failed")
}

func TestDB_GetUserByPhoneNumber_NotFound(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	user, err := db.GetUserByPhoneNumber(ctx, "+9999999999")
	require.NoError(t, err)
	assert.Nil(t, user)
}

func TestDB_UpdateUserName(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	user, err := db.CreateUser(ctx, "+1234567890")
	require.NoError(t, err)

	err = db.UpdateUserName(ctx, user.ID, "Charles")
	require.NoError(t, err)

	updated, err := db.GetUserByPhoneNumber(ctx, "+1234567890")
	require.NoError(t, err)
	assert.NotNil(t, updated.Name)
	assert.Equal(t, "Charles", *updated.Name)
}

func TestDB_ToggleDailySigns(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	user, err := db.CreateUser(ctx, "+1234567890")
	require.NoError(t, err)
	assert.False(t, user.DailySignsEnabled)

	err = db.ToggleDailySigns(ctx, user.ID, true)
	require.NoError(t, err)

	updated, err := db.GetUserByPhoneNumber(ctx, "+1234567890")
	require.NoError(t, err)
	assert.True(t, updated.DailySignsEnabled)

	err = db.ToggleDailySigns(ctx, user.ID, false)
	require.NoError(t, err)

	updated, err = db.GetUserByPhoneNumber(ctx, "+1234567890")
	require.NoError(t, err)
	assert.False(t, updated.DailySignsEnabled)
}

func TestDB_SaveAndGetMessage(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	user, err := db.CreateUser(ctx, "+1234567890")
	require.NoError(t, err)

	msg, err := db.SaveMessage(ctx, user.ID, "user", "Hello Kuma")
	require.NoError(t, err)
	assert.NotNil(t, msg)

	msg, err = db.SaveMessage(ctx, user.ID, "assistant", "Hello!")
	require.NoError(t, err)
	assert.NotNil(t, msg)

	messages, err := db.GetConversationHistory(ctx, user.ID, 10)
	require.NoError(t, err)
	assert.Len(t, messages, 2)
	assert.Equal(t, "assistant", messages[0].Role)
	assert.Equal(t, "Hello!", messages[0].Content)
	assert.Equal(t, "user", messages[1].Role)
	assert.Equal(t, "Hello Kuma", messages[1].Content)
}

func TestDB_GetConversationHistory_Order(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	user, err := db.CreateUser(ctx, "+1234567890")
	require.NoError(t, err)

	_, _ = db.SaveMessage(ctx, user.ID, "user", "First")
	_, _ = db.SaveMessage(ctx, user.ID, "assistant", "Second")
	_, _ = db.SaveMessage(ctx, user.ID, "user", "Third")

	messages, err := db.GetConversationHistory(ctx, user.ID, 10)
	require.NoError(t, err)
	assert.Len(t, messages, 3)
	assert.Equal(t, "Third", messages[0].Content)
	assert.Equal(t, "Second", messages[1].Content)
	assert.Equal(t, "First", messages[2].Content)
}

func TestDB_GetConversationHistory_Limit(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	user, err := db.CreateUser(ctx, "+1234567890")
	require.NoError(t, err)

	for i := 0; i < 15; i++ {
		_, err := db.SaveMessage(ctx, user.ID, "user", "Message "+string(rune('A'+i)))
		require.NoError(t, err)
	}

	messages, err := db.GetConversationHistory(ctx, user.ID, 5)
	require.NoError(t, err)
	assert.Len(t, messages, 5)
}

func TestDB_GetConversationHistory_Empty(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	user, err := db.CreateUser(ctx, "+1234567890")
	require.NoError(t, err)

	messages, err := db.GetConversationHistory(ctx, user.ID, 10)
	require.NoError(t, err)
	assert.Len(t, messages, 0)
}

func TestDB_GetStats(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	_, err := db.CreateUser(ctx, "+1234567890")
	require.NoError(t, err)
	_, err = db.CreateUser(ctx, "+0987654321")
	require.NoError(t, err)

	user1, _ := db.GetUserByPhoneNumber(ctx, "+1234567890")
	_, _ = db.SaveMessage(ctx, user1.ID, "user", "Hello")
	_, _ = db.SaveMessage(ctx, user1.ID, "assistant", "Hi")
	_, _ = db.SaveMessage(ctx, user1.ID, "user", "How are you?")

	_ = db.ToggleDailySigns(ctx, user1.ID, true)

	stats, err := db.GetStats(ctx)
	require.NoError(t, err)
	assert.Equal(t, 2, stats.TotalUsers)
	assert.Equal(t, 3, stats.TotalMessages)
	assert.Equal(t, 1, stats.UsersWithSigns)
}

func TestDB_MultipleUsers(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	users := []string{"+1111111111", "+2222222222", "+3333333333"}
	for _, phone := range users {
		_, err := db.CreateUser(ctx, phone)
		require.NoError(t, err)
	}

	for _, phone := range users {
		user, err := db.GetUserByPhoneNumber(ctx, phone)
		require.NoError(t, err)
		assert.NotNil(t, user)
	}

	stats, err := db.GetStats(ctx)
	require.NoError(t, err)
	assert.Equal(t, 3, stats.TotalUsers)
}
