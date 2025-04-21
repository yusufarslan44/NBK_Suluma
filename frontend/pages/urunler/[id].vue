<template>
    <v-container class="py-16">
        <!-- Breadcrumb Navigasyonu -->
        <v-row justify="center" class="mb-6">
            <v-col cols="12" md="10">
                <v-breadcrumbs :items="breadcrumbs" class="pa-0">
                    <template v-slot:divider>
                        <v-icon size="small">mdi-chevron-right</v-icon>
                    </template>
                </v-breadcrumbs>
            </v-col>
        </v-row>

        <!-- Ürün Başlığı ve Bilgiler -->
        <v-row justify="center" class="mb-8">
            <v-col cols="12" md="10">
                <v-row>
                    <!-- Sol Taraf - Ana Görsel ve Galeri -->
                    <v-col cols="12" md="6">
                        <v-card class="mb-4" variant="flat">
                            <v-img 
                                :src="product.imageUrl || '/api/placeholder/600/600'" 
                                height="450" 
                                cover 
                                class="rounded product-main-image"
                                @click="openGallery = true"
                            ></v-img>
                        </v-card>
                        
                        <!-- Küçük Görsel Galerisi -->
                        <v-row class="d-flex">
                            <v-col v-for="(img, index) in productImages" :key="index" cols="3" class="pa-1">
                                <v-img 
                                    :src="img" 
                                    height="90" 
                                    cover 
                                    class="rounded cursor-pointer product-thumbnail"
                                    @click="selectMainImage(img)"
                                ></v-img>
                            </v-col>
                        </v-row>
                    </v-col>

                    <!-- Sağ Taraf - Ürün Bilgileri -->
                    <v-col cols="12" md="6">
                        <v-chip color="primary" class="mb-4">{{ product.category }}</v-chip>
                        <h1 class="text-h3 font-weight-bold mb-4">{{ product.title }}</h1>
                        
                        <!-- Fiyat ve Stok Bilgisi -->
                        <div class="d-flex align-center mb-6">
                            <h2 class="text-h4 font-weight-bold text-primary mr-4">{{ formatPrice(product.price) }}</h2>
                            <v-chip :color="product.inStock ? 'success' : 'error'" small>
                                {{ product.inStock ? 'Stokta' : 'Tükendi' }}
                            </v-chip>
                        </div>
                        
                        <!-- Puan ve Değerlendirme -->
                        <div class="d-flex align-center mb-6">
                            <v-rating
                                :model-value="product.rating || 4.5"
                                color="amber"
                                density="compact"
                                size="small"
                                readonly
                                half-increments
                            ></v-rating>
                            <span class="ml-2 text-body-2">({{ product.reviewCount || 24 }} değerlendirme)</span>
                        </div>

                        <!-- Kısa Açıklama -->
                        <p class="text-body-1 mb-6">{{ product.shortDescription || 'Bu ürün açıklaması yakında eklenecektir.' }}</p>
                        
                        <!-- Varyantlar -->
                        <div class="mb-6">
                            <h3 class="text-subtitle-1 font-weight-bold mb-2">Renk Seçimi</h3>
                            <div class="d-flex">
                                <v-chip-group v-model="selectedColor" mandatory>
                                    <v-chip 
                                        v-for="(color, i) in productColors" 
                                        :key="i"
                                        filter
                                        :color="color.value"
                                        class="mr-2"
                                    >
                                        {{ color.name }}
                                    </v-chip>
                                </v-chip-group>
                            </div>
                        </div>

                        <div class="mb-6">
                            <h3 class="text-subtitle-1 font-weight-bold mb-2">Beden</h3>
                            <div class="d-flex">
                                <v-chip-group v-model="selectedSize" mandatory>
                                    <v-chip 
                                        v-for="(size, i) in productSizes" 
                                        :key="i"
                                        filter
                                        class="mr-2"
                                    >
                                        {{ size }}
                                    </v-chip>
                                </v-chip-group>
                            </div>
                        </div>
                        
                        <!-- Miktar Seçimi ve Sepete Ekle -->
                        <div class="d-flex align-center mb-6">
                            <v-text-field
                                v-model="quantity"
                                label="Adet"
                                type="number"
                                min="1"
                                max="10"
                                density="compact"
                                hide-details
                                class="quantity-selector mr-4"
                                style="max-width: 100px"
                            ></v-text-field>
                            
                            <v-btn 
                                color="primary" 
                                size="large" 
                                block 
                                :disabled="!product.inStock"
                                prepend-icon="mdi-cart"
                                @click="addToCart"
                            >
                                Sepete Ekle
                            </v-btn>
                        </div>
                        
                        <!-- Hızlı İşlemler -->
                        <div class="d-flex">
                            <v-btn variant="text" prepend-icon="mdi-heart" class="mr-2">
                                Favorilere Ekle
                            </v-btn>
                            <v-btn variant="text" prepend-icon="mdi-share-variant">
                                Paylaş
                            </v-btn>
                        </div>
                        
                        <!-- Teslimat ve Güvence Bilgileri -->
                        <v-card class="mt-6 bg-grey-lighten-5" variant="flat">
                            <v-card-text>
                                <div class="d-flex align-center mb-2">
                                    <v-icon color="success" class="mr-2">mdi-truck-delivery</v-icon>
                                    <span>Hızlı Teslimat</span>
                                </div>
                                <div class="d-flex align-center mb-2">
                                    <v-icon color="success" class="mr-2">mdi-rotate-right</v-icon>
                                    <span>14 Gün İçinde İade Garantisi</span>
                                </div>
                                <div class="d-flex align-center">
                                    <v-icon color="success" class="mr-2">mdi-security</v-icon>
                                    <span>Güvenli Alışveriş</span>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <!-- Ürün Detayları Sekmeleri -->
        <v-row justify="center" class="mb-16">
            <v-col cols="12" md="10">
                <v-card>
                    <v-tabs v-model="activeTab" color="primary" align-tabs="center">
                        <v-tab value="description">Ürün Açıklaması</v-tab>
                        <v-tab value="specs">Teknik Özellikler</v-tab>
                        <v-tab value="reviews">Değerlendirmeler</v-tab>
                    </v-tabs>
                    
                    <v-window v-model="activeTab">
                        <!-- Ürün Açıklaması Tab -->
                        <v-window-item value="description">
                            <v-card-text>
                                <div class="text-body-1 product-icerik py-4" v-html="product.description"></div>
                                
                                <!-- Etiketler -->
                                <v-sheet class="mt-10 pa-4 rounded bg-grey-lighten-4">
                                    <div class="d-flex flex-wrap align-center">
                                        <span class="font-weight-medium mr-2">Etiketler:</span>
                                        <v-chip 
                                            v-for="(tag, i) in product.tags" 
                                            :key="i" 
                                            class="ma-1" 
                                            variant="outlined"
                                            color="primary" 
                                            size="small"
                                        >
                                            {{ tag }}
                                        </v-chip>
                                    </div>
                                </v-sheet>
                            </v-card-text>
                        </v-window-item>
                        
                        <!-- Teknik Özellikler Tab -->
                        <v-window-item value="specs">
                            <v-card-text>
                                <v-table>
                                    <tbody>
                                        <tr v-for="(value, key) in productSpecs" :key="key">
                                            <td class="font-weight-medium" style="width: 30%">{{ key }}</td>
                                            <td>{{ value }}</td>
                                        </tr>
                                    </tbody>
                                </v-table>
                            </v-card-text>
                        </v-window-item>
                        
                        <!-- Değerlendirmeler Tab -->
                        <v-window-item value="reviews">
                            <v-card-text>
                                <!-- Değerlendirme Özeti -->
                                <v-row class="mb-6">
                                    <v-col cols="12" md="4">
                                        <div class="text-center">
                                            <div class="text-h2 font-weight-bold">{{ product.rating || 4.5 }}</div>
                                            <v-rating
                                                :model-value="product.rating || 4.5"
                                                color="amber"
                                                readonly
                                                half-increments
                                            ></v-rating>
                                            <div class="mt-2">{{ product.reviewCount || 24 }} değerlendirme</div>
                                        </div>
                                    </v-col>
                                    <v-col cols="12" md="8">
                                        <div v-for="i in 5" :key="i" class="d-flex align-center mb-2">
                                            <div style="width: 50px">{{ 6-i }} yıldız</div>
                                            <v-progress-linear
                                                :model-value="getRatingPercentage(6-i)"
                                                color="amber"
                                                height="10"
                                                class="mx-4"
                                                rounded
                                            ></v-progress-linear>
                                            <div style="width: 50px">{{ getRatingCount(6-i) }}</div>
                                        </div>
                                    </v-col>
                                </v-row>

                                <!-- Yorum Formu -->
                                <v-divider class="mb-6"></v-divider>
                                
                                <h3 class="text-h6 font-weight-bold mb-4">Değerlendirme Yap</h3>
                                <v-card class="mb-8 pa-4" variant="outlined">
                                    <div class="mb-4">
                                        <label class="text-subtitle-2 mb-1 d-block">Puanınız</label>
                                        <v-rating v-model="newReviewRating" color="amber"></v-rating>
                                    </div>
                                    <v-text-field v-model="newReviewTitle" label="Başlık" variant="outlined" class="mb-2"></v-text-field>
                                    <v-textarea v-model="newReviewText" label="Yorumunuzu yazın..." rows="4" variant="outlined"></v-textarea>
                                    <div class="d-flex justify-end mt-4">
                                        <v-btn color="primary">
                                            Değerlendirme Gönder
                                        </v-btn>
                                    </div>
                                </v-card>
                                
                                <!-- Yorumlar Listesi -->
                                <h3 class="text-h6 font-weight-bold mb-4">Değerlendirmeler</h3>
                                <v-card v-for="(review, i) in productReviews" :key="i" class="mb-4 pa-4" variant="outlined">
                                    <div class="d-flex mb-2">
                                        <v-rating :model-value="review.rating" color="amber" density="compact" readonly></v-rating>
                                        <v-spacer></v-spacer>
                                        <div class="text-caption text-grey">{{ review.date }}</div>
                                    </div>
                                    <h4 class="text-subtitle-1 font-weight-bold mb-2">{{ review.title }}</h4>
                                    <p>{{ review.comment }}</p>
                                    <div class="d-flex mt-4 align-center">
                                        <v-avatar size="32" class="mr-3">
                                            <v-img :src="review.userAvatar" alt="Kullanıcı"></v-img>
                                        </v-avatar>
                                        <div class="font-weight-medium">{{ review.userName }}</div>
                                        <v-spacer></v-spacer>
                                        <v-btn variant="text" size="small" prepend-icon="mdi-thumb-up">
                                            Faydalı ({{ review.likes }})
                                        </v-btn>
                                    </div>
                                </v-card>
                                
                                <!-- Daha Fazla Yorum Butonu -->
                                <div class="text-center mt-6" v-if="productReviews.length >= 3">
                                    <v-btn variant="outlined" color="primary">
                                        Daha Fazla Değerlendirme Göster
                                    </v-btn>
                                </div>
                            </v-card-text>
                        </v-window-item>
                    </v-window>
                </v-card>
            </v-col>
        </v-row>

        <!-- İlgili Ürünler -->
        <v-row justify="center" class="mb-16">
            <v-col cols="12" md="10">
                <h2 class="text-h5 font-weight-bold mb-6">Benzer Ürünler</h2>
                
                <v-slide-group show-arrows class="mb-4">
                    <v-slide-group-item v-for="(benzerUrun, index) in benzerUrunler" :key="index">
                        <v-card width="280" class="ma-2" elevation="2" @click="goToProduct(benzerUrun._id)">
                            <v-img :src="benzerUrun.imageUrl || '/api/placeholder/280/200'" height="200" cover>
                                <template v-slot:placeholder>
                                    <v-row class="fill-height ma-0" align="center" justify="center">
                                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                                    </v-row>
                                </template>
                                <div class="fill-height d-flex flex-column justify-end">
                                    <div class="pa-2">
                                        <v-chip v-if="benzerUrun.isNew" color="primary" size="x-small" class="text-caption">Yeni</v-chip>
                                        <v-chip v-if="benzerUrun.discount" color="error" size="x-small" class="text-caption ml-1">%{{ benzerUrun.discount }}</v-chip>
                                    </div>
                                </div>
                            </v-img>
                            <v-card-item>
                                <v-chip color="primary" size="small" class="mb-2">{{ benzerUrun.category }}</v-chip>
                                <v-card-title class="text-subtitle-1 font-weight-bold text-truncate">
                                    {{ benzerUrun.title }}
                                </v-card-title>
                                <v-card-text class="pa-0 pt-2">
                                    <div class="d-flex align-center mb-2">
                                        <v-rating
                                            :model-value="benzerUrun.rating || 4"
                                            color="amber"
                                            density="compact"
                                            size="small"
                                            readonly
                                            half-increments
                                        ></v-rating>
                                        <span class="text-caption ml-1">({{ benzerUrun.reviewCount || 12 }})</span>
                                    </div>
                                    <div class="d-flex align-center">
                                        <strong class="text-primary text-h6">{{ formatPrice(benzerUrun.price) }}</strong>
                                        <span v-if="benzerUrun.oldPrice" class="text-decoration-line-through text-grey ml-2">
                                            {{ formatPrice(benzerUrun.oldPrice) }}
                                        </span>
                                    </div>
                                </v-card-text>
                            </v-card-item>
                            <v-card-actions>
                                <v-btn variant="flat" color="primary" block prepend-icon="mdi-cart-plus">
                                    Sepete Ekle
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-slide-group-item>
                </v-slide-group>
            </v-col>
        </v-row>

        <!-- En Son Görüntülenenler -->
        <v-row justify="center" class="mb-16">
            <v-col cols="12" md="10">
                <h2 class="text-h5 font-weight-bold mb-6">Son İncelediğiniz Ürünler</h2>
                <v-row>
                    <v-col v-for="(recentProduct, index) in recentlyViewed" :key="index" cols="6" sm="4" md="3">
                        <v-card height="100%" elevation="1" @click="goToProduct(recentProduct._id)">
                            <v-img :src="recentProduct.imageUrl" height="180" cover></v-img>
                            <v-card-item>
                                <v-card-title class="text-body-1 font-weight-medium">{{ recentProduct.title }}</v-card-title>
                                <v-card-text class="pa-0 pt-2">
                                    <strong class="text-primary">{{ formatPrice(recentProduct.price) }}</strong>
                                </v-card-text>
                            </v-card-item>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <!-- Geri Dön Butonu -->
        <v-row justify="center" class="mt-8">
            <v-col cols="12" class="text-center">
                <v-btn color="primary" prepend-icon="mdi-arrow-left" to="/urunler">
                    Ürünler Sayfasına Dön
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
    
    <!-- Görsel Galerisi Dialog -->
    <v-dialog v-model="openGallery" max-width="1000">
        <v-card>
            <v-toolbar color="primary" density="compact">
                <v-toolbar-title class="text-white">{{ product.title }}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="openGallery = false">
                    <v-icon color="white">mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text class="pa-0">
                <v-carousel height="600" hide-delimiters show-arrows="hover">
                    <v-carousel-item v-for="(img, i) in productImages" :key="i" :src="img" cover></v-carousel-item>
                </v-carousel>
            </v-card-text>
        </v-card>
    </v-dialog>
    
    <!-- Sepete Eklendi Snackbar -->
    <v-snackbar v-model="cartSnackbar" color="success" timeout="3000" location="top">
        Ürün sepete eklendi!
        <template v-slot:actions>
            <v-btn variant="text" @click="cartSnackbar = false">Kapat</v-btn>
            <v-btn variant="text" to="/sepet">Sepete Git</v-btn>
        </template>
    </v-snackbar>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const productId = route.params.id;

