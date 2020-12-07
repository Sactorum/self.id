const Ceramic = require('@ceramicnetwork/http-client').default
const { IDX } = require('@ceramicstudio/idx')
const { Ed25519Provider } = require('key-did-provider-ed25519')
const fromString = require('uint8arrays/from-string')

const ceramic = new Ceramic('http://localhost:7007')

async function run() {
  const seed = fromString(
    '08b2e655d239e24e3ca9aa17bc1d05c1dee289d6ebf0b3542fd9536912d51ee0',
    'base16'
  )
  await ceramic.setDIDProvider(new Ed25519Provider(seed))

  const idx = new IDX({ ceramic })
  await idx.set('basicProfile', {
    name: 'Bob Ceramic',
    emoji: '👻',
    description:
      'Curabitur vel aliquet mauris, ac varius dolor. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum feugiat massa vel odio molestie posuere. Praesent aliquam velit dui. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Curabitur accumsan eros et pulvinar auctor. Nunc sapien lorem, ultricies id mauris a, bibendum accumsan sapien.',
    background: 'http://localhost:3000/temp/test-background.jpg',
    image: 'http://localhost:3000/temp/test-avatar.jpg',
    homeLocation: 'New York City',
    residenceCountry: 'US',
    url: 'https://ceramic.network',
  })
  console.log(`DID with profile: ${idx.id}`)

  process.exit(0)
}

run().catch(console.error)
