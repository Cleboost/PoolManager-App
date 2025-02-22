<script setup lang="ts">
import { IonApp } from '@ionic/vue';
import { ref } from 'vue';
// import PoolCard from './components/PoolCard.vue';
// import PoolRadio from './components/PoolRadio.vue';

interface Plage {
  min: number,
  max: number,
  duration: number
  origine: number
}

interface Erreur {
  active: boolean,
  message: string
}

type Mode = "auto" | "manuel" | "off";

const informations = ref<{
  mode: Mode,
  temperatureAir: number,
  temperatureWater: number,
  hour: Date,
  errors: Erreur[]
}>({
  mode: "off",
  temperatureAir: 0,
  temperatureWater: 0,
  hour: new Date(),
  errors: [
    { active: true, message: "Horloge non synchronisée" },
    { active: false, message: "Capteur air OK" },
  ]
});

const settings = ref<Plage[]>([
  { min: 12, max: 15, duration: 7 , origine: 7},
  { min: 15, max: 18, duration: 7, origine: 9 },
  { min: 18, max: 21, duration: 7, origine: 11 },
  { min: 21, max: 24, duration: 7, origine: 13 },
  { min: 24, max: 27, duration: 7, origine: 15 },
  { min: 27, max: 30, duration: 7, origine:17 },
  { min: 33, max: 0, duration: 7, origine: 19}
])

setInterval(() => {
  // informations.value = {
  //   temperatureAir: +(Math.random() * 100).toFixed(2),
  //   temperatureWater: +(Math.random() * 100).toFixed(2),
  //   hour: new Date(),
  // };
  informations.value.hour = new Date();
}, 1000);

const increaseDuration = (index: number) => {
  const setting = settings.value[index];
  if (setting.duration < setting.origine + 2) {
    setting.duration += 1;
  }
}

const decreaseDuration = (index: number) => {
  const setting = settings.value[index];
  if (setting.duration > setting.origine - 2) {
    setting.duration -= 1;
  }
}
</script>

<template>
	<ion-app>
		<h1>👋 Bienvenue dans Pool Manager</h1>
		<div class="container">
			<h2>Informations</h2>
			<div class="statusLine">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" v-if="informations.mode === 'off'">
					<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.36 6.64A9 9 0 0 1 20.77 15M6.16 6.16a9 9 0 1 0 12.68 12.68M12 2v4M2 2l20 20" />
				</svg>
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" v-else-if="informations.mode === 'manuel'"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v10m6.4-5.4a9 9 0 1 1-12.77.04" /></svg>
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" v-else>
					<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
						<circle cx="12" cy="12" r="3" />
						<circle cx="19" cy="5" r="2" />
						<circle cx="5" cy="19" r="2" />
						<path d="M10.4 21.9a10 10 0 0 0 9.941-15.416M13.5 2.1a10 10 0 0 0-9.841 15.416" />
					</g>
				</svg>
				<span>Mode : {{ informations.mode[0].toUpperCase() + informations.mode.slice(1) }}</span>
			</div>

			<div class="statusLine">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
					<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9a4 4 0 0 0-2 7.5M12 3v2M6.6 18.4l-1.4 1.4M20 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0M4 13H2m4.34-5.66L4.93 5.93" />
				</svg>
				<span>Température de l'air : {{ informations.temperatureAir }}°C</span>
			</div>

			<div class="statusLine">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
					<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
						<path d="m10 20l-1.25-2.5L6 18m4-14L8.75 6.5L6 6m4.585 9H10m-8-3h6.5L10 9m10 5.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z" />
						<path d="m4 10l1.5 2L4 14m3 7l3-6l-1.5-3M7 3l3 6h2" />
					</g>
				</svg>
				<span>Température de l'eau : {{ informations.temperatureWater }}°C</span>
			</div>

			<div class="statusLine">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
					<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
						<circle cx="12" cy="12" r="10" />
						<path d="M12 6v6l4 2" />
					</g>
				</svg>
				<span>Heure : {{ informations.hour.toLocaleTimeString() }}</span>
			</div>
		</div>
		<div class="container">
			<h2>Selectionner mode</h2>
			<div class="radioGroup">
				<label>
					<input type="radio" v-model="informations.mode" value="auto" />
					Auto
				</label>
				<label>
					<input type="radio" v-model="informations.mode" value="manuel" />
					Manuel
				</label>
				<label>
					<input type="radio" v-model="informations.mode" value="off" />
					Off
				</label>
			</div>
		</div>
		<div class="container">
			<h2>Plages horaires</h2>
			<table>
				<thead>
					<tr>
						<th>Min</th>
						<th>Max</th>
						<th>Durée</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(setting, index) in settings" :key="index">
						<td>{{ setting.min }}°C</td>
						<td>{{ setting.max }}°C</td>
						<td>{{ setting.duration }}h</td>
						<td>
							<button class="btn-decrease" @click="decreaseDuration(index)">
								<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
									<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
										<circle cx="12" cy="12" r="10" />
										<path d="M8 12h8" />
									</g>
								</svg>
							</button>
							<button class="btn-increase" @click="increaseDuration(index)">
								<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
									<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
										<circle cx="12" cy="12" r="10" />
										<path d="M8 12h8m-4-4v8" />
									</g>
								</svg>
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="container">
			<h2>Informations & Errors</h2>
			<div v-for="(error, index) in informations.errors" :key="index" class="statusLine">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" v-if="error.active"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m8 2l1.88 1.88m4.24 0L16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6m0 0v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5m3 8H2m1 8c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4m-.8 4c2.1.1 3.8 1.9 3.8 4"/></g></svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" v-else><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12l2 2l4-4"/></g></svg>
				<span>{{ error.message }}</span>
			</div>
		</div>
	</ion-app>
