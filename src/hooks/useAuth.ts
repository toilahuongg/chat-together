
export const useAuth = () => {
    return typeof window !== "undefined" ? !!window.localStorage.getItem('token') : false;
}

export default useAuth;