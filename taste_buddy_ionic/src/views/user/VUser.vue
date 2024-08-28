<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <IonPage>
        <IonContent>
            <div class="user-wrapper">
                <Header :big-text="[$t('User.Title')]" class="ion-margin-bottom"/>

                <IonCard>
                    <IonCardContent>
                        <IonList class="ion-no-padding" lines="full">
                            <IonItem>
                                <IonLabel>{{ $t("User.Name") }}</IonLabel>
                                <IonInput v-model="name" placeholder="Name"/>
                            </IonItem>

                            <IonItem>
                                <IonLabel>{{ $t("User.Email") }}</IonLabel>
                                <IonInput v-model="email" placeholder="Email"/>
                            </IonItem>

                            <IonItem>
                                <IonLabel>{{ $t("User.Password") }}</IonLabel>
                                <IonInput v-model="password" placeholder="Password"/>
                            </IonItem>

                            <IonItem>
                                <IonLabel>{{ $t("User.PasswordRepeat") }}</IonLabel>
                                <IonInput v-model="passwordRepeat" placeholder="Password"/>
                            </IonItem>

                            <IonItem>
                                <IonLabel>{{ $t("User.Birthday") }}</IonLabel>
                                <IonDatetime v-model="birthday" display-format="DD.MM.YYYY"
                                             placeholder="Birthday"/>
                            </IonItem>
                        </IonList>
                    </IonCardContent>
                </IonCard>

                <IonButton expand="block" @click="saveUser">{{ $t("User.Save") }}</IonButton>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonDatetime,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonPage
} from '@ionic/vue';
import { useUserStore } from '@/app/storage';
import { Header } from '@/app/components';
import { useLanguage } from '@/composables/useLanguage.ts';
import { ref } from 'vue';

const userStore = useUserStore();
const { user } = userStore;

const name = ref(user.name);
const email = ref(user.email);
const password = ref('');
const passwordRepeat = ref('');
const birthday = ref(user.birthday);

const saveUser = () => {
    userStore.updateUser({
        name: name.value,
        email: email.value,
        password: password.value,
        birthday: birthday.value
    });
};

const language = useLanguage();
</script>
