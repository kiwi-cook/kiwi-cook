<template>
    <IonPage>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title color="light">Fridge</ion-title>
            </ion-toolbar>
            <ion-toolbar color="primary">
                <ion-searchbar color="secondary" :debounce="100" @ion-change="handleChange($event)"></ion-searchbar>
            </ion-toolbar>

        </ion-header>
        <ion-list>
            <ion-item v-for="result in results" v-bind:key="result.val">
                <ion-label color="light">{{ result.val }}</ion-label>
                <ion-checkbox slot="end" color="light" @update:modelValue="result.isChecked = $event" :modelValue="result?.isChecked">
                </ion-checkbox>
            </ion-item>
        </ion-list>
        <div class="SearchButton" >
                <IonButton color="primary">Search</IonButton>
        </div>
    </IonPage>
</template>

<script lang="ts">
import { IonPage, IonCheckbox, IonButton, IonLabel, IonHeader, IonSearchbar, IonTitle, IonToolbar, IonItem, IonList } from '@ionic/vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
    components: { IonPage, IonCheckbox, IonHeader, IonLabel, IonSearchbar, IonTitle, IonToolbar, IonButton, IonItem, IonList },
    setup() {

        const dataIngredients = [{ val: 'Mais', isChecked: false }, { val: 'Tomate', isChecked: false }, { val: 'Gurke', isChecked: false }, { val: 'Zwiebel', isChecked: false }, { val: 'Knoblauch', isChecked: false }, { val: 'Rotkohl', isChecked: false }, { val: 'Kidney Bohnen', isChecked: false }, { val: 'Paprika', isChecked: false }];
        const results = ref(dataIngredients);

        const handleChange = (event: any) => {
            const query = event.target.value.toLowerCase();
            results.value = dataIngredients.filter(d => d.val.toLowerCase().indexOf(query) > -1);
        }

        return { results, handleChange };
    },
});
</script>
<style scoped>
.SearchButton {
    text-align: end;
    margin-right: 95%;
    color: white;
    object-fit: fill;
    width: 100%;
    height: 100%;
}
</style>