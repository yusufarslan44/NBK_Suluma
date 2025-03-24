// // ~/composables/useProduct.js
// export function useProduct() {
//     const config = useRuntimeConfig();
//     const baseUrl = `${config.public.apiUrl}/api/product`;

//     // All products
//     const {
//         data: products,
//         refresh: fetchProducts,
//         pending: productsLoading,
//         error: productsError
//     } = useAsyncData(
//         "products",
//         () => $fetch(baseUrl),
//         {
//             server: true,
//             onResponseError(error) {
//                 console.error('Error fetching products:', error);
//                 return error;
//             }
//         }
//     );

//     // Single product by ID
//     const fetchProductById = async (id) => {
//         const {
//             data: detailProduct,
//             pending,
//             error
//         } = await useAsyncData(
//             `product-${id}`,
//             () => $fetch(`${baseUrl}/${id}`),
//             {
//                 server: true,
//                 onResponseError(error) {
//                     console.error(`Error fetching product with ID ${id}:`, error);
//                     return error;
//                 }
//             }
//         );

//         return {
//             detailProduct,
//             loading: pending,
//             error
//         };
//     };

//     // Related products
//     const fetchRelatedProducts = async (id) => {
//         const {
//             data: relatedProducts,
//             pending,
//             error
//         } = await useAsyncData(
//             `related-products-${id}`,
//             () => $fetch(`${baseUrl}/related/${id}`),
//             {
//                 server: true,
//                 onResponseError(error) {
//                     console.error(`Error fetching related products for ID ${id}:`, error);
//                     return error;
//                 }
//             }
//         );

//         return {
//             relatedProducts,
//             loading: pending,
//             error
//         };
//     };

//     // Upcoming products
//     const {
//         data: upcomingProducts,
//         refresh: fetchUpcomingProducts,
//         pending: upcomingLoading,
//         error: upcomingError
//     } = useAsyncData(
//         "upcoming-products",
//         () => $fetch(`${baseUrl}/upcoming`),
//         {
//             server: true,
//             onResponseError(error) {
//                 console.error('Error fetching upcoming products:', error);
//                 return error;
//             }
//         }
//     );

//     // Create product
//     const createProduct = async (formData) => {
//         try {
//             const response = await $fetch(baseUrl, {
//                 method: 'POST',
//                 body: formData
//             });

//             // Refresh the products list after creating a new product
//             await fetchProducts();

//             return { success: true, data: response };
//         } catch (error) {
//             console.error('Error creating product:', error);
//             return { success: false, error };
//         }
//     };

//     // Update product
//     const updateProduct = async (productId, formData) => {
//         try {
//             const response = await $fetch(`${baseUrl}/${productId}`, {
//                 method: 'PUT',
//                 body: formData
//             });

//             // Refresh the products list after updating
//             await fetchProducts();

//             return { success: true, data: response };
//         } catch (error) {
//             console.error(`Error updating product with ID ${productId}:`, error);
//             return { success: false, error };
//         }
//     };

//     // Delete product
//     const deleteProduct = async (productId) => {
//         try {
//             await $fetch(`${baseUrl}/${productId}`, {
//                 method: 'DELETE'
//             });

//             // Refresh the products list after deleting
//             await fetchProducts();

//             return { success: true, message: 'Ürün başarıyla silindi' };
//         } catch (error) {
//             console.error(`Error deleting product with ID ${productId}:`, error);
//             return { success: false, error, message: 'Ürün silinirken bir hata oluştu' };
//         }
//     };

//     return {
//         // Data
//         products,
//         upcomingProducts,

//         // Loading states
//         productsLoading,
//         upcomingLoading,

//         // Errors
//         productsError,
//         upcomingError,

//         // Functions
//         fetchProducts,
//         fetchProductById,
//         fetchRelatedProducts,
//         fetchUpcomingProducts,
//         createProduct,
//         updateProduct,
//         deleteProduct
//     };
// }