// Ürün verisi
const product = ref({});
const benzerUrunler = ref([]);
const yorumlar = ref([]);

// UI State
const activeTab = ref('description');
const selectedColor = ref(0);
const selectedSize = ref(0);
const quantity = ref(1);
const openGallery = ref(false);
const cartSnackbar = ref(false);
const newReviewRating = ref(5);
const newReviewTitle = ref('');
const newReviewText = ref('');

// Dummy veriler (gerçek verileri store'dan alabilirsiniz)
const productImages = computed(() => [
    product.value.imageUrl || '/api/placeholder/600/600',
    '/api/placeholder/600/600?text=Ürün+Görseli+2',
    '/api/placeholder/600/600?text=Ürün+Görseli+3',
    '/api/placeholder/600/600?text=Ürün+Görseli+4',
]);

const productColors = ref([
    { name: 'Siyah', value: 'black' },
    { name: 'Beyaz', value: 'white' },
    { name: 'Mavi', value: 'blue' },
    { name: 'Kırmızı', value: 'red' },
]);

const productSizes = ref(['S', 'M', 'L', 'XL', 'XXL']);

const productSpecs = computed(() => ({
    'Marka': product.value.brand || 'Markasız',
    'Malzeme': product.value.material || 'Pamuk, Polyester',
    'Menşei': product.value.origin || 'Türkiye',
    'Garanti': product.value.warranty || '2 Yıl',
    'Ürün Kodu': product.value._id || 'URUN-' + Math.floor(Math.random() * 10000),
    'Beden': productSizes.value[selectedSize.value],
    'Renk': productColors.value[selectedColor.value]?.name,
}));

