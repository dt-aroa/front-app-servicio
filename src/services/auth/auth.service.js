import http from '@/libs/http'

const baseUrl = import.meta.env.VITE_VUE_APP_MICROSERVICE_API_SECURITY

export default class AuthService {
  signIn(data) {
    return http.post(`${baseUrl}/login`, data, {
      headers: {
        loading: true,
      },
    })
  }
  getUser() {
    return http.get(`${baseUrl}/me`, {
      headers: {
        loading: true,
      },
    })
  }
}
