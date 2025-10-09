import { PokemonProvider } from "../../static/providers/pokemon.js";
import { mockFetch } from "./mockFetch.js";

describe("PokemonProvider", () => {
  beforeEach(() => jest.resetAllMocks());

  test("should validate existing Pokémon name", async () => {
    mockFetch({ id: 25, name: "pikachu" });
    const provider = new PokemonProvider();
    const isValid = await provider.validateName("pikachu");
    expect(isValid).toBe(true);
  });

  test("should return false for non-existent Pokémon", async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false }));
    const provider = new PokemonProvider();
    const isValid = await provider.validateName("missingmon");
    expect(isValid).toBe(false);
  });

  test("should build correct image URL", async () => {
    mockFetch({ id: 25 });
    const provider = new PokemonProvider();
    const url = await provider.getImageUrl("pikachu", { shiny: false });
    expect(url).toContain("home");
  });
});
