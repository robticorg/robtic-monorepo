import { describe, expect, it } from "bun:test";
import { checkPrefix, parsePrefixCommand } from "../src/lib/prefix";

describe("prefix", () => {
    it("accepts short prefixes without spaces", () => {
        expect(checkPrefix(" ? ")).toEqual({ ok: true, prefix: "?" });
        expect(checkPrefix("t!")).toEqual({ ok: true, prefix: "t!" });
        expect(checkPrefix("")).toEqual({ ok: false, reason: "empty" });
        expect(checkPrefix("a b")).toEqual({ ok: false, reason: "space" });
        expect(checkPrefix("toolong")).toEqual({ ok: false, reason: "long" });
    });
    it("reads the typed command in English and Arabic", () => {
        expect(parsePrefixCommand("!prefix ?", "!")).toEqual({ rest: "?" });
        expect(parsePrefixCommand("!بادئة $", "!")).toEqual({ rest: "$" });
        expect(parsePrefixCommand("!prefix", "!")).toEqual({ rest: "" });
        expect(parsePrefixCommand("!close", "!")).toBeNull();
        expect(parsePrefixCommand("?prefix x", "!")).toBeNull();
    });
});
