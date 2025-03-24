import axios from "axios";
import { defineStore } from "pinia";

export const useProductStore = defineStore("product", {
  state: () => ({
    product: [],
    detailProduct: [],
    upcomingProduct: [],
    relatedProduct: [],
    loading: false,
    error: null,
  }),

  actions: {
    // Tüm etkinlikleri getir
    async fetchProduct() {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch("http://localhost:5000/api/product/");
        console.log("fecht product response", response);
        this.product = response.product;
        console.log("product", this.product);
      } catch (error) {
        console.error("Etkinlikler yüklenirken hata:", error);
        this.error = "Etkinlikler yüklenirken bir hata oluştu";
      } finally {
        this.loading = false;
      }
    },

    async fetchProductById(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch(`http://localhost:5000/api/product/` + id);
        console.log("fecht product detail response", response);
        this.detailProduct = response.product;
        return this.detailProduct;
      } catch (error) {
        console.error("Etkinlik yüklenirken hata:", error);
        this.error = "Etkinlik yüklenirken bir hata oluştu";
      } finally {
        this.loading = false;
      }
    },
    async fetchRelatedProduct(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch(`http://localhost:5000/api/product/related/` + id);
        console.log("fecht related response", response);
        this.relatedProduct = response.relatedProduct;
        console.log("relatedProduct", this.relatedProduct);
        return this.relatedProduct;
      } catch (error) {
        console.error("Etkinlikler yüklenirken hata:", error);
        this.error = "Etkinlikler yüklenirken bir hata oluştu";
      } finally {
        this.loading = false;
      }
    },

    // Yaklaşan etkinlikleri getir
    async fetchUpcomingProduct() {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch("http://localhost:5000/api/product/upcoming");
        const data = await response.json();
        this.upcomingProduct = data;
      } catch (error) {
        console.error("Yaklaşan etkinlikler yüklenirken hata:", error);
        this.error = "Yaklaşan etkinlikler yüklenirken bir hata oluştu";
      } finally {
        this.loading = false;
      }
    },

    // Yeni etkinlik oluştur
    async createProduct(formData) {
      console.log("çalıştı pina");
      this.loading = true;
      this.error = null;
      try {
        const { data } = await axios.post(
          "http://localhost:5000/api/product/",
          formData
        );
        console.log("response ", data);
        this.product = data;
        return this.product
      } catch (error) {
        console.error("Etkinlik oluşturulurken hata:", error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(productId, formData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(
          `http://localhost:5000/api/product/${productId}`,
          {
            method: "PUT",
            body: formData,
          }
        );
        const data = await response.json();
        if (response.ok) {
          // Güncellenen etkinliği listede güncelle
          const index = this.product.findIndex((product) => product._id === productId);
          if (index !== -1) {
            this.product[index] = data.product;
          }
          return { success: true, message: "Etkinlik başarıyla güncellendi" };
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error("Etkinlik güncellenirken hata:", error);
        this.error = "Etkinlik güncellenirken bir hata oluştu";
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },


    async deleteProduct(productId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(
          `http://localhost:5000/api/product/${productId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          // Silinen etkinliği listeden kaldır
          this.product = this.product.filter((product) => product._id !== productId);
          return { success: true, message: "Etkinlik başarıyla silindi" };
        } else {
          const data = await response.json();
          throw new Error(data.message);
        }
      } catch (error) {
        console.error("Etkinlik silinirken hata:", error);
        this.error = "Etkinlik silinirken bir hata oluştu";
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },
  },

  getters: {
    // Tüm etkinlikleri getir
    getProduct: (state) => state.product,

    // Yaklaşan etkinlikleri getir
    getupcomingProduct: (state) => state.upcomingProduct,

    // Yükleniyor durumunu getir
    isLoading: (state) => state.loading,

    // Hata durumunu getir
    getError: (state) => state.error,
  },
});