const productReviews = ref([
    {
        userName: 'Ali Yılmaz',
        userAvatar: '/api/placeholder/40/40?text=AY',
        date: '15.04.2025',
        rating: 5,
        title: 'Harika bir ürün!',
        comment: 'Ürünün kalitesi beklentilerimin üzerinde çıktı. Teslimat da çok hızlıydı. Kesinlikle tavsiye ederim.',
        likes: 12,
    },
    {
        userName: 'Ayşe Kaya',
        userAvatar: '/api/placeholder/40/40?text=AK',
        date: '10.04.2025',
        rating: 4,
        title: 'Güzel fakat...',
        comment: 'Ürün genel olarak iyi fakat beden tablosu biraz yanıltıcı olabilir. Bir beden büyük almanızı tavsiye ederim.',
        likes: 8,
    },
    {
        userName: 'Mehmet Demir',
        userAvatar: '/api/placeholder/40/40?text=MD',
        date: '05.04.2025',
        rating: 5,
        title: 'Tam aradığım ürün',
        comment: 'Uzun süredir aradığım tarzda bir ürün. Fiyat/performans açısından oldukça iyi. Teşekkürler!',
        likes: 15,
    },
]);

const recentlyViewed = ref([
    {
        _id: '123',
        title: 'Spor Ayakkabı',
        price: 799.90,
        imageUrl: '/api/placeholder/200/200?text=Spor+Ayakkabı',
    },
    {
        _id: '456',
        title: 'Deri Cüzdan',
        price: 349.90,
        imageUrl: '/api/placeholder/200/200?text=Deri+Cüzdan',
    },
    {
        _id: '789',
        title: 'Kot Pantolon',
        price: 599.90,
        imageUrl: '/api/placeholder/200/200?text=Kot+Pantolon',
    },
    {
        _id: '012',
        title: 'Güneş Gözlüğü',
        price: 450.00,
        imageUrl: '/api/placeholder/200/200?text=Güneş+Gözlüğü',
    },
]);

