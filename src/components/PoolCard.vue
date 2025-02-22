<script>
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/vue'
export default {
    name: 'PoolCard',
    components: {
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent
    },
    props: {
        title: {
            type: String,
        }
    }
}
</script>

<template>
	<ion-card>
		<ion-card-header v-if="title">
			<ion-card-title >{{ title }}</ion-card-title>
		</ion-card-header>
		<ion-card-content>
			<div class="container">
				<slot></slot>
			</div>
		</ion-card-content>
	</ion-card>
</template>

<style scoped>
ion-card-title {
    text-align: center;
}

.container {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    width: fit-content;
}
</style>
