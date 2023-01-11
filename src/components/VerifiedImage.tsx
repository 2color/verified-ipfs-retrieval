import { Block, CarReader } from '@ipld/car/reader'
import { recursive, UnixFSEntry } from '@web3-storage/fast-unixfs-exporter'
import toIt from 'browser-readablestream-to-it'
import filetype from 'magic-bytes.js'
import { bytes, CID, MultihashHasher } from 'multiformats'
import { sha256 } from 'multiformats/hashes/sha2'
import * as React from 'react'

import Button from '@/components/buttons/Button'
import ButtonLink from '@/components/links/ButtonLink'

const defaultImageCid =
  'bafybeicklkqcnlvtiscr2hzkubjwnwjinvskffn4xorqeduft3wq7vm5u4'
const defaultVideoCid =
  'bafybeicq6y27fphdisjtxaybzxold7dczhvxiiyn3bvkyht7b36lveerrm'

export default function VerifiedImage() {
  const [isFetching, setIsFetching] = React.useState(false)
  const [dataUrl, setDataURL] = React.useState('')
  const [cid, setCid] = React.useState(defaultVideoCid)
  const [fileExt, setFileExt] = React.useState('')
  const [fileMime, setFileMime] = React.useState('')

  const handleCIDChange = React.useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setCid(e.currentTarget.value)
    },
    [setCid]
  )

  const onFetchCID = React.useCallback(async () => {
    setIsFetching(true)
    const files = await ipfsFetch(cid)
    if (files.length === 1) {
      const file = files[0]
      const bytes = new Uint8Array(file.size)
      let offset = 0

      for await (const chunk of file.content()) {
        bytes.set(chunk, offset)
        offset += chunk.length
      }

      // TODO: detect the file type to set the mime type using magic bytes or extension
      const fileType = filetype(bytes)

      fileType[0].extension && setFileExt(fileType[0].extension)
      fileType[0].mime && setFileMime(fileType[0].mime)

      const fileBlob = new Blob([bytes], { type: fileType[0]?.mime })
      const objectURL = URL.createObjectURL(fileBlob)
      setDataURL(objectURL)
    } else {
      // console.error('only single file CARs are supported')
    }
    setIsFetching(false)
  }, [setIsFetching, cid, setFileExt, setFileMime])

  return (
    <div>
      <div className='my-2 flex flex-col justify-center gap-2 '>
        <pre className=''>{`
          CIDs to try out
          Image ${defaultImageCid}
          Video: ${defaultVideoCid}
        `}</pre>
        <input
          type='text'
          placeholder='bafy...'
          onChange={handleCIDChange}
          value={cid}
        ></input>
        <Button
          className=''
          onClick={onFetchCID}
          isLoading={isFetching}
          variant='primary'
        >
          Fetch & Verify CID ({shortenCID(cid)})
        </Button>
      </div>

      {dataUrl && (
        <ButtonLink
          variant='dark'
          className='my-2'
          href={dataUrl}
          download={`from-ipfs.${fileExt}`}
        >
          Download
        </ButtonLink>
      )}
      {dataUrl && fileMime.includes('image') && (
        // @eslint-ignore
        <img
          alt='verified image from IPFS'
          className='my-2 max-w-md'
          src={dataUrl}
        />
      )}
      {dataUrl && fileMime.includes('video') && (
        <video controls>
          <source type={fileMime} src={dataUrl} />
        </video>
      )}
    </div>
  )
}

export async function fetchCar(cid: string, gateway: URL) {
  const url = `${gateway}/ipfs/${cid}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.ipld.car',
    },
  })
  if (res.status > 400) {
    throw new Error(`${res.status} ${res.statusText} ${url}`)
  }
  if (res.body === null) {
    throw new Error(`response is null`)
  }

  return res.body
}

export async function ipfsFetch(ipfsPath: string): Promise<UnixFSEntry[]> {
  const gatewayUrl = new URL(`https://ipfs.io`)
  let cid: string = ipfsPath
  if (ipfsPath.startsWith('/ipfs/')) {
    cid = ipfsPath.substring('/ipfs/'.length)
  }
  if (cid.includes('/')) {
    throw new Error("CIDs with path aren't supported")
    // looks pathish, i.e CID/path! resolve to get the CID for the file in the path
    // console.log(`📡 Resolving CID from ${gatewayUrl}`)
    // cid = await resolveIpfsAddress(ipfsPath, gatewayUrl)
    // console.log(`🎯 ${cid}`)
    // use the last chunk of the path as the output if not set
  }

  // console.log(`📡 Fetching .car for CID ${cid} from ${gatewayUrl}`)
  const carStream = await fetchCar(cid, gatewayUrl)

  const carReader = await CarReader.fromIterable(toIt(carStream))

  const { files } = await getFilesFromCar(cid, carReader)

  // TODO: fix the wrong blockCount
  // console.log(
  //   `🔐 Verified ${blockCount}/${blockCount} block${
  //     blockCount === 1 ? '' : 's'
  //   }`
  // )
  return files
}

export async function getFilesFromCar(cid: string, carReader: CarReader) {
  const files = []
  let blockCount = 0
  const verifyingBlockService = {
    get: async (cid: CID) => {
      const res = (await carReader.get(cid)) as Block
      if (!isValid(res)) {
        throw new Error(`Bad block. Hash does not match CID ${cid}`)
      }
      blockCount++

      return res.bytes
    },
  }

  // traverse the dag
  // @ts-ignore (because verifyingBlockService is missing some of the methods from the type )
  for await (const file of recursive(cid, verifyingBlockService, {})) {
    if (file.type === 'directory') {
      // TODO: handle directories
    } else {
      files.push(file)
    }
  }
  // for some reason this returns before all the blocks have been verified
  return { files, blockCount }
}

export async function isValid({ cid, bytes }: { cid: CID; bytes: Uint8Array }) {
  // console.count('sha256')
  const hashfn = hashes[cid.multihash.code]
  if (!hashfn) {
    throw new Error(`Missing hash function for ${cid.multihash.code}`)
  }
  const hash = await hashfn.digest(bytes)
  return toHex(hash.digest) === toHex(cid.multihash.digest)
}

export function toUrl(str: string): URL {
  if (!str.match('://')) {
    const scheme = ['localhost', '127.0.0.1'].includes(str) ? 'http' : 'https'
    return toUrl(`${scheme}://${str}`)
  }
  return new URL(str)
}

const { toHex } = bytes

interface Hashes {
  [index: number]: MultihashHasher
}

const hashes: Hashes = {
  [sha256.code]: sha256,
}

function shortenCID(cid: string) {
  return `${cid.slice(0, 4)}...${cid.slice(-4)}`
}
