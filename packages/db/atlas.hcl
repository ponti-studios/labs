env "local" {
  # source is the current full schema; atlas will produce diffs against it
  src = "file://migrations/0001_initial.sql"

  # the URL is supplied via DATABASE_URL like other packages
  url = getenv("DATABASE_URL")

  migration {
    dir = "file://migrations"
  }

  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}

# convenience environment that doesn't require a full schema file
env "mysql" {
  url = getenv("DATABASE_URL")

  migration {
    dir = "file://migrations"
  }

  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}
