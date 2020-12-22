import { Box } from 'grommet'
import dynamic from 'next/dynamic'

import logoPNG from '../images/logo.png'
import logoWebP from '../images/logo.webp'

const AccountButton = dynamic(() => import('../client/components/AccountButton'), {
  ssr: false,
})

export default function Navbar() {
  return (
    <Box background="white" direction="row" height="80px" pad={{ horizontal: 'medium' }}>
      <Box flex={false} margin={{ top: 'medium' }}>
        <picture>
          <source srcSet={logoWebP} type="image/webp" />
          <source srcSet={logoPNG} type="image/png" />
          <img src={logoPNG} alt="Self.ID" />
        </picture>
      </Box>
      <Box flex="grow" align="end" justify="center">
        <AccountButton />
      </Box>
    </Box>
  )
}
