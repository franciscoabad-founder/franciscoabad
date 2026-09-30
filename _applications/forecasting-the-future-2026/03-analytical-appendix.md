# Analytical Appendix

**Entrant:** Francisco Abad (Quito, Ecuador)
**Component 3 of 3: Analytical Appendix.** For each forecast: current anchor, causal reasoning, base rate where available, and the tripwire that would move my probability.

My method throughout: start from an outside-view base rate, adjust with the strongest inside-view mechanism, and shade toward 50% only when evidence genuinely conflicts, never as a hedge. Sources anchoring the analysis: Yale Budget Lab and Penn Wharton tariff trackers (July 2026 readings), hyperscaler 10-K/10-Q filings and Q1 2026 guidance, Epoch AI compute tracking, IMF COFER, BLS CES and productivity series, OECD.AI policy observatory, and reporting on the January 2026 US semiconductor tariff and export-licensing changes.

---

## F1. US effective tariff rate ≥ 10% at end-2027. P = 0.80

**Anchor.** The average statutory rate is about 11.1% as of late July 2026 (Yale Budget Lab), with scheduled increases pointing to roughly 11.8% by year-end. The question is persistence, not arrival.

**Reasoning.** Three ratchets hold tariffs up. Fiscal: tariff revenue is now built into budget math and replacing it requires unpopular taxes. Political: protection has bipartisan constituencies; the 2024 to 2026 period showed no major party running on liberalization. Legal-institutional: measures have migrated from emergency authorities (Section 122) to more durable ones (Section 301), which raises the cost of reversal. The main downside scenario, a court striking down a major tariff tranche plus a recession pushing a president to cut consumer prices, is real but partial: even adverse rulings in 2025 to 2026 led to substitution into other authorities rather than removal.

**Base rate.** Post-1945, major US tariff regimes (Smoot-Hawley aside) decay slowly; the 2018 Section 301 China tariffs survived two administrations unchanged in substance.

**Tripwire.** A signed US-China or US-EU deal cutting rates below 8% average, or a Supreme Court ruling invalidating Section 301 as applied. Either would move me to 0.55.

## F2. Three or more G7 members with AI-specific trade measures by end-2028. P = 0.70

**Anchor.** The US already qualifies (chip export controls since 2022; the January 2026 25% tariff on advanced semiconductors; proposed model-weight controls). Japan and the Netherlands (EU) already mirror equipment controls; the EU AI Act creates the regulatory chassis for localization requirements.

**Reasoning.** Policy diffusion among allies is the strongest pattern in export-control history: US equipment controls were multilateralized to Japan and the Netherlands within 18 months. The EU's "technology sovereignty" agenda and Japan's economic-security law both have AI provisions in draft. Counting conservatively (measures must explicitly name AI), the US is in, Japan is near-certain, and any one of the UK, France, Germany (via EU instruments) or Canada completes the set in 30 months.

**Tripwire.** A transatlantic trade truce that explicitly carves out AI would slow this; I would drop to 0.55.

## F3. WTO Appellate Body still non-functional at end-2030. P = 0.85

**Anchor.** No quorum since December 2019; the US has blocked appointments under three consecutive administrations.

**Reasoning.** Restoration requires the US to affirmatively spend negotiating capital to rebuild a constraint on its own trade policy, precisely when tariffs are a revenue source and industrial policy is consensus. The MPIA workaround reduces pressure further by giving other members a partial substitute. Six-plus years of status quo is itself the strongest evidence: institutional paralysis with a veto player and no forcing event tends to persist.

**Base rate.** International bodies paralyzed by a great-power veto for over five years (UNSC reform, Conference on Disarmament) essentially never self-repair within a decade.

**Tripwire.** A US administration explicitly campaigning on WTO restoration and winning; I would move to 0.65.

## F4. Compute-for-resources state deal by end-2028. P = 0.70

