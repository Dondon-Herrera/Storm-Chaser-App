import { Redirect } from 'expo-router';

/** Legacy starter route — sends users to Storm Command. */
export default function ExploreRedirect() {
  return <Redirect href="/" />;
}
