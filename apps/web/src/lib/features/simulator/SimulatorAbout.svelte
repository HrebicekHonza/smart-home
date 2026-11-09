<script lang="ts">
	let { open = false }: { open?: boolean } = $props();
</script>

<details {open} class="group mb-5 rounded-xl bg-surface p-[18px] md:p-5">
	<summary
		class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-heading [&::-webkit-details-marker]:hidden"
	>
		K čemu stránka slouží
		<span aria-hidden="true" class="text-text-secondary transition-transform group-open:rotate-180"
			>▾</span
		>
	</summary>

	<div class="mt-3 grid max-w-[80ch] gap-3 text-label font-normal text-text-secondary">
		<p>
			Simulátor ukazuje, jak by se během jednoho dne měnila teplota v konkrétní místnosti při
			různých způsobech regulace vytápění. Modelovanou místností je pracovna 3,05 × 4,05 m s
			francouzským oknem a deskovým radiátorem napojeným na teplovodní soustavu s kotlem na uhlí.
			Stránka vznikla jako praktická část semestrální práce z předmětu KKY/AKS (Aplikace kybernetiky
			ve strojírenství, ZČU) „Návrh a simulace inteligentního systému řízení vytápění chytré
			domácnosti“.
		</p>
		<p>Porovnávají se čtyři regulátory:</p>
		<ul class="grid list-disc gap-1 pl-5">
			<li>
				<strong class="text-text-primary">Termostatická hlavice</strong> – dnešní stav, chová se jako
				P regulátor a nechává trvalou odchylku pod žádanou teplotou.
			</li>
			<li>
				<strong class="text-text-primary">Termostat s hysterezí</strong> – dvoupolohová regulace, radiátor
				buď topí naplno, nebo vůbec.
			</li>
			<li>
				<strong class="text-text-primary">PI regulátor s anti-windupem</strong> – nastavený Zieglerovou–Nicholsovou
				metodou z přechodové charakteristiky; drží teplotu přesně.
			</li>
			<li>
				<strong class="text-text-primary">PI regulátor bez anti-windupu</strong> – pro srovnání ukazuje,
				jak velký překmit vznikne po ranním zátopu bez této ochrany.
			</li>
		</ul>
		<p>
			Model je tepelná bilance místnosti: jedna tepelná kapacita, tepelný odpor obálky, otevřené
			okno jako další tepelná ztráta a radiátor se setrvačností. Řeší se Eulerovou metodou s krokem
			30 s. Výchozí nastavení odpovídá běžnému zimnímu dni ze semestrální práce (venku −6 až +2 °C,
			přes den 21 °C, v noci útlum na 18 °C, ráno 10 minut otevřené okno) a tabulka ukazatelů dává
			stejné hodnoty jako práce.
		</p>
		<p>
			Parametry v panelech Místnost, Regulátory a Scénář lze měnit a grafy se hned přepočítají;
			najetím na graf se zobrazí hodnoty v daném čase, odkaz <em>Pracovna</em> vrátí výchozí hodnoty.
			Jde o výstup matematického modelu, ne o měření – stránka neovládá žádné zařízení a nic neukládá.
		</p>
	</div>
</details>
