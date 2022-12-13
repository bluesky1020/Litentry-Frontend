import React from 'react';
import {
  Button,
  Flex,
  ChakraProvider,
  Container,
  Stack,
  Image,
  theme,
  Text,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { stringToHex } from "@polkadot/util";
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { authUser, checkSession, getSecret } from './helpers/api-endpoints-wrapper';

const STORAGE_KEY = process.env.REACT_APP_STORAGE_KEY || 'litentry';

function App() {
  const [loading, setLoading] = React.useState(true);
  const [authenticated, setAuthentication] = React.useState(false);
  const [account, setAccount] = React.useState(null);
  const [secretCode, setSecretCode] = React.useState('');
  const toast = useToast();
  const toastIdRef = React.useRef();

  React.useEffect(() => {
    initPolkadot();
  }, []);

  React.useEffect(() => {
    if (!account) return;
    checkAuth();
  }, [account]);

  const showToast = (description, status) => {
    toastIdRef.current = toast({
      description,
      status
    });
  }

  const getSecretCode = async () => {
    const hash = localStorage.getItem(STORAGE_KEY);
    if (!hash) return;
    try {
      const res = await getSecret(account.address, hash);
      setSecretCode(res);
    } catch (error) {
      console.log('Check Session Error:', error);
      showToast(error.message ?? 'Something went wrong', 'error');
    }
  }

  const checkAuth = async () => {
    const hash = localStorage.getItem(STORAGE_KEY);
    if (!hash) return;
    try {
      const isValid = await checkSession({
        address: account.address,
        hash
      });
      if (isValid) {
        setAuthentication(true);
        showToast('Successfully authenticated', 'success');
        getSecretCode();
      }
    } catch (error) {
      console.log('Check Session Error:', error);
      showToast(error.message ?? 'Something went wrong', 'error');
    }
  }

  const initPolkadot = async () => {
    setLoading(true);
    try {
      await web3Enable('Litentry');
      const allAccounts = await web3Accounts();
      if (allAccounts.length === 0) {
        showToast('There is no enabled polkadot extension.', 'error');
      } else {
        showToast('Wallet Connected', 'success');
        setAccount(allAccounts[0]);
      }
    } catch (error) {
      console.log('Polkadot Initialization Error:', error);
      showToast(error.message ?? 'Something went wrong', 'error');
    }
    setLoading(false);
  }

  const signIn = async () => {
    if (!account) return;
    const injector = await web3FromSource(account.meta.source);
    const signRaw = injector?.signer?.signRaw;
    const message = `Sign-in request for addres ${account.address}`;
    if (!!signRaw) {
      const { signature } = await signRaw({
        address: account.address,
        data: stringToHex(message),
        type: 'bytes'
      });
      try {
        const hash = await authUser({
          address: account.address,
          signature,
          message
        });
        localStorage.setItem(STORAGE_KEY, hash);
        showToast('Successfully authenticated', 'success');
        setAuthentication(true);
        getSecretCode();
      } catch (error) {
        console.log('Auth error: ', error);
        showToast(error.message ?? 'Something went wrong', 'error');
      }
    }
  }

  return (
    <ChakraProvider theme={theme}>
      <Flex p={4} w='100%' align='center' justify='space-between'>
        <Image src='/favicon.ico' alt="Litentry Logo" htmlWidth='30' />
        <ColorModeSwitcher />
      </Flex>
      <Flex minH='90vh' align='center'>
        <Container centerContent>
          {loading ? <Spinner size="xl" /> : 
            <Stack spacing={4} direction="column" align="center">
              {!account ? <Button colorScheme="teal" size="md" onClick={() => initPolkadot()}>
                Connect Wallet
              </Button> : 
              (
                authenticated ? 
                  <Text fontSize='4xl'>
                    YOUR SECRET CODE: {secretCode}
                  </Text> :
                  <Button colorScheme="green" size="md" onClick={() => signIn()}>
                    Sign In
                  </Button>
              )
              }
            </Stack>
          }
        </Container>
      </Flex>
    </ChakraProvider>
  );
}

export default App;
