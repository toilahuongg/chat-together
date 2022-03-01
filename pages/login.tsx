import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import axios from 'axios';
import '../src/config/config-firebase';
const LoginPage = () => {

    const signGoogle = () => {
        const provider = new GoogleAuthProvider();
        const auth = getAuth();
        signInWithPopup(auth, provider)
        .then(async (result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const user = result.user;
            const response = await axios.post('/api/auth/sign-in-with-social', { displayName: user.displayName, email: user.email });
            const { token, refreshToken } = response.data;
            window.localStorage.setItem('token', token);
            window.localStorage.setItem('refreshToken', refreshToken);
            await signOut(auth);
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
    }
    return (<button onClick={signGoogle}> Login with Google </button>);
}

export default LoginPage;