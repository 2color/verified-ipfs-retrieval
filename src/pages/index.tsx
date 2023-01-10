import * as React from 'react';

import Layout from '@/components/layout/Layout';
import ArrowLink from '@/components/links/ArrowLink';
import Seo from '@/components/Seo';
import VerifiedImage from '@/components/VerifiedImage';

/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */
import IPFS from '~/svg/ipfs.svg';

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

export default function HomePage() {
  return (
    <Layout>
      {/* <Seo templateTitle='Home' /> */}
      <Seo />

      <main>
        <section className='bg-white'>
          <div className='layout flex min-h-screen flex-col items-center justify-center text-center'>
            <IPFS className='text-8xl' />
            <h1 className='mt-4'>Verified IPFS Retrieval</h1>
            <p className='mt-2 text-sm text-gray-700'>
              <ArrowLink href='https://github.com/ipfs/specs/blob/main/http-gateways/TRUSTLESS_GATEWAY.md'>
                See the trustless IPFS Gateway Spec
              </ArrowLink>
            </p>
            <VerifiedImage />
          </div>
        </section>
      </main>
    </Layout>
  );
}
