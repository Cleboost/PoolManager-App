<script>
import { IonRadio } from "@ionic/vue";
export default {
    name: 'PoolRadio',
    components: {
        IonRadio,
    },
    props: {
        value: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
    },
}
</script>

<template>
	<div class="radioContainer">
		<ion-radio :value="value"></ion-radio>
		<p>{{ text }}</p>
	</div>
</template>

<style>
.radioContainer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
}

.radioContainer ion-radio {
    display: flex;
    align-items: center;
}

.radioContainer p {
    margin: 0;
    display: flex;
    align-items: center;
}
</style>