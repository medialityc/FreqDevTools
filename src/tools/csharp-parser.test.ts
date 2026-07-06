import { describe, expect, it } from "vitest";
import { csharpToJsonExample, parseCSharp } from "./csharp-parser";

describe("csharpToJsonExample", () => {
  it("mapea tipos primitivos a defaults estilo Swagger", () => {
    const src = `
      public class Person {
        public string Name { get; set; }
        public int Age { get; set; }
        public bool Active { get; set; }
        public double Score { get; set; }
        public Guid Id { get; set; }
        public DateTime CreatedAt { get; set; }
      }`;
    const json = JSON.parse(csharpToJsonExample(src));
    expect(json).toEqual({
      Name: "string",
      Age: 0,
      Active: true,
      Score: 0,
      Id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      CreatedAt: "2024-01-01T00:00:00Z",
    });
  });

  it("maneja nullables y colecciones", () => {
    const src = `
      public class Order {
        public int? Quantity { get; set; }
        public List<string> Tags { get; set; }
        public string[] Codes { get; set; }
        public Dictionary<string, int> Meta { get; set; }
      }`;
    const json = JSON.parse(csharpToJsonExample(src));
    expect(json.Quantity).toBe(0);
    expect(json.Tags).toEqual(["string"]);
    expect(json.Codes).toEqual(["string"]);
    expect(json.Meta).toEqual({});
  });

  it("resuelve clases anidadas y enums", () => {
    const src = `
      public enum Status { Active, Inactive }
      public class Address {
        public string City { get; set; }
      }
      public class Customer {
        public string Name { get; set; }
        public Address HomeAddress { get; set; }
        public Status State { get; set; }
        public List<Address> PastAddresses { get; set; }
      }`;
    const json = JSON.parse(csharpToJsonExample(src, "Customer"));
    expect(json.Name).toBe("string");
    expect(json.HomeAddress).toEqual({ City: "string" });
    expect(json.State).toBe("Active");
    expect(json.PastAddresses).toEqual([{ City: "string" }]);
  });

  it("soporta records y propiedades init", () => {
    const src = `
      public record Point {
        public int X { get; init; }
        public int Y { get; init; }
      }`;
    const json = JSON.parse(csharpToJsonExample(src));
    expect(json).toEqual({ X: 0, Y: 0 });
  });

  it("evita recursión infinita en tipos auto-referenciados", () => {
    const src = `
      public class Node {
        public string Value { get; set; }
        public Node Next { get; set; }
      }`;
    const json = JSON.parse(csharpToJsonExample(src));
    expect(json.Value).toBe("string");
    expect(json.Next).toEqual({});
  });

  it("lanza error si no hay clases", () => {
    expect(() => csharpToJsonExample("int x = 5;")).toThrow();
  });

  it("parseCSharp detecta clases y propiedades", () => {
    const { classes, order } = parseCSharp(
      "public class A { public string N { get; set; } }",
    );
    expect(order).toContain("A");
    expect(classes.get("A")).toEqual([{ name: "N", type: "string" }]);
  });
});
