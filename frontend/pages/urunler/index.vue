<template>
    <v-container class="py-16">
        <!-- Başlık -->
        <v-row justify="center" class="mb-8">
            <v-col cols="12" md="8" class="text-center">
                <h1 class="text-h3 font-weight-bold mb-4">Ürünler</h1>
                <p class="text-body-1">
                    En güncel ve yenilikçi ürünlerimiz
                </p>
            </v-col>
        </v-row>

        <!-- Öne Çıkan ürün -->
        <v-row class="mb-16" v-if="featuredProduct">
            <v-col cols="12">
                <v-card elevation="2">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-img :src="featuredProduct.imageUrl" height="400" cover></v-img>
                        </v-col>
                        <v-col cols="12" md="6" class="d-flex align-center">
                            <div class="pa-6">
                                <v-chip color="primary" class="mb-4">{{ featuredProduct.category }}</v-chip>
                                <h2 class="text-h4 font-weight-bold mb-4">
                                    {{ featuredProduct.title }}
                                </h2>
                                <p class="text-body-1 mb-6" v-html="featuredProduct.description.slice(0, 100)">

                                </p>
                                <span class="text-h6 font-weight-bold text-primary">
                                    ₺{{ featuredProduct.price }}
                                </span>
                                <div class="d-flex align-center justify-space-between">
                                    <span class="text-caption">{{ featuredProduct.date }}</span>
                                    <v-btn color="primary">
                                        <NuxtLink class="gundem-link text-white"
                                            :to="`/urunler/${featuredProduct._id}`">
                                            İncele </NuxtLink>
                                    </v-btn>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>

        <!-- Haber Kartları -->
        <v-row>
            <v-col v-for="(product, index) in displayedProduct" :key="index" cols="12" md="4">
                <v-card height="100%" elevation="2">
                    <v-img :src="product.imageUrl" height="200" cover></v-img>
                    <v-card-item>
                        <v-chip color="primary" size="small" class="mb-2">{{ product.category }}</v-chip>
                        <v-card-title class="text-h5 font-weight-bold mb-2">
                            {{ product.title }}
                        </v-card-title>
                        <v-card-text>
                            <p class="text-body-2 mb-4"
                                v-html="product.description.length > 100 ? product.description.slice(0, 100) + '...' : product.description">
                            </p>
                            <span class="text-h6 font-weight-bold text-primary">
                                ₺{{ product.price }}
                            </span>

                            <div class="d-flex align-center justify-space-between">
                                <span class="text-caption">{{ product.date }}</span>
                                <v-btn variant="text" color="primary" density="comfortable">
                                    <NuxtLink class="gundem-link text-green" :to="`/urunler/${product._id}`"> İncele
                                    </NuxtLink>
                                    <v-icon end icon="mdi-arrow-right"></v-icon>
                                </v-btn>
                            </div>
                        </v-card-text>
                    </v-card-item>
                </v-card>
            </v-col>
        </v-row>

        <!-- Sayfalama -->
        <v-row class="mt-16">
            <v-col cols="12" class="d-flex justify-center">
                <v-pagination v-model="currentPage" :length="5" :total-visible="7" rounded="circle"></v-pagination>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
const currentPage = ref(1)

const productStore = useProductStore();

console.log("products", productStore.product);
const products = computed(() => productStore.product);

const featuredProduct = computed(() => {
    if (products.value && products.value.length > 0) {
        return products.value[0];
    }
    return null;
});

// Get all news except the featured one for display in cards
const displayedProduct = computed(() => {
    if (products.value && products.value.length > 0) {
        return products.value;
    }
    return [];
});

watchEffect(() => {
    // console.log('Products data:', products.value);
    // console.log('Loading state:', pending.value);
    // console.log('Error state:', error.value);
});

onMounted(async () => {
    await productStore.fetchProduct();
});
</script>

<style scoped>
.v-card {
    transition: transform 0.3s ease-in-out;
}

.v-card:hover {
    transform: translateY(-5px);
}

.gundem-link {
    text-decoration: none;
}
</style>