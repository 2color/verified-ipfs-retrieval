import * as React from 'react'

import Layout from '@/components/layout/Layout'
import ArrowLink from '@/components/links/ArrowLink'
import UnderlineLink from '@/components/links/UnderlineLink'
import Seo from '@/components/Seo'
import VerifiedImage from '@/components/VerifiedImage'

/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */
import IPFS from '~/svg/ipfs.svg'

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

export default function HomePage() {
  return (
    <Layout>
      {/* <Seo templateTitle='Home' /> */}
      <Seo />

      <main className='bg-gradient-to-t from-red-100 to-cyan-400'>
        <section className=''>
          <IPFS className='ml-5 text-8xl' />
          <div className='layout flex min-h-screen flex-col items-center justify-center text-center'>
            <h1 className='m-5 text-teal-700'>Verified IPFS Retrieval</h1>

            <p className='mt-2 text-sm text-gray-700'>
              <ArrowLink href='https://github.com/ipfs/specs/blob/main/http-gateways/TRUSTLESS_GATEWAY.md'>
                Trustless IPFS Gateway Spec
              </ArrowLink>
            </p>
            <VerifiedImage />

            <footer className='absolute bottom-2 text-gray-700'>
              Built with ❤️ by{' '}
              <UnderlineLink href='https://twitter.com/daniel2color'>
                Daniel
              </UnderlineLink>
              {' | '}
              <UnderlineLink href='https://github.com/2color/verified-ipfs-retrieval'>
                Source code
              </UnderlineLink>
            </footer>
          </div>
        </section>
      </main>
    </Layout>
  )
}
