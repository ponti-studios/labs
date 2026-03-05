env "local" {
  src = "file://db/schema.sql"
  dev = "sqlite://db/dev.db"
  url = "sqlite://db/app.db"

  migration {
    dir = "file://db/migrations"
  }

  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}

# additional environment for MySQL (used by docker-compose)
env "mysql" {
  # expects DATABASE_URL=mysql://user:pass@host:3306/dbname
  url = env("DATABASE_URL")

  migration {
    dir = "file://db/migrations"
  }

  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}