**Anchor.** The pieces already exist separately: US-UAE and US-Saudi AI chip access agreements (2025 to 2026) conditioned on alignment commitments; Chinese minerals diplomacy; US critical-minerals agreements with multiple countries; rare-earth export controls used as leverage in 2025 negotiations.

**Reasoning.** Both blocs need what the other tier has. The US needs rare earths, lithium, cobalt and gallium; suppliers (Gulf, Indonesia, Chile, DRC, Kazakhstan) want compute access and technology transfer. When both sides' wish lists intersect this cleanly, explicit linkage is the natural contract form, and mercantilist governments prefer explicit linkage because it is enforceable and marketable domestically. The forecast requires documentation of the linkage in a single deal, which is the main uncertainty: governments sometimes keep linkage implicit across separate instruments.

**Tripwire.** If by mid-2027 all such bargains remain formally separate (chips deal here, minerals deal there), the "documented single deal" bar may not be met; I would drop toward 0.55.

## F5. Non-US G20 state equity in frontier AI or advanced chips by end-2029. P = 0.60

**Anchor.** The US took a roughly 10% Intel stake in 2025, breaking the taboo. Germany holds stakes in chipmakers via KfW precedents; France runs golden shares in strategic tech; China's state funds hold chip equity as a matter of course.

**Reasoning.** Strictly read, China already arguably resolves this YES (Big Fund stakes in SMIC). But I resolve conservatively against pre-existing arrangements and require a new stake or golden share taken after mid-2026 in a frontier AI or sub-7nm company. The mechanism: fiscal pressure makes subsidies-for-equity swaps attractive; the US precedent provides political cover; AI-lab national champions (Mistral in France, national labs in Japan, Korea, India, Saudi Arabia via PIF) are natural targets. PIF alone (a G20 sovereign's arm) taking a formal stake in an AI champion would resolve YES.

**Tripwire.** If no European or Asian government floats such a stake by end-2027, drop to 0.45.

## F6. China produces 1M+ 7nm-class AI accelerators in a year by end-2028. P = 0.60

**Anchor.** SMIC produces 7nm-class chips at scale despite EUV denial; Huawei Ascend output estimates for 2025 to 2026 range from several hundred thousand to near one million units, constrained mainly by advanced packaging and HBM supply.

**Reasoning.** The binding constraints (CoWoS-style packaging capacity, domestic HBM) are engineering-scaling problems, not invention problems, and China solves those reliably when prioritized: solar, batteries, shipbuilding, legacy chips. State demand guarantees the order book. Three years is enough for packaging capacity to double twice. Against this: DUV multi-patterning yields cap economics, equipment servicing restrictions bite over time, and estimate methodologies vary widely, which adds resolution risk on top of event risk.

**Tripwire.** Credible mid-2027 estimates below 600k units per year, or a tightening of equipment servicing that measurably cuts SMIC output; either moves me to 0.45.

## F7. Nvidia below 60% of AI accelerator revenue in some quarter by end-2029. P = 0.55

**Anchor.** Nvidia holds roughly 85 to 90% of merchant AI accelerator revenue in 2026. But the largest buyers are now also the largest builders: Google TPU, Amazon Trainium, Meta MTIA, Microsoft Maia, plus AMD's growing share and a walled-off Chinese market supplied by Huawei.

**Reasoning.** For the forecast to resolve YES, Nvidia must lose about 30 points of share in some quarter within 14 quarters. The mechanism is structural, not competitive failure: hyperscalers deliberately shift internal workloads to their own silicon (already a majority of Google's internal training), and the China market (10 to 15% of global demand) is being ceded to domestic suppliers by policy on both sides. If custom silicon reaches 25% and China 10%, Nvidia's ceiling is near 65% and one soft quarter tips it. Against: Nvidia's full-stack moat (CUDA, networking, systems) has beaten share-loss predictions for a decade, and revenue share lags unit share because of pricing power.

**Tripwire.** If custom-silicon share estimates stall below 15% through 2027, drop to 0.40.

## F8. TSMC below 60% of leading-edge (≤3nm-class) capacity by end-2031. P = 0.45

**Anchor.** TSMC holds roughly 90% of sub-5nm capacity today. Arizona fabs are TSMC-owned (they do not reduce TSMC share), so dilution must come from Samsung, Intel Foundry, and Rapidus.

**Reasoning.** This is a genuine coin-flip with asymmetric mechanisms. For YES: enormous subsidized non-TSMC buildouts (Intel 18A/14A with US state backing post-equity-stake, Samsung's Texas expansion, Japan's Rapidus 2nm plan), plus geopolitical customer pressure to dual-source. For NO: five years is short in fab time; Samsung yield problems are chronic; Intel Foundry's external customer base remains thin; and TSMC is expanding leading-edge capacity aggressively itself, which grows the denominator it dominates. Falling from 90% to below 60% requires competitors to more than triple their combined share. I lean slightly NO but the state-backed determination on three continents keeps this near the middle.

**Tripwire.** Intel landing two external flagship customers at 14A by 2028 moves me to 0.55; another Samsung yield failure at 2nm moves me to 0.35.

## F9. Gulf state hosts a top-10 AI cluster by end-2028. P = 0.75

**Anchor.** The UAE Stargate campus (announced 2025, 5GW ambition, first ~1GW phase targeted 2026 to 2027) and Saudi Arabia's Humain (multi-hundred-thousand GPU commitments with US vendors) are under construction with chip access agreements in place.

**Reasoning.** The Gulf has the three binding inputs in abundance: capital, energy, and now (post-2025 agreements) US chip allocations, plus the sovereign will to build monuments. The main risks are timeline slippage (data-center megaprojects slip 12 to 24 months routinely) and a US policy reversal on chip access. But the bar is top ten, not top three: even a partially completed first phase (100k+ class GPU cluster) likely qualifies given the current distribution of cluster sizes. Epoch's tracking already includes announced Gulf clusters at ranks that would qualify on completion.

**Tripwire.** A US export-policy reversal reimposing strict Gulf chip caps; I would drop to 0.5.

## F10. India in top-3 installed AI compute by end-2030. P = 0.20 (contrarian NO lean)

**Anchor.** India's IndiaAI Mission has procured on the order of tens of thousands of GPUs; top-tier private clusters (Reliance, Yotta) are in the tens of thousands of accelerators. The US and China each host millions of accelerator-equivalents; Tier 2 rivals (Japan, Saudi Arabia, UAE, EU members) are each investing at larger scale per capita.

**Reasoning.** For YES, India must out-build not one but every country except two among Japan, the Gulf states, the UK, Germany and France, from a base one to two orders of magnitude behind, while facing grid constraints (peak deficits persist), import dependence for every accelerator, and a fiscal state that spends on subsidies an order of magnitude below what the buildout requires. India's genuine strengths (talent, data, software) do not translate into installed compute by 2030. The 20% covers the real possibility of a Reliance-scale surprise: Jamnagar-style execution applied to gigawatt AI campuses with Gulf or US capital.

**Tripwire.** A confirmed 500MW+ AI campus breaking ground in India with committed chip supply before end-2027 would move me to 0.35.

## F11. Hyperscaler AI capex down-year before end-2029. P = 0.55

**Anchor.** 2026 combined guidance for Amazon, Microsoft, Alphabet, Meta and Oracle is roughly USD 660 to 725 billion, nearly double mid-2025 expectations, with roughly USD 450 billion AI-tied. Consensus models monotonic growth through 2030.

**Reasoning.** The outside view is decisive for me here: no capex supercycle in modern history (railroads, telecom fiber, shale, cloud 1.0) grew monotonically for eight-plus years; every one had at least one down year triggered by financing conditions, demand digestion or overbuild recognition. The inside view adds three specific stressors by 2029: depreciation from the 2024 to 2026 vintages hits earnings exactly as debt-financed buildouts (Oracle, Meta's SPV structures) meet refinancing; power interconnection queues push deliveries rightward (which mechanically can create a down accounting year); and model-efficiency gains keep reducing the compute needed per unit of capability. A down year is not an AI winter: shale's 2016 capex collapse preceded record output. Against: three of the five have fortress balance sheets and strategic reasons to spend through a demand air pocket, and sovereign co-investment (Gulf) can smooth the cycle. This is my highest-value contrarian forecast because consensus effectively prices this at 0.25 to 0.30.

**Tripwire.** If 2027 guidance comes in above 2026 actuals with inference demand visibly saturating new capacity, I hold at 0.55; if AI revenue (not budget reallocation) at the big five exceeds USD 300 billion annualized by 2027, drop to 0.40.

## F12. US data centers above 10% of US electricity by end-2030. P = 0.40

**Anchor.** LBNL and EIA estimates put data centers at roughly 4.5 to 5.5% of US electricity in 2025, from 1.9% in 2018. Doubling to 10% by 2030 requires roughly 15%+ annual growth in data-center consumption against roughly 1 to 2% total-load growth.

**Reasoning.** Announced pipelines (tens of GW) arithmetically support 10%. But announced is not interconnected: transformer lead times, transmission queues (four-plus years median), and local political resistance have already pushed projects to 2029 to 2031 delivery. Efficiency gains per token continue to compound, and F11's capex cycle, if it bites, bites exactly here. I put the central estimate at 8 to 9% by 2030: material, grid-straining, but short of the double-digit threshold. The 0.40 respects genuine upside from behind-the-meter gas and nuclear restarts accelerating faster than queues suggest.

**Tripwire.** EIA revising 2027 data-center share above 7% would move me to 0.55.

## F13. Chinese open-weights model #1 on leading leaderboard for 30+ days by end-2027. P = 0.35

**Anchor.** Chinese open-weights models (DeepSeek, Qwen, Kimi) have repeatedly reached top-5 and briefly topped specific categories since early 2025, but sustained overall #1 for a month has not happened; US closed labs retake the lead within days to weeks on each release cycle.

**Reasoning.** The gap to beat is not model quality parity (nearly achieved) but a structural asymmetry: US frontier labs release on faster cadence with larger training runs, and the leaderboard's top slot turns over with each frontier release. For a Chinese open model to hold #1 for 30 consecutive days, it must leapfrog and then no US lab ship for a month. That conjunction is unlikely in any given window but there are many windows in 18 months, and compute constraints on Chinese labs are partially offsetting the closing algorithmic gap. Note the framework point: this forecast measures prestige, not the prize; open-weights diffusion wins share regardless (F20).

**Tripwire.** A Chinese lab securing 100k+ class next-gen accelerator training capacity (domestic or offshore) would move me to 0.45.

## F14. US office/administrative support employment 5%+ below 2025 average by 2028. P = 0.55

**Anchor.** The BLS category (roughly 18 to 19 million jobs) has already declined roughly 1 to 1.5% per year since 2022 from digitization alone. AI agents targeting exactly these tasks (scheduling, data entry, document processing, basic customer service) reached commercial deployment at scale in 2025 to 2026.

**Reasoning.** The forecast needs the pre-existing 1 to 1.5% annual decline to accelerate to roughly 1.7% average, a modest acceleration given that this category is the bullseye of current AI capability. Corporate behavior visible in 2026 (hiring freezes in back-office functions, attrition-based reduction policies announced by major employers) suggests the acceleration is underway. Against: labor hoarding, unionized public-sector clerical staff, and the historical pattern that occupational categories decline slower than technologists expect. This resolves on annual averages, which smooths recession noise, but a recession would also accelerate it (downturns are when firms execute automation).

**Tripwire.** 2026 annual average declining less than 1.5% versus 2025 would move me to 0.45.

## F15. US productivity growth ≥ 2.5% over a rolling 3-year window by 2031. P = 0.40

**Anchor.** Nonfarm productivity growth averaged roughly 1.5% from 2010 to 2024, with 2023 to 2025 running near 2%. The last 3-year window above 2.5% ended in 2005 (IT diffusion), before that the late-1990s.

**Reasoning.** The Solow-paradox base rate is sobering: general-purpose technologies show up in productivity statistics 10 to 20 years after arrival (electricity, IT), because diffusion requires process redesign, not tool adoption. My Tier 3 operating experience generalizes: the constraint is organizational absorption. For YES by 2031, AI must beat the IT-diffusion timeline by roughly half. Arguments it might: adoption cost is near zero (software, not factories), the technology installs itself into existing workflows, and 2023 to 2025 already shows a measurable uptick. Arguments it will not: measurement lags, Baumol effects in services, and the possibility that early gains accrue as margin rather than measured output. 0.40 reflects a real but unproven acceleration.

**Tripwire.** Two consecutive years above 2.7% by 2028 would move me to 0.60.

## F16. 40+ countries with "sovereign AI" strategy language by end-2027. P = 0.75

**Anchor.** OECD.AI tracks 70+ national AI strategies; the "sovereign AI" framing (Nvidia's own commercial push, EU tech-sovereignty agenda, India's IndiaAI, Gulf programs, and a wave of 2025 to 2026 strategy refreshes) has become the default vocabulary of updated strategies.

**Reasoning.** This forecast rides two of the strongest currents in the dataset: policy-document mimicry (strategies copy the current vocabulary; "sovereign" is this cycle's word the way "ethics" was 2019's) and vendor push (chipmakers and hyperscalers actively sell "sovereign AI" packages to governments, giving ministries both the language and a procurement vehicle). Counting risk is the main uncertainty: the bar requires explicit sovereignty-of-AI-or-compute language in an official published strategy, and verification across 40 documents is laborious but objective.

**Tripwire.** If by mid-2027 fewer than 30 qualify, the linguistic fashion may have shifted; drop to 0.55.

## F17. BRICS-linked settlement system above USD 100B/year by end-2029. P = 0.35

**Anchor.** BRICS Pay remains largely conceptual; mBridge (the most technically advanced candidate) lost BIS sponsorship in 2024 and processes pilot volumes; bilateral local-currency settlement (rupee-dirham, yuan-real) grows but outside any single BRICS system.

**Reasoning.** The USD 100 billion bar is low relative to member trade (China-Brazil trade alone exceeds USD 180 billion) but high relative to institutional capacity demonstrated so far: BRICS has never built shared financial infrastructure at scale (the NDB, its flagship, lends single-digit billions annually after a decade). The real question is whether China decides to push CIPS-plus-mBridge under a BRICS label; the capability exists, the political decision does not yet. Sanctions escalation is the forcing function that could change that quickly.

**Tripwire.** A formal BRICS summit decision adopting a specific system with committed central-bank participation would move me to 0.55.

## F18. Dollar below 50% of allocated FX reserves by end-2032. P = 0.25

**Anchor.** COFER shows the dollar at roughly 57 to 58%, declining about 0.5pp per year over two decades, with the decline going mostly to small currencies and gold (which sits outside COFER FX shares), not the euro or yuan.

**Reasoning.** Linear extrapolation lands at roughly 54 to 55% by 2032; reaching below 50% requires trebling the trend for six years. What could treble it: weaponization fears post-2022 accelerating diversification, US fiscal trajectory, and tariff coercion pushing surplus countries away. What holds it: there is still no alternative with open capital markets and deep hedging (the yuan is capital-controlled by design and its reserve share has been flat for five years), and, as a citizen of a dollarized economy, I note the periphery's revealed preference remains dollar credibility. Gold accumulation is the actual diversification channel and it does not move this metric's denominator composition enough.

**Tripwire.** Two consecutive years of 1.5pp+ decline would move me to 0.40.

## F19. Formal US-China military-AI or frontier-safety bilateral by end-2030. P = 0.30

**Anchor.** The 2024 Biden-Xi statement on human control of nuclear launch was declaratory, not an instrument. Track-2 dialogues continue; official dialogue channels open and close with the broader relationship.

**Reasoning.** Base rate for US-China formal agreements in strategic domains during rivalry is low but not zero: they signed climate frameworks and military maritime protocols even during tension. An AI incident (military accident, model-enabled attack attributed to state negligence) is the classic forcing event, mirroring how the 1963 Hot Line followed the Cuban crisis. Five years gives meaningful exposure to such an event, and both sides have expressed narrow common interest in nuclear-adjacent AI limits. But mercantilist logic cuts against: AI advantage is currently treated as the prize of the whole competition, and verification of AI commitments is technically unsolved, which blocks treaty architecture. 0.30 = low structural probability plus event-driven tail.

**Tripwire.** A resumed formal bilateral AI dialogue with a named negotiating mandate would move me to 0.45.

## F20. LMIC public-sector AI system with 50M+ users by end-2029. P = 0.60

**Anchor.** India is lower-middle income and already operates digital public infrastructure at hundreds-of-millions scale (Aadhaar, UPI); AI layers on top are deploying now: Bhashini (translation across govt services), AI-assisted eSanjeevani telemedicine (100M+ consultations cumulative), Karmayogi civil-service platform. Nigeria, Indonesia, Pakistan, Kenya and Ethiopia all have national AI programs targeting service delivery.

**Reasoning.** The mechanism is the one I know from the inside: in Tier 3 states, government is the largest service provider, expertise is the scarcest input, and leapfrog deployments skip legacy-system fights that slow rich-world adoption. India alone gives multiple shots on goal, and the DPI playbook (build the rail, mandate usage, scale through public programs) has repeatedly produced 100M+ user systems in under four years. The resolution bar does real work here: the system must be genuinely AI-based, not digital ID with an AI press release, and user counts must be credible. That verification hurdle, plus the risk that India graduates to upper-middle income before resolution (which would disqualify its systems), is what keeps this at 0.60 rather than 0.75.

**Tripwire.** India's World Bank reclassification to upper-middle income before 2029 would force reliance on Nigeria/Pakistan/Ethiopia-class deployments and move me to 0.40.

---

## Calibration notes and cross-forecast structure

**Correlation disclosure.** These 20 forecasts are not independent; I flag the main clusters so the portfolio's calibration can be judged honestly. (1) F1, F2, F3, F5, F16 share the "mercantilism persists" driver; a grand liberalization reversal would flip them together, which I price at under 10%. (2) F6, F7, F8, F9, F10 share the compute-supply driver; a Taiwan conflict would violently resolve several at once (I have deliberately avoided a direct conflict forecast because it lacks clean resolution criteria, but its probability is embedded in F8's and F9's error bars). (3) F11, F12, F15 share the AI-cycle driver: if capex cracks (F11 YES), F12 likely resolves NO and F15's window narrows.

**Where I accept looking wrong.** F10 (India), F17 and F18 (de-dollarization) run against emotionally popular multipolarity narratives; F11 runs against the strongest financial consensus of 2026. I hold them because base rates and plumbing beat narratives on 3-to-8-year horizons. If the scoring pool clusters near consensus, these are the forecasts that differentiate this submission in either direction, and I accept that trade deliberately.

**Resolution integrity.** Every forecast names its data source and date. Where estimate-based (F6, F7, F8), I require agreement of two independent estimators to resolve YES, which biases my stated probabilities slightly downward relative to the underlying event probabilities; the stated numbers already incorporate that adjustment.