// Breadcrumbs
const breadcrumbs = computed(() => [
    {
        title: 'Ana Sayfa',
        disabled: false,
        to: '/',
    },
    {
        title: 'Ürünler',
        disabled: false,
        to: '/urunler',
    },
    {
        title: product.value.category || 'Kategori',
        disabled: false,
        to: `/kategori/${product.value.category}`,
    },
    {
        title: product.value.title || 'Ürün',
        disabled: true,
    },
]);

// Methods
const formatPrice = (price) => {
    if (!price) return '₺0.00';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
};

const selectMainImage = (img) => {
    product.value.imageUrl = img;
};

const addToCart = () => {
    // Burada sepete ekleme işlemi yapılabilir
    cartSnackbar.value = true;
};

const goToProduct = (id) => {
    router.push(`/urunler/${id}`);
};

const getRatingPercentage = (rating) => {
    // Normalde burayı API'den gelen verilerle hesaplayabilirsiniz
    const percentages = {
        5: 70,
        4: 20,
        3: 5,
        2: 3,
        1: 2
    };
    return percentages[rating] || 0;
};

const getRatingCount = (rating) => {
    // Burayı da API'den gelen verilerle hesaplayabilirsiniz
    const total = product.value.reviewCount || 24;
    const percentages = {
        5: 70,
        4: 20,
        3: 5,
        2: 3,
        1: 2
    };
    return Math.round((percentages[rating] * total) / 100);
};

