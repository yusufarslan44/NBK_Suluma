<template>
    <div>
        <!-- Ürün Oluşturma Formu -->
        <v-card class="mb-6" elevation="2" hover>
            <v-card-title class="d-flex align-center">
                <v-icon size="24" color="primary" class="mr-2">mdi-package-variant-plus</v-icon>
                Yeni Ürün Ekle
            </v-card-title>

            <v-card-text>
                <v-form @submit.prevent="handleProductCreate">
                    <v-text-field v-model="productForm.title" label="Ürün Adı" required></v-text-field>

                    <v-text-field v-model.number="productForm.price" label="Fiyat" type="number" prefix="₺"
                        required></v-text-field>

                    <div class="my-2" style="border: 2px solid #ccc;">
                        <client-only>
                            <QuillEditor ref="quillEditor" v-model:content="productForm.description" content-type="html"
                                theme="snow" :toolbar="customToolbar" placeholder="Ürün açıklamasını girin..." />
                        </client-only>
                    </div>

                    <v-file-input v-model="productForm.image" label="Ürün Görseli" accept="image/*"
                        required></v-file-input>

                    <v-select v-model="productForm.category" :items="categories" label="Kategori" required></v-select>

                    <v-switch v-model="productForm.isFeatured" label="Ürünü Öne Çıkar"></v-switch>

                    <v-btn type="submit" color="primary" :loading="productStore.isLoading" block>
                        Ürün Oluştur
                    </v-btn>
                </v-form>
            </v-card-text>
        </v-card>

        <!-- Ürün Listesi -->
        <v-card elevation="2" hover>
            <v-card-title class="d-flex align-center">
                <v-icon size="24" color="primary" class="mr-2">mdi-package-variant-multiple</v-icon>
                Mevcut Ürünler
            </v-card-title>
            <v-card-text>
                <v-table>
                    <thead>
                        <tr>
                            <th>Görsel</th>
                            <th>Ürün Adı</th>
                            <th>Fiyat</th>
                            <th>Tarih</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="product in productStore.getProduct" :key="product._id">
                            <td>
                                <v-img :src="product.imageUrl" width="100" aspect-ratio="1" cover></v-img>
                            </td>
                            <td>{{ product.title }}</td>
                            <td>₺{{ product.price }}</td>
                            <td>{{ new Date(product.createdAt).toLocaleDateString('tr-TR') }}</td>
                            <td>
                                <v-btn icon="mdi-eye" color="info" variant="text" class="mr-2"
                                    @click="openProductDetails(product)"></v-btn>
                                <v-btn icon="mdi-pencil" color="warning" variant="text" class="mr-2"
                                    @click="openProductEdit(product)"></v-btn>
                                <v-btn icon="mdi-delete" color="error" variant="text"
                                    @click="handleProductDelete(product._id)" :loading="productStore.isLoading"></v-btn>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card-text>
        </v-card>

        <!-- Ürün Detay Modal -->
        <v-dialog v-model="productDialog" max-width="600">
            <v-card v-if="selectedProduct">
                <v-img :src="selectedProduct.imageUrl" height="300" cover></v-img>
                <v-card-title>{{ selectedProduct.title }}</v-card-title>
                <v-card-text>
                    <p class="text-body-1 mb-2"><strong>Fiyat:</strong> ₺{{ selectedProduct.price.toFixed(2) }}</p>
                    <p class="text-body-1 mb-2" v-html="selectedProduct.description"></p>
                    <v-list>
                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon>mdi-calendar</v-icon>
                            </template>
                            <v-list-item-title>
                                {{ new Date(selectedProduct.createdAt).toLocaleDateString('tr-TR') }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="text" @click="productDialog = false">
                        Kapat
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Ürün Düzenleme Modal -->
        <v-dialog v-model="editProductDialog" max-width="600">
            <v-card v-if="selectedProduct">
                <v-card-title>Ürünü Düzenle</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="handleProductUpdate">
                        <v-text-field v-model="editproductForm.title" label="Ürün Adı" required></v-text-field>

                        <v-text-field v-model.number="editproductForm.price" label="Fiyat" type="number" prefix="₺"
                            required></v-text-field>

                        <div class="my-2" style="border: 2px solid #ccc;">
                            <client-only>
                                <QuillEditor ref="quillEditor" v-model:content="editproductForm.description"
                                    content-type="html" theme="snow" :toolbar="customToolbar" />
                            </client-only>
                        </div>

                        <v-file-input v-model="editproductForm.image" label="Yeni Görsel (İsteğe Bağlı)"
                            accept="image/*"></v-file-input>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" variant="text" @click="editProductDialog = false">
                                İptal
                            </v-btn>
                            <v-btn color="primary" type="submit" :loading="productStore.isLoading">
                                Güncelle
                            </v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { useProductStore } from '~/stores/product'

const productStore = useProductStore()
const productDialog = ref(false)
const editProductDialog = ref(false)
const selectedProduct = ref(null)
const quillEditor = ref(null)
const categories = ["Genel", "Spor", "Teknoloji", "Eğitim", "Kültür-Sanat", "Bilim"];
// const categories = [
//     "Elektronik",
//     "Giyim",
//     "Ev & Bahçe",
//     "Kitap",
//     "Spor",
//     "Kozmetik"
// ];

const productForm = ref({
    title: '',
    description: '',
    price: null,
    image: null,
    category: '',
    isFeatured: false
});

const editproductForm = ref({
    title: '',
    description: '',
    price: null,
    image: null
})

const customToolbar = [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['image'],
    [{ align: [] }],
    ['clean']
]

// Image insertion function remains the same as in the previous version
const insertImageToQuill = (imageUrl) => {
    if (quillEditor.value) {
        const editor = quillEditor.value.getQuill()
        const range = editor.getSelection()
        editor.insertEmbed(range.index, 'image', imageUrl)
    }
}

const handleImageUpload = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')

    input.addEventListener('change', async () => {
        const file = input.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onload = () => {
            insertImageToQuill(reader.result)
        }
    })

    input.click()
}

