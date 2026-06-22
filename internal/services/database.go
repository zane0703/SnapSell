package services

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NewDB(ctx context.Context) (*pgxpool.Pool, error) {
	return pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
}
