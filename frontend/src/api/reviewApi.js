import axios from 'axios'

const API = axios.create({ baseURL: '/api' })

export const analyzeReview = (data) =>
    API.post('/review/analyze', data).then((r) => r.data)

export const bulkUpload = (reviews) =>
    API.post('/review/bulk-upload', { reviews }).then((r) => r.data)

export const getReviews = (params = {}) =>
    API.get('/review', { params }).then((r) => r.data)

export const getStats = () =>
    API.get('/stats').then((r) => r.data)

export const getReviewer = (id) =>
    API.get(`/reviewer/${id}`).then((r) => r.data)

export const getReviewers = (params = {}) =>
    API.get('/reviewer', { params }).then((r) => r.data)

export const getAlerts = (params = {}) =>
    API.get('/alerts', { params }).then((r) => r.data)

export const resolveAlert = (id) =>
    API.patch(`/alerts/${id}/resolve`).then((r) => r.data)

export const getProducts = () =>
    API.get('/products').then((r) => r.data)

export const getProductSentiment = (id) =>
    API.get(`/products/${id}/sentiment`).then((r) => r.data)
