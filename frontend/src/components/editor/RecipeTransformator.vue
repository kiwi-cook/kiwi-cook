<template>
    <ion-grid>
        <ion-row>
            <ion-col size="6">
                <!-- Flat Schema -->
                <ion-textarea :auto-grow="true" :value="flatRecipeSchema" readonly/>
            </ion-col>
            <ion-col size="6">
                <ion-textarea v-model="transformToSchema" :auto-grow="true" :color="schemaColor"/>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col size="3">
                <ion-button @click="updateRecipes()">
                    Update Recipes
                </ion-button>
            </ion-col>
            <ion-col size="3">
                <ion-button @click="saveRecipes()">
                    Save Recipes
                </ion-button>
            </ion-col>
        </ion-row>
        <template v-for="(transformedRecipe, index) in transformedRecipes" :key="index">
            <ion-row>
                <ion-col size="6">
                    <ion-textarea :auto-grow="true" :value="JSON.stringify(transformedRecipe, null, 4)" readonly/>
                </ion-col>
            </ion-row>
        </template>
    </ion-grid>
</template>

<script lang="ts">
import {useTasteBuddyStore} from '@/storage';
import {deepCopy} from '@/utility/util';
import {IonButton, IonCol, IonGrid, IonRow, IonTextarea} from '@ionic/vue';
import {computed, ComputedRef, defineComponent, Ref, ref, toRefs, watch} from 'vue';
import {sendToAPI} from "@/tastebuddy";
import {API_ROUTE} from "@/tastebuddy/constants";
import { logDebug } from '@/tastebuddy';

export default defineComponent({
    name: 'RecipeTransformator',
    props: {
        recipe: {
            type: Object,
            required: true
        }
    },
    components: {
        IonTextarea, IonGrid, IonRow, IonCol, IonButton
    },
    setup(props: any) {
        const {recipe} = toRefs(props);

        type FlatSchemaType = {
            [path: string]: string
        }

        /**
         * Generate a flat schema from a given object
         * @param data the data to generate the schema from
         * @param _parentPath the parent path
         */
        const generateFlatSchema = (data: any, _parentPath = ''): FlatSchemaType => {
            if (Array.isArray(data)) {
                // always use the first element to generate the schema
                return generateFlatSchema(data[0], _parentPath)
            }

            const schema: FlatSchemaType = data ? {
                [_parentPath]: _parentPath
            } : {}
            if (typeof data === 'object' && typeof data !== 'undefined') {
                Object.entries(data).forEach(([key, value]) => {
                    Object.assign(schema, generateFlatSchema(value, `${_parentPath}.${key}`))
                })
            }
            return schema
        }

        /**
         * Move a value from one path to another
         * @param root the root object
         * @param sourcePath the path to the value
         * @param targetPath the path to the new value
         */
        const moveValue = (root: any, sourcePath: string, targetPath: string): boolean => {
            // source
            const sourceKeys = sourcePath.split(".").slice(1)
            let sourceParent: any = root
            let sourceObject: any
            let sourceKey: string;
            // target
            const targetKeys = targetPath.split(".").slice(1)
            let targetParent = root;

            if (sourceKeys.length === 0) {
                return false
            }

            for (let i = 0; i < sourceKeys.length; i++) {
                sourceKey = sourceKeys[i]
                if (!Object.hasOwn(sourceParent, sourceKey)) {
                    return false
                }

                sourceObject = sourceParent[sourceKey];
                // check if sourceParent should be updated
                if (typeof sourceObject === 'object' && i + 1 < sourceKeys.length) {
                    sourceParent = sourceObject;
                }
            }

            // Find the target parent and key
            for (let i = 0; i < targetKeys.length - 1; i++) {
                const key = targetKeys[i];
                if (!Object.hasOwn(targetParent, key)) {
                    return false
                }
                targetParent = targetParent[key];
            }
            const targetKey = targetKeys[targetKeys.length - 1];

            // Remove the source object from its parent
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            delete sourceParent[sourceKey!]

            // Insert the source object into the target parent
            targetParent[targetKey] = sourceObject;

            return true
        };

        /**
         * Transforms the data to the given schema
         * @param data data that should be transformed
         * @param schema schema that should be used to transform the data
         */
        const transformDataToSchema = (data: any, schema: FlatSchemaType): any => {
            const schemaWithModifiedEntries: [string, string][] = Object.entries(schema)
                .filter(([key, value]) => key !== value)

            for (const element of schemaWithModifiedEntries) {
                const [fromPath, toPath] = element
                logDebug('transformDataToSchema', `move ${fromPath} to ${toPath}`)
            }
            return data
        }

        /**
         * https://www.geeksforgeeks.org/javascript-check-if-a-string-is-a-valid-json-string/
         * @param str string that should be checked
         */
        const isJSON = (str: string): boolean => {
            try {
                return (JSON.parse(str) && !!str);
            } catch (e) {
                return false;
            }
        }

        const recipeSchema = computed(() => JSON.stringify(generateFlatSchema(recipe.value), null, 4))
        const flatRecipeSchema = computed(() => JSON.stringify(Object.keys(JSON.parse(recipeSchema.value)), null, 4))
        const transformToSchema = ref(recipeSchema.value)
        watch(recipeSchema, (newSchema) => {
            transformToSchema.value = newSchema
        })

        const store = useTasteBuddyStore()
        const recipes: ComputedRef<any[]> = computed(() => store.getters.getRecipesAsList)
        const transformedRecipes: Ref = ref(recipes.value)
        watch(recipes, (newRecipes) => {
            transformedRecipes.value = newRecipes
        })
        // schemaColor indicates if the JSON is valid
        const schemaColor = ref('success')
        watch(transformToSchema, (newTransformationSchema) => {
            // check if transformationSchema is valid JSON
            const isValid = isJSON(newTransformationSchema)
            schemaColor.value = isValid ? 'success' : 'danger'
        }, {immediate: true})

        /**
         * Update the transformed recipes in the store
         */
        const updateRecipes = () => {
            const isValid = isJSON(transformToSchema.value)
            if (isValid) {
                transformedRecipes.value = recipes.value.map((recipe: any) => transformDataToSchema(recipe, JSON.parse(transformToSchema.value) as FlatSchemaType))
            }
        }

        /**
         * Save the recipes to the Backend API
         */
        const saveRecipes = () => {
            updateRecipes()
            transformedRecipes.value.filter((recipe: any) => typeof recipe._tmpId === 'undefined').forEach((recipe: any) =>
                sendToAPI(API_ROUTE.ADD_RECIPE, {body: recipe})
            )
        }

        return {
            flatRecipeSchema, transformToSchema, schemaColor,
            transformedRecipes, updateRecipes, saveRecipes
        }
    }
})
</script>