<template>

    <ion-header>
        <ion-toolbar>
            <ion-title>Fridge</ion-title>
        </ion-toolbar>
        <ion-toolbar>
            <ion-searchbar :debounce="100" @ion-change="handleChange($event)"></ion-searchbar>
        </ion-toolbar>
        <div id="FilterButton">
            <IonToolbar>
                <IonButton color='success'>Filter</IonButton>
            </IonToolbar>
        </div>
    </ion-header>

    <ion-list>
        <ion-item v-for="entry in results" v-bind:key="entry.val">
            <ion-label>{{ entry.val }}</ion-label>
            <ion-checkbox slot="end" @update:modelValue="entry.isChecked = $event" :modelValue="entry?.isChecked">
            </ion-checkbox>
        </ion-item>
    </ion-list>
</template>

<script lang="ts">
import { IonCheckbox, IonButton, IonLabel, IonHeader, IonSearchbar, IonTitle, IonToolbar, IonItem, IonList } from '@ionic/vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
    components: { IonCheckbox, IonHeader, IonLabel, IonSearchbar, IonTitle, IonToolbar, IonButton, IonItem, IonList },
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
#FilterButton {
    text-align: start;
    padding: auto;
    margin: auto;
    margin-left: 2%;
    color: white;
    object-fit: fill;
    width: 100%;
    height: 100%;
}

#SearchButton {
    text-align: end;
    padding: auto;
    margin: auto;
    color: white;
    object-fit: fill;
    width: 100%;
    height: 100%;
}
</style>