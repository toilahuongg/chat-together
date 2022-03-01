import axios from "axios";

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APP_URL
  });

if (typeof window !== undefined) {
    instance.interceptors.request.use(
        (config) => {
          const token = window.localStorage.getItem('token');
          if (token && config.headers) {
            config.headers['Authorization'] = 'Bearer '+ token;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );
      instance.interceptors.response.use(
        (res) => {
          return res;
        },
        async (err) => {
          const originalConfig = err.config;
          if (originalConfig.url !== "/api/auth/sign-in" && err.response) {
            // Access Token was expired
            if (err.response.status === 401 && !originalConfig._retry) {
              originalConfig._retry = true;
              try {
                const rs = await instance.post("/api/auth/refresh-token", {
                  refreshToken: window.localStorage.getItem('refreshToken'),
                });
                const { token } = rs.data;
                window.localStorage.setItem('token', token)
                return instance(originalConfig);
              } catch (_error) {
                return Promise.reject(_error);
              }
            }
          }
          return Promise.reject(err);
        }
      );
}

export default instance;