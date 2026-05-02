export const knownKeys: Record<string, string> = {
  "Acquire-By-Hash": "acquireByHash",
  "Architecture-Variant": "architectureVariant",
  "Architecture": "architecture",
  "Architectures": "architectures",
  "Auto-Built-Package": "autoBuiltPackage",
  "Breaks": "breaks",
  "Bugs": "bugs",
  "Build-Essential": "buildEssential",
  "Build-Ids": "buildIds",
  "Built-Using": "builtUsing",
  "Changelogs": "changelogs",
  "Codename": "codename",
  "Components": "components",
  "Conflicts": "conflicts",
  "Date": "date",
  "Depends": "depends",
  "Description-md5": "descriptionMd5",
  "Description": "description",
  "Enhances": "enhances",
  "Essential": "essential",
  "Filename": "filename",
  "Ghc-Package": "ghcPackage",
  "Homepage": "homepage",
  "Installed-Size": "installedSize",
  "Label": "label",
  "Lua-Versions": "luaVersions",
  "Maintainer": "maintainer",
  "MD5sum": "md5sum",
  "MD5Sum": "md5Sum",
  "Multi-Arch": "multiArch",
  "No-Support-for-Architecture-all": "noSupportForArchitectureAll",
  "Origin": "origin",
  "Original-Maintainer": "originalMaintainer",
  "Package": "package",
  "Pre-Depends": "preDepends",
  "Priority": "priority",
  "Provides": "provides",
  "Recommends": "recommends",
  "Replaces": "replaces",
  "Ruby-Versions": "rubyVersions",
  "Section": "section",
  "SHA1": "sha1",
  "SHA256": "sha256",
  "SHA512": "sha512",
  "Size": "size",
  "Source": "source",
  "Static-Built-Using": "staticBuiltUsing",
  "Suggests": "suggests",
  "Suite": "suite",
  "Tag": "tag",
  "Task": "task",
  "Version": "version",
  "X-Cargo-Built-Using": "xCargoBuiltUsing",
}

export function toCamelCase(s: string): string {
  return s.split(/[-_]|(?<=[a-z])(?=[A-Z])|(?<=\d)(?=[A-Z])/)
    .filter(s => s.length > 0)
    .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join("")
}

export function toCamelCaseKnown(s: string): string {
  const known = knownKeys[s]
  if (known !== undefined) return known
  return toCamelCase(s)
}
