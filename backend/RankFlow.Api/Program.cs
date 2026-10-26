using System.Text.Json;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);
var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__RankFlow")
    ?? builder.Configuration.GetConnectionString("RankFlow")
    ?? "Host=localhost;Port=5432;Database=rankflow;Username=rankflow;Password=rankflow_dev";
builder.Services.AddSingleton(_ => NpgsqlDataSource.Create(connectionString));
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors();

await using (var connection = await app.Services.GetRequiredService<NpgsqlDataSource>().OpenConnectionAsync())
await using (var command = new NpgsqlCommand("""
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      profile jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS trainings (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      completed_at timestamptz NOT NULL,
      data jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS ix_trainings_user_completed
      ON trainings(user_id, completed_at DESC);
    """, connection))
{
    await command.ExecuteNonQueryAsync();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "RankFlow API" }));

app.MapGet("/api/users/{userId}/profile", async (string userId, NpgsqlDataSource dataSource) =>
{
    if (string.IsNullOrWhiteSpace(userId)) return Results.BadRequest(new { message = "Identificador de usuário inválido." });
    await using var connection = await dataSource.OpenConnectionAsync();
    await using var command = new NpgsqlCommand("SELECT profile FROM users WHERE id = @id", connection);
    command.Parameters.AddWithValue("id", userId);
    var result = await command.ExecuteScalarAsync();
    if (result is string json) return Results.Content(json, "application/json");
    return Results.NotFound(new { message = "Perfil não encontrado." });
});

app.MapPut("/api/users/{userId}/profile", async (string userId, JsonElement profile, NpgsqlDataSource dataSource) =>
{
    if (string.IsNullOrWhiteSpace(userId) || profile.ValueKind != JsonValueKind.Object)
        return Results.BadRequest(new { message = "Envie um perfil JSON válido." });
    var json = profile.GetRawText();
    await using var connection = await dataSource.OpenConnectionAsync();
    await using var command = new NpgsqlCommand("""
        INSERT INTO users(id, profile, updated_at) VALUES (@id, @profile::jsonb, now())
        ON CONFLICT(id) DO UPDATE SET profile = EXCLUDED.profile, updated_at = now()
        """, connection);
    command.Parameters.AddWithValue("id", userId);
    command.Parameters.AddWithValue("profile", json);
    await command.ExecuteNonQueryAsync();
    return Results.Content(json, "application/json");
});

app.MapGet("/api/users/{userId}/trainings", async (string userId, NpgsqlDataSource dataSource) =>
{
    await using var connection = await dataSource.OpenConnectionAsync();
    await using var command = new NpgsqlCommand("SELECT data::text FROM trainings WHERE user_id = @user ORDER BY completed_at DESC", connection);
    command.Parameters.AddWithValue("user", userId);
    await using var reader = await command.ExecuteReaderAsync();
    var records = new List<JsonElement>();
    while (await reader.ReadAsync())
        records.Add(JsonDocument.Parse(reader.GetString(0)).RootElement.Clone());
    return Results.Json(records);
});

app.MapPost("/api/users/{userId}/trainings", async (string userId, JsonElement training, NpgsqlDataSource dataSource) =>
{
    if (string.IsNullOrWhiteSpace(userId) || training.ValueKind != JsonValueKind.Object)
        return Results.BadRequest(new { message = "Envie um treino válido." });
    if (!training.TryGetProperty("id", out var idElement) ||
        idElement.ValueKind != JsonValueKind.String ||
        string.IsNullOrWhiteSpace(idElement.GetString()))
        return Results.BadRequest(new { message = "O treino precisa ter um identificador textual." });
    if (!training.TryGetProperty("completedAt", out var dateElement) ||
        dateElement.ValueKind != JsonValueKind.String ||
        !DateTimeOffset.TryParse(dateElement.GetString(), out var completedAt))
        return Results.BadRequest(new { message = "Informe uma data de conclusão válida." });

    var json = training.GetRawText();
    await using var connection = await dataSource.OpenConnectionAsync();
    await using var transaction = await connection.BeginTransactionAsync();
    await using (var ensureUser = new NpgsqlCommand("""
        INSERT INTO users(id, profile) VALUES (@id, '{}'::jsonb)
        ON CONFLICT(id) DO NOTHING
        """, connection, transaction))
    {
        ensureUser.Parameters.AddWithValue("id", userId);
        await ensureUser.ExecuteNonQueryAsync();
    }
    await using (var command = new NpgsqlCommand("""
        INSERT INTO trainings(id, user_id, completed_at, data)
        VALUES (@id, @user, @completed, @data::jsonb)
        ON CONFLICT(id) DO UPDATE SET completed_at = EXCLUDED.completed_at, data = EXCLUDED.data
        """, connection, transaction))
    {
        command.Parameters.AddWithValue("id", idElement.GetString()!);
        command.Parameters.AddWithValue("user", userId);
        command.Parameters.AddWithValue("completed", completedAt);
        command.Parameters.AddWithValue("data", json);
        await command.ExecuteNonQueryAsync();
    }
    await transaction.CommitAsync();
    return Results.Content(json, "application/json");
});

app.MapDelete("/api/users/{userId}/trainings/{trainingId}", async (string userId, string trainingId, NpgsqlDataSource dataSource) =>
{
    await using var connection = await dataSource.OpenConnectionAsync();
    await using var command = new NpgsqlCommand("DELETE FROM trainings WHERE user_id = @user AND id = @id", connection);
    command.Parameters.AddWithValue("user", userId);
    command.Parameters.AddWithValue("id", trainingId);
    var deleted = await command.ExecuteNonQueryAsync();
    if (deleted > 0) return Results.NoContent();
    return Results.NotFound(new { message = "Treino não encontrado." });
});

app.Run();

public partial class Program { }
