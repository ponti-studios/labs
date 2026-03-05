env "local" {
  src = "file://db/schema.sql"
  url = getenv("DATABASE_URL")

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
  url = getenv("DATABASE_URL")

  migration {
    dir = "file://db/migrations"
  }

  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}
