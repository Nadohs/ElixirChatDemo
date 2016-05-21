ExUnit.start

Mix.Task.run "ecto.create", ~w(-r Lgchat.Repo --quiet)
Mix.Task.run "ecto.migrate", ~w(-r Lgchat.Repo --quiet)
Ecto.Adapters.SQL.begin_test_transaction(Lgchat.Repo)