</template>

<style>
* {
  --background: #275361;
  --container: #2d2d2d;
  --color: #fff;
}
.ion-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-y: auto;
}

.ion-page {
  justify-content: flex-start !important;
  background-color: var(--background);
  padding: 20px;
  gap: 20px;
  overflow-y: auto;
}

h1 {
  font-weight: 900 !important;
  font-family: "Sans Source Pro", sans-serif;
  text-align: center;
  background-color: var(--container);
  color: var(--color);
  padding: 20px;
  border-radius: 25px;
  /* position: sticky;
  top: 0;
  z-index: 1000; */
}

.container {
  padding: 20px;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  background-color: var(--container);
  color: var(--color);
  gap: 10px;
}

.container h2 {
  font-weight: 700 !important;
  font-family: "Sans Source Pro", sans-serif;
  text-align: center;
  margin: 0;
  padding: 0;
}

.statusLine {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700 !important;
}

.radioGroup {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.radioGroup input[type="radio"] {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #7C99B4;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  margin-right: 0.5em;
  transition: background-color 0.3s, border-color 0.3s;
}

.radioGroup input[type="radio"]:checked {
  border-color: #4A6FA5;
  background-color: #4A6FA5;
}

radioGroup input[type="radio"]:checked:after {
  content: "";
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  margin: 3px;
}

.radioGroup label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  font-family: "Sans Source Pro", sans-serif;
}

/* Re-adaptation du CSS du tableau pour éviter le débordement */
table {
  width: 100%;
  display: block;
  overflow-x: auto;
  border-collapse: collapse;
  background-color: #2d2d2d;
  color: #fff;
  border: 1px solid #555;
  border-radius: 5px;
  margin: 20px 0;
}

thead {
  background-color: #444;
}
thead th {
  padding: 15px;
  text-align: left;
}
tbody td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #555;
}
tbody tr:hover {
  background-color: #3a3a3a;
}

/* Afficher les boutons sur une seule ligne dans la cellule "Actions" du tableau */
tbody td:last-child {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

/* Nouveau CSS pour les boutons avec SVG */
.btn-decrease,
.btn-increase {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-decrease {
  background-color: #e74c3c;
}

.btn-decrease:hover {
  background-color: #c0392b;
}

.btn-increase {
  background-color: #27ae60;
}

.btn-increase:hover {
  background-color: #1e8449;
}

.btn-decrease svg,
.btn-increase svg {
  width: 24px;
  height: 24px;
  stroke: #fff;
}

button {
  border: none;
  background-color: #4A6FA5;
  color: #fff;
  padding: 8px 14px;
  margin: 0 4px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #3A5F95;
}
</style>
