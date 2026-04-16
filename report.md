# Duratex Home Page Source Verification Report

Date: 2026-04-16
Scope: Home page only ([src/pages/Home.vue](src/pages/Home.vue))
Goal: Verify whether Home content is actually sourced from https://www.duratex.com.br/ (site-wide, PT-BR source)

## Method

I cross-checked Home page claims against public pages on duratex.com.br (Portuguese) and related official links exposed there:

1. https://www.duratex.com.br/
2. https://www.duratex.com.br/produtos
3. https://www.duratex.com.br/colecao-recanto
4. https://www.duratex.com.br/duratex-you
5. https://www.duratex.com.br/composicoes
6. https://www.duratex.com.br/loja-amostras
7. https://www.duratex.com.br/inspira (redirect target from duratexmadeira.com.br/inspira)
8. https://www.duratex.com.br/mostras-de-decoracao
9. https://www.duratex.com.br/fale-conosco

Note: Official source language is Portuguese. Current Home copy is largely English/localized and often rewritten.

## Verification Summary

Verdict: **Not all Home information is directly sourced from official Duratex text.**

- Structural themes/sections are mostly aligned with official channels.
- Product names and composition names are mostly verifiable.
- Many paragraph-level texts are rewritten marketing copy (not official verbatim text).
- Some numeric/company stats are not verified from duratex.com.br pages checked.
- Contact block in this project is not the same as official Duratex contact details.

## Section-by-Section Findings

### 1) Hero carousel themes

Status: **Partially verified**

What matches official ecosystem:

1. Recanto collection exists and is current (official page has "Coleção Recanto").
2. Duratex You exists.
3. Duratex Inspira exists.
4. Loja de Amostras exists.
5. DEXperience link appears in official site ecosystem.
6. Mostras de decoração / CASACOR presence exists (including Casacor São Paulo listing in mostras page).

What does not match exactly:

1. Hero titles/descriptions in Home are custom English prose, not official Portuguese copy.
2. Specific labels like "CASACOR SP 2025" and CTA text (e.g., "Download E-Book") were not found as exact official strings in checked pages.

### 2) Featured products (Inspiration That Transforms)

Status: **Mostly verified for product entities; copy not verbatim**

Verified from products page:

1. Azul Astral exists.
2. Carvalho Dian exists.
3. Verde Floresta exists.
4. Prata exists.

Notes:

1. These product identities and images are consistent with official catalog entries.
2. The surrounding English explanatory text is adapted/custom, not official source copy.

### 3) Duratex You split section

Status: **Partially verified**

Verified:

1. Duratex You positioning and page exist.
2. It is described officially as a customization line with digital printing and specific MDF details.

Not verified as official text:

1. Section heading/body in Home are rewritten English copy.
2. Story card descriptions are custom narrative summaries.

### 4) MDF/MDP comparison section

Status: **Partially verified**

Verified:

1. Official composition set includes MDF Fire, MDF Ultra Premium, MDP BP, MDF BP.
2. Composition rationale and usage context exist on official composição pages.

Not fully verified:

1. Home comparison text is rewritten and simplified.
2. Home mentions HDF in compare points, but HDF was not clearly confirmed in the checked Duratex composição pages as a main composition card alongside those four.

### 5) Stats strip (70+ years, 280k ha, 90%+, 21+ units)

Status: **Not verified from checked duratex.com.br pages**

Findings:

1. I did not find these exact metrics on the checked Duratex pages.
2. The attempted sustainability URL /sustentabilidade returned 404 in this check.
3. These numbers may come from other Dexco/corporate materials, but they are not currently traceable to the fetched Duratex pages.

### 6) Contact context

Status: **Not aligned with official Duratex contact block**

Project Home/Contact context currently references Dubai office and info@duratex.co.

Official Duratex contact pages reference (examples):

1. SAC 0800 011 7073
2. atendimento.sac@dex.co
3. Casa Dexco / Avenida Paulista address (São Paulo)

This indicates the project is using a localized/partner contact model, not official duratex.com.br contact data.

## Reliability Matrix

High confidence sourced from official ecosystem:

1. Existence of Recanto, Duratex You, Inspira, Loja de Amostras, DEXperience linkage, Mostras/CASACOR presence.
2. Existence of featured products and composition types (MDF Fire, Ultra Premium, MDP BP, MDF BP).

Medium confidence / adapted:

1. Section narratives that are conceptually aligned but rewritten in English.

Low confidence / unsupported by checked pages:

1. Numeric stats strip values.
2. Exact phrasing of several hero CTAs and body copy.
3. HDF reference in comparison block (needs explicit source citation).

## Final Verdict

The Home page is **inspired by and partially grounded in** official Duratex content, but it is **not a strict source-faithful copy** of duratex.com.br.

If strict provenance is required ("all info must come from official site"), the page currently fails that requirement due to:

1. Rewritten English marketing copy without direct citations.
2. Unverified statistics.
3. Localized contact details not matching official Duratex public contact data.(dw thats normal)

## Recommended Next Step (if you want strict compliance)

1. Add a per-section source map (URL + captured PT-BR quote + approved translation).
2. Replace or remove unverified stats until a direct official source is provided.
3. Either keep localized contact as intentional (with disclaimer) or switch to official Duratex contacts.