// Ürünün detaylarını getir
const getProductDetay = async () => {
    try {
        product.value = await productStore.fetchProductById(productId);
        
        // Eğer ürün fiyatı yoksa varsayılan değer ata (gerçek projede buna gerek olmayabilir)
        if (!product.value.price) {
            product.value.price = 1299.90;
        }
        
        // Stoktaki durumu belirt (gerçek projede API'den gelecektir)
        product.value.inStock = true;
        
        console.log("product", product.value);
        benzerUrunler.value = await productStore.fetchRelatedProduct(productId);
        
        // Benzer ürünlere dummy fiyat ve puan ekle
        benzerUrunler.value = benzerUrunler.value.map(item => ({
            ...item,
            price: Math.round(Math.random() * 1000 + 500) + 0.90,
            rating: (Math.random() * 2 + 3).toFixed(1),
            isNew: Math.random() > 0.7,
            discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30 + 10) : null,
            oldPrice: Math.random() > 0.7 ? Math.round(Math.random() * 1500 + 800) + 0.90 : null,
        }));
    } catch (error) {
        console.error('Ürün detayları alınamadı:', error);
    }
};

onMounted(async () => {
    await getProductDetay();
});
</script>

<style scoped>
/* Ana stiller */
.v-card {
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
}

/* Ana ürün görselleri */
.product-main-image {
  cursor: zoom-in;
  transition: opacity 0.2s ease;
  border-radius: 8px;
}

