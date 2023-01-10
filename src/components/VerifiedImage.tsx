import * as React from 'react';

import Button from '@/components/buttons/Button';

export default function VerifiedImage() {
  const [isFetching, setIsFetching] = React.useState(false);

  const onFetchCID = React.useCallback(async () => {
    setIsFetching(true);
    const request = await fetch(
      'https://bafybeicklkqcnlvtiscr2hzkubjwnwjinvskffn4xorqeduft3wq7vm5u4.ipfs.cf-ipfs.com/',
      {
        headers: {
          Accept: 'application/vnd.ipld.car',
        },
      }
    );
    if (!request.ok) {
      throw new Error('failed to fetch image');
    }
    // TODO: verify the response and render
    setIsFetching(false);
  }, [setIsFetching]);

  return (
    <div>
      <div className='my-4 flex flex-wrap'>
        <Button onClick={onFetchCID} isLoading={isFetching} variant='primary'>
          Fetch CID
        </Button>
      </div>
    </div>
  );
}
