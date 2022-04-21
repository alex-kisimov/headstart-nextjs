import { useRouter } from 'next/router';
import { useOcSelector } from '../ordercloud/redux/ocStore';
import Layout from '../components/Layout';
import SingleService from './singleService';

const Home = () => {
  const { push } = useRouter();
  const { isSupplier } = useOcSelector((s) => ({
      isSupplier: s.ocUser.user?.Supplier !== null
  }));

  if (isSupplier) {
    push('/orderCompletion');
  }

  return <SingleService />
};

Home.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
};

export default Home;