.product-main-image:hover {
  opacity: 0.9;
}

.product-thumbnail {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  border-radius: 6px;
}

.product-thumbnail:hover {
  border-color: rgb(var(--v-theme-primary));
  transform: scale(1.05);
}

.product-thumbnail.active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.3);
}

/* Ürün içerik stilleri */
.product-icerik {
  line-height: 1.8;
  font-size: 1.05rem;
}

.product-icerik p {
  margin-bottom: 1.5rem;
}

.product-icerik h3 {
  margin: 2rem 0 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.product-icerik img {
  max-width: 100%;
  border-radius: 8px;
  margin: 1.5rem 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.product-icerik blockquote {
  padding: 1rem 1.5rem;
  border-left: 4px solid rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
  margin: 1.5rem 0;
  font-style: italic;
  border-radius: 0 8px 8px 0;
}

.product-icerik ul, .product-icerik ol {
  margin-bottom: 1.5rem;
  margin-left: 1.5rem;
}

.product-icerik li {
  margin-bottom: 0.5rem;
}

/* Varyant seçimleri */
.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  margin-right: 10px;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #e0e0e0;
  transition: all 0.2s ease;
}

.color-option.active {
  transform: scale(1.1);
  box-shadow: 0 0 0 2px rgb(var(--v-theme-primary));
}

.size-option {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.size-option.active {
  background-color: rgb(var(--v-theme-primary));
  color: white;
  border-color: rgb(var(--v-theme-primary));
}

.size-option:hover:not(.active) {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

/* Quantity selector */
.quantity-selector input {
  text-align: center;
  font-weight: bold;
}

/* Carousel düzenlemeleri */
.v-carousel .v-carousel__controls {
  background: rgba(0, 0, 0, 0.3);
  padding: 8px;
  border-radius: 24px;
}

/* Tab içerikleri */
.tab-content {
  min-height: 300px;
  padding: 24px;
}

/* İndirim badge'i */
.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  background-color: rgb(var(--v-theme-error));
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

/* Rating yıldızları */
.rating-container {
  display: flex;
  align-items: center;
}

.rating-container .v-rating {
  max-width: 120px;
}

/* Değerlendirme kartları */
.review-card {
  border-left: 3px solid rgb(var(--v-theme-primary));
  transition: transform 0.2s ease;
}

.review-card:hover {
  transform: translateX(4px);
}

/* Breadcrumb stilleri */
.v-breadcrumbs {
  padding: 12px 0;
}

.v-breadcrumbs a {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

/* Detay bölümleri */
.details-section {
  margin-bottom: 40px;
}

.details-section h2 {
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.3);
  padding-bottom: 8px;
  margin-bottom: 24px;
}

/* Slide grup */
.v-slide-group__content {
  padding: 8px 0;
}

/* Animasyonlar */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.animate-pulse {
  animation: pulse 2s infinite;
}

/* Stok durumu göstergesi */
.stock-indicator {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
}

.stock-indicator.in-stock {
  background-color: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
}

.stock-indicator.out-of-stock {
  background-color: rgba(var(--v-theme-error), 0.1);
  color: rgb(var(--v-theme-error));
}

/* Responsive düzenlemeler */
@media (max-width: 960px) {
  .product-main-image {
    height: 350px !important;
  }
  
  .product-thumbnail {
    height: 70px !important;
  }
}

@media (max-width: 600px) {
  .product-main-image {
    height: 300px !important;
  }
  
  .product-thumbnail {
    height: 60px !important;
  }
  
  .v-card-title.text-h3 {
    font-size: 1.5rem !important;
  }
  
  .text-h4 {
    font-size: 1.3rem !important;
  }
}
</style>