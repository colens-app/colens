import { getChecksumRegex, transformChecksumString } from "@/util/deb/checksums"
import { describe, expect, test } from "vitest"

describe("getChecksumRegex", () => {
  test("matches a single valid line", () => {
    expect(getChecksumRegex(64).test("a".repeat(64) + " 1234 main/binary-amd64/Packages")).toBe(true)
  })

  test("matches multiple valid lines", () => {
    const line = "a".repeat(64) + " 1234 main/binary-amd64/Packages"
    expect(getChecksumRegex(64).test(`${line}\n${line}`)).toBe(true)
  })

  test("rejects wrong checksum length", () => {
    expect(getChecksumRegex(64).test("a".repeat(63) + " 1234 main/binary-amd64/Packages")).toBe(false)
  })

  test("rejects non-hex checksum", () => {
    expect(getChecksumRegex(64).test("z".repeat(64) + " 1234 main/binary-amd64/Packages")).toBe(false)
  })

  test("rejects missing size", () => {
    expect(getChecksumRegex(64).test("a".repeat(64) + " main/binary-amd64/Packages")).toBe(false)
  })

  test("rejects malformed second line", () => {
    const validLine = "a".repeat(64) + " 1234 main/binary-amd64/Packages"
    expect(getChecksumRegex(64).test(`${validLine}\nnot-valid`)).toBe(false)
  })

  test("rejects empty string", () => {
    expect(getChecksumRegex(64).test("")).toBe(false)
  })

  test("real data test", () => {
    expect(getChecksumRegex(64).test(`ccd562bdea7c64c12e2e61d5d48d915a51edb775b12ac5ffdc15609c546ae2e6           220160 universe/dep11/icons-128x128@2.tar
77a7a0c23f0491d555135dcb3bb5589d4b18a4319e4d3ed91711d3eb88ad44ab           163778 universe/dep11/icons-128x128@2.tar.gz
bad3ef48af32a456f320e66014dac376f99610294866769dd02a0ab4a45d42f9          5085184 universe/dep11/icons-48x48.tar
2514b8a0dbdc91b66601a7b445c97943203186021201b91f644739c5d0e3bbc0          3632853 universe/dep11/icons-48x48.tar.gz
bcc02839433612b0faa816c0d29248e1dd7ee2b9a2568143779c91626353c1d5           114688 universe/dep11/icons-48x48@2.tar
6d90cf389419a4945364fec055bbaccc770305ec715cba82eb6919cebcc0f93b            85724 universe/dep11/icons-48x48@2.tar.gz
db88a07904606da838b2b3de40262c77756104048291ca1383f38beafec1648b          9663488 universe/dep11/icons-64x64.tar
0d264b872def8845b1b073ad785303f52dd6ea392a8951e27fe634f37e85ca42          7482572 universe/dep11/icons-64x64.tar.gz
f2ed6957f27a50a76229510bba299bcaf8184998e4e422f6f759f7b00eb9e51c           159232 universe/dep11/icons-64x64@2.tar
6769162217addb05ee056974bd5217c7e7365d7c03ae7d5088d45d03a3c64e9e           121552 universe/dep11/icons-64x64@2.tar.gz
7ffff5e6ddb9202cc0d5f866775d2514d3ee09f46962766d1f4bfb1f2bbd8f6c         33408698 universe/i18n/Translation-en
a27513d312c08ad071bf7fa93165af909167303d98b32efe5c30fa66ef27a4eb          8890863 universe/i18n/Translation-en.gz
19386938c3f8f396c354bd64536ccda92671cbe88002e5a929b99e713eef082a          6329480 universe/i18n/Translation-en.xz
94734234147165ef28dfa87f73384b1bd0d221b2cfb9552316e05e17b0dfb79d              103 universe/source/Release
e324d966b70cedc32d7c308b96574d2205f15822c25b4e93d2f7607c22bcf6a7         66145096 universe/source/Sources
9d246335cf6ccdd33177a4832bd91d8c346624094e5764a4e43dee54375900f5         16779065 universe/source/Sources.gz
9c732321580ae2824f7d8cb936e12cca435a60a252d0654b8cc2a0011dc82903         13374880 universe/source/Sources.xz`)).toBe(true)
  })
})

describe("transformChecksumString", () => {
  test("parses a single line", () => {
    expect(transformChecksumString("a".repeat(64) + " 1234 main/binary-amd64/Packages")).toEqual([
      { checksum: "a".repeat(64), size: 1234, path: "main/binary-amd64/Packages" },
    ])
  })

  test("parses multiple lines", () => {
    const input = [
      "a".repeat(64) + " 1234 main/binary-amd64/Packages",
      "b".repeat(64) + " 5678 main/binary-amd64/Packages.gz",
    ].join("\n")
    expect(transformChecksumString(input)).toEqual([
      { checksum: "a".repeat(64), size: 1234, path: "main/binary-amd64/Packages" },
      { checksum: "b".repeat(64), size: 5678, path: "main/binary-amd64/Packages.gz" },
    ])
  })

  test("parses size as integer", () => {
    const result = transformChecksumString("a".repeat(64) + " 42 some/file")
    expect(result[0].size).toBe(42)
    expect(typeof result[0].size).toBe("number")
  })
})
