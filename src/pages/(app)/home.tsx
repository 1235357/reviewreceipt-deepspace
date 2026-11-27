import {Navigate} from 'react-router-dom'
import {useAuthStatus} from 'deepspace'
export default function HomePage(){const {isSignedIn}=useAuthStatus();return <Navigate to={isSignedIn?'/blind':'/'} replace/>}
