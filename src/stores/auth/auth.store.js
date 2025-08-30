import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import AuthService from '@/services/auth/auth.service.js'

const _AuthService = new AuthService()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    _user: JSON.parse(Cookies.get('user') || '{}') || {},
    _cancelTokens: [],
    _permissions: [],
    _people: {
      id: null,
      type_document_id: null,
      number_document: null,
      firt_name: null,
      last_name: null,
      full_name: null,
      email: null,
    },
    _token: Cookies.get('token') || null,
  }),

  getters: {
    getToken: (state) => state._token ?? false,
    getUser: (state) => state._user ?? false,
    getPermissions: (state) => state._permissions,
    getPeople: (state) => state._people,
  },

  actions: {
    saveToken(token) {
      this._token = token
      Cookies.set('token', token, { expires: 365, path: '/' })
    },

    saveUser(user) {
      Cookies.set('user', JSON.stringify(user), { expires: 365, path: '/' })
      this._user = user
    },

    setUserAdmin(admin) {
      this._user.admin = admin
    },

    savePermissions(permissions) {
      this._permissions = permissions
    },

    savePeople(people) {
      this._people = people
    },

    async login(payload) {
      try {
        const loginResponse = await _AuthService.signIn(payload)
        this.saveToken(loginResponse.data.token)
        this.saveUser(loginResponse.data)

        const userInfoResponse = await _AuthService.getUser()
        this.savePermissions(userInfoResponse.data.permissions || [])
        this.savePeople(userInfoResponse.data.people)

        return { success: true, data: userInfoResponse.data }
      } catch (error) {
        console.error('Error en login:', error)
        return {
          success: false,
          data: error.response?.data || {
            message: 'Error de conexión',
            error: error.message,
          },
        }
      }
    },

    async logout() {
      try {
        this._user = null
        this._token = null
        this._permissions = []
        this._people = {
          id: null,
          type_document_id: null,
          number_document: null,
          firt_name: null,
          last_name: null,
          full_name: null,
          email: null,
        }
        Cookies.remove('token')
        Cookies.remove('user')
      } catch (e) {
        console.error('Error en logout:', e)
      }
    },
  },
})
