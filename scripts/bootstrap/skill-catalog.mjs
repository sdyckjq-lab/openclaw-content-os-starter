import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '../..');
const catalogPath = join(repoRoot, 'catalog', 'skills.json');

function normalizeSlug(value) {
  return String(value || '').trim().toLowerCase();
}

function loadSkillCatalog() {
  if (!existsSync(catalogPath)) {
    throw new Error(`Skill catalog not found: ${catalogPath}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(catalogPath, 'utf8'));
  } catch {
    throw new Error(`Skill catalog is not valid JSON: ${catalogPath}`);
  }

  const skills = Array.isArray(parsed?.skills)
    ? parsed.skills.map((skill) => ({
      slug: normalizeSlug(skill?.slug),
      label: String(skill?.label || ''),
      source: {
        type: String(skill?.source?.type || ''),
        path: String(skill?.source?.path || ''),
      },
      trust: String(skill?.trust || ''),
      installMode: String(skill?.installMode || ''),
      scenarios: Array.isArray(skill?.scenarios) ? skill.scenarios.map((item) => String(item).trim()).filter(Boolean) : [],
      roles: Array.isArray(skill?.roles) ? skill.roles.map((item) => String(item).trim()).filter(Boolean) : [],
    })).filter((skill) => skill.slug)
    : [];

  if (skills.length === 0) {
    throw new Error(`Skill catalog has no valid skills: ${catalogPath}`);
  }

  return {
    version: Number(parsed?.version || 1),
    skills,
  };
}

function buildSkillCatalogMap(catalog) {
  return new Map(catalog.skills.map((skill) => [skill.slug, skill]));
}

function collectPresetSkillIds(starterManifest) {
  const seen = new Set();
  const collected = [];

  for (const skill of starterManifest.sharedSkills || []) {
    const slug = normalizeSlug(skill);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    collected.push(slug);
  }

  for (const agent of starterManifest.agents || []) {
    for (const skill of agent.recommendedSkills || []) {
      const slug = normalizeSlug(skill);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      collected.push(slug);
    }
  }

  return collected;
}

function validatePresetSkillsAgainstCatalog(starterManifest, catalog) {
  const catalogMap = buildSkillCatalogMap(catalog);
  const missing = [];

  for (const skill of collectPresetSkillIds(starterManifest)) {
    if (!catalogMap.has(skill)) {
      missing.push(skill);
    }
  }

  return missing;
}

function getPresetCatalogSkills(starterManifest, catalog) {
  const catalogMap = buildSkillCatalogMap(catalog);
  return collectPresetSkillIds(starterManifest)
    .map((skill) => catalogMap.get(skill))
    .filter(Boolean);
}

export { collectPresetSkillIds, getPresetCatalogSkills, loadSkillCatalog, validatePresetSkillsAgainstCatalog };