const handleProductCreate = async () => {
    try {
        if (!productForm.value.title ||
            !productForm.value.description ||
            !productForm.value.image ||
            productForm.value.price === null) {
            alert('Lütfen tüm alanları doldurun!');
            return;
        }

        const formData = new FormData()
        formData.append('title', productForm.value.title);
        formData.append('description', productForm.value.description);
        formData.append('price', productForm.value.price);
        formData.append('image', productForm.value.image[0] || productForm.value.image);
        formData.append('category', productForm.value.category.toLowerCase());
        formData.append('isFeatured', productForm.value.isFeatured);

        const result = await productStore.createProduct(formData)

        if (result.status == "success") {
            // Reset form
            productForm.value = {
                title: '',
                description: '',
                price: null,
                image: null,
                category: '',
                isFeatured: false
            }
            alert('Ürün başarıyla oluşturuldu!')
            await productStore.fetchProduct()
        }
    } catch (error) {
        console.error("Ürün oluşturma hatası:", error);
        alert('Ürün oluşturulurken bir hata oluştu: ' + error.message)
    }
}

const handleProductDelete = async (productId) => {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        await productStore.deleteProduct(productId)
    }
}

const openProductDetails = (product) => {
    selectedProduct.value = product
    productDialog.value = true
}

const openProductEdit = (product) => {
    selectedProduct.value = product
    editproductForm.value = {
        title: product.title,
        description: product.description,
        price: product.price,
        image: null
    }
    editProductDialog.value = true
}

const handleProductUpdate = async () => {
    const formData = new FormData()
    formData.append('title', editproductForm.value.title)
    formData.append('description', editproductForm.value.description)
    formData.append('price', editproductForm.value.price)
    if (editproductForm.value.image) {
        formData.append('image', editproductForm.value.image[0] || editproductForm.value.image)
    }

    const result = await productStore.updateProduct(selectedProduct.value._id, formData)
    if (result.success) {
        editProductDialog.value = false
        await productStore.fetchProduct()
    }
}

onMounted(() => {
    productStore.fetchProduct()
})
</script>

<style scoped>
.v-card {
    transition: transform 0.2s;
}

.v-card:hover {
    transform: translateY(-2px);
}
</style>