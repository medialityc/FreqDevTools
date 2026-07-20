import { describe, expect, it } from "vitest";
import { keyValueToAppSettingsJson, parseKeyValueConfig } from "./appsettings-parser";

describe("parseKeyValueConfig", () => {
  it("mapea pares clave=valor planos", () => {
    const result = parseKeyValueConfig("BaseUrl=Valor1\nTimeout=30");
    expect(result).toEqual({ BaseUrl: "Valor1", Timeout: "30" });
  });

  it("anida claves separadas por ':'", () => {
    const result = parseKeyValueConfig(
      "ConnectionStrings:logs=Host=srv;Port=5432;Database=logsdb",
    );
    expect(result).toEqual({
      ConnectionStrings: {
        logs: "Host=srv;Port=5432;Database=logsdb",
      },
    });
  });

  it("preserva el '=' dentro del valor de una connection string", () => {
    const result = parseKeyValueConfig(
      "ConnectionStrings:logs = Host=srv-captain--pro-contacts-sync-logs-db;Port=5432;Database=zascontactsynclogs",
    );
    expect(
      (result.ConnectionStrings as Record<string, unknown>).logs,
    ).toBe(
      "Host=srv-captain--pro-contacts-sync-logs-db;Port=5432;Database=zascontactsynclogs",
    );
  });

  it("combina varias claves anidadas bajo la misma sección", () => {
    const result = parseKeyValueConfig(
      "Logging:LogLevel:Default=Information\nLogging:LogLevel:System=Warning",
    );
    expect(result).toEqual({
      Logging: { LogLevel: { Default: "Information", System: "Warning" } },
    });
  });

  it("convierte true/false a booleanos", () => {
    const result = parseKeyValueConfig("FeatureX:Enabled=true\nFeatureX:Beta=False");
    expect(result).toEqual({ FeatureX: { Enabled: true, Beta: false } });
  });

  it("ignora líneas vacías y comentarios", () => {
    const result = parseKeyValueConfig(
      "# comentario\n\n// otro comentario\nBaseUrl=Valor1",
    );
    expect(result).toEqual({ BaseUrl: "Valor1" });
  });

  it("convierte secciones con claves numéricas secuenciales en arreglos", () => {
    const result = parseKeyValueConfig(
      "Cors:AllowedOrigins:0=https://a.com\nCors:AllowedOrigins:1=https://b.com",
    );
    const json = JSON.parse(keyValueToAppSettingsJson(
      "Cors:AllowedOrigins:0=https://a.com\nCors:AllowedOrigins:1=https://b.com",
    ));
    expect(result.Cors).toBeTruthy();
    expect(json).toEqual({
      Cors: { AllowedOrigins: ["https://a.com", "https://b.com"] },
    });
  });

  it("lanza error si falta '=' en una línea", () => {
    expect(() => parseKeyValueConfig("BaseUrl")).toThrow();
  });

  it("lanza error si una clave se usa como valor y como sección", () => {
    expect(() =>
      parseKeyValueConfig("ConnectionStrings=foo\nConnectionStrings:logs=bar"),
    ).toThrow();
  });

  it("lanza error si no hay ningún par clave=valor", () => {
    expect(() => parseKeyValueConfig("# solo comentarios\n\n")).toThrow();
  });
});

describe("keyValueToAppSettingsJson", () => {
  it("produce un JSON con formato de appsettings.json", () => {
    const json = keyValueToAppSettingsJson(
      "BaseUrl=Valor1\nConnectionStrings:logs=Host=srv-captain--pro-contacts-sync-logs-db;Port=5432;Database=zascontactsynclogs",
    );
    expect(JSON.parse(json)).toEqual({
      BaseUrl: "Valor1",
      ConnectionStrings: {
        logs: "Host=srv-captain--pro-contacts-sync-logs-db;Port=5432;Database=zascontactsynclogs",
      },
    });
  });
});